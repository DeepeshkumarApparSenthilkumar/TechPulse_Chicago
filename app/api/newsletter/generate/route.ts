import { createServiceClient } from '@/lib/supabase/server';
import { generateNewsletterContent } from '@/lib/anthropic';
import { sendNewsletterBatch } from '@/lib/email';
import { NextResponse } from 'next/server';

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // Allow in dev without secret
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

async function run(request: Request, force = false) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date();
  const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Deduplication: don't send if already sent this month (unless forced)
  if (!force) {
    const { data: existing } = await supabase
      .from('newsletter_issues')
      .select('id, sent_at')
      .eq('month_year', monthYear)
      .not('sent_at', 'is', null)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error: `Newsletter for ${monthYear} was already sent (issue id: ${existing.id}). Use ?force=true to override.`,
          already_sent: true,
          issue_id: existing.id,
        },
        { status: 409 }
      );
    }
  }

  try {
    console.log(`[Newsletter] Generating FinOps digest for ${monthYear}...`);
    const content = await generateNewsletterContent(monthYear);

    // Save to DB
    const { data: issue, error: dbError } = await supabase
      .from('newsletter_issues')
      .insert({
        month_year: monthYear,
        subject: content.subject,
        preview_text: content.preview_text,
        html_body: content.html_body,
        text_body: content.markdown_body,
        sources: content.sources,
        metadata: content.metadata,
      })
      .select()
      .single();

    if (dbError) throw new Error(`DB insert failed: ${dbError.message}`);

    // Fetch active subscribers with their unsubscribe tokens
    // Lazily generate token if missing (handles pre-migration rows)
    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscriptions')
      .select('id, email, name, unsubscribe_token')
      .eq('is_active', true);

    if (subError) throw new Error(`Subscriber fetch failed: ${subError.message}`);

    if (!subscribers || subscribers.length === 0) {
      // Mark as sent with 0 recipients
      await supabase
        .from('newsletter_issues')
        .update({ sent_at: new Date().toISOString(), recipient_count: 0 })
        .eq('id', issue.id);

      return NextResponse.json({
        success: true,
        issue_id: issue.id,
        month_year: monthYear,
        recipient_count: 0,
        message: 'Newsletter generated but no active subscribers to send to.',
      });
    }

    // Ensure every subscriber has an unsubscribe_token (back-fill if needed)
    const needsToken = subscribers.filter((s) => !s.unsubscribe_token);
    if (needsToken.length > 0) {
      await Promise.all(
        needsToken.map((s) =>
          supabase
            .from('newsletter_subscriptions')
            .update({ unsubscribe_token: crypto.randomUUID() })
            .eq('id', s.id)
        )
      );
      // Re-fetch to get filled tokens
      const { data: refreshed } = await supabase
        .from('newsletter_subscriptions')
        .select('id, email, name, unsubscribe_token')
        .eq('is_active', true);
      subscribers.splice(0, subscribers.length, ...(refreshed ?? []));
    }

    console.log(`[Newsletter] Sending to ${subscribers.length} subscribers...`);

    const { sent, failed, results } = await sendNewsletterBatch({
      subscribers: subscribers as Array<{ id: string; email: string; name: string | null; unsubscribe_token: string }>,
      subject: content.subject,
      monthYear,
      previewText: content.preview_text,
      markdownBody: content.markdown_body,
    });

    // Mark issue as sent
    await supabase
      .from('newsletter_issues')
      .update({
        sent_at: new Date().toISOString(),
        recipient_count: sent,
        metadata: {
          ...((content.metadata as Record<string, unknown>) ?? {}),
          send_results: { sent, failed, total: subscribers.length },
        },
      })
      .eq('id', issue.id);

    console.log(`[Newsletter] Done. Sent: ${sent}, Failed: ${failed}`);

    return NextResponse.json({
      success: true,
      issue_id: issue.id,
      month_year: monthYear,
      recipient_count: sent,
      failed_count: failed,
      failures: results.filter((r) => !r.success).map((r) => ({ email: r.email, error: r.error })),
    });
  } catch (error) {
    console.error('[Newsletter] Generation failed:', error);
    return NextResponse.json(
      { error: 'Newsletter generation failed', details: String(error) },
      { status: 500 }
    );
  }
}

// POST — manual trigger from admin panel
export async function POST(request: Request) {
  const url = new URL(request.url);
  const force = url.searchParams.get('force') === 'true';
  return run(request, force);
}

// GET — Vercel Cron trigger (fires on 1st of every month at 09:00 UTC)
export async function GET(request: Request) {
  return run(request, false);
}
