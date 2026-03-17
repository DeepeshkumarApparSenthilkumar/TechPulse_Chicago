import { createClient } from '@/lib/supabase/server';
import { generateNewsletterContent } from '@/lib/anthropic';
import { NextResponse } from 'next/server';

// Protect this endpoint with a secret
function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // Allow in dev without secret
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  const now = new Date();
  const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  try {
    console.log(`Generating FinOps newsletter for ${monthYear}...`);
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

    if (dbError) throw dbError;

    // Fetch active subscribers
    const { data: subscribers } = await supabase
      .from('newsletter_subscriptions')
      .select('email, name')
      .eq('is_active', true);

    const recipientCount = subscribers?.length ?? 0;

    // In production, send emails via Resend here
    // For now, mark as sent and record count
    await supabase
      .from('newsletter_issues')
      .update({ sent_at: new Date().toISOString(), recipient_count: recipientCount })
      .eq('id', issue.id);

    return NextResponse.json({
      success: true,
      issue_id: issue.id,
      month_year: monthYear,
      recipient_count: recipientCount,
    });
  } catch (error) {
    console.error('Newsletter generation failed:', error);
    return NextResponse.json(
      { error: 'Newsletter generation failed', details: String(error) },
      { status: 500 }
    );
  }
}
