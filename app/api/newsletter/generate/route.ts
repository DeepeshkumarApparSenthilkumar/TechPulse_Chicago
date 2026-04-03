import { createServiceClient } from '@/lib/supabase/service';
import { generateNewsletterContent } from '@/lib/anthropic';
import { generateUnsubscribeToken } from '@/app/api/newsletter/unsubscribe/route';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Protect this endpoint with a secret
function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  // Require secret in all environments — never open by default
  if (!cronSecret) {
    console.warn('CRON_SECRET is not set — rejecting request. Set CRON_SECRET to enable this endpoint.');
    return false;
  }
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function buildEmailHtml(
  htmlBody: string,
  subject: string,
  previewText: string,
  issueId: string,
  subscriberEmail: string,
  siteUrl: string
): string {
  const token = generateUnsubscribeToken(subscriberEmail);
  const unsubscribeUrl = `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(subscriberEmail)}&token=${token}`;
  const issueUrl = `${siteUrl}/newsletter/${issueId}`;
  const safeSubject = escapeHtml(subject);
  const safePreview = escapeHtml(previewText);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeSubject}</title>
  <meta name="description" content="${safePreview}" />
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${safePreview}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a5f,#1a1a2e);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#64748b;letter-spacing:2px;text-transform:uppercase;">TechPulse Chicago</p>
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;line-height:1.2;">${safeSubject}</h1>
              <p style="margin:12px 0 0;font-size:14px;color:#94a3b8;">${safePreview}</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#1e293b;padding:32px;color:#cbd5e1;line-height:1.7;font-size:15px;">
              ${htmlBody}
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="background-color:#1e293b;padding:0 32px 32px;text-align:center;">
              <a href="${issueUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
                View Full Issue Online →
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#0f172a;border-radius:0 0 16px 16px;padding:24px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#475569;">
                You're receiving this because you subscribed to TechPulse Chicago FinOps Digest.
              </p>
              <p style="margin:0;font-size:12px;color:#475569;">
                <a href="${unsubscribeUrl}" style="color:#64748b;text-decoration:underline;">Unsubscribe</a>
                &nbsp;·&nbsp;
                <a href="${siteUrl}/newsletter" style="color:#64748b;text-decoration:underline;">View Archive</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

  if (!fromEmail) {
    return NextResponse.json({ error: 'RESEND_FROM_EMAIL env var is not set' }, { status: 500 });
  }

  // Use UTC to avoid timezone-dependent month boundaries on the server
  const now = new Date();
  const monthYear = now.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

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

    const recipientList = subscribers ?? [];
    const recipientCount = recipientList.length;

    // Send emails via Resend
    const emailResults = { sent: 0, failed: 0, errors: [] as string[] };

    if (recipientCount > 0 && resendApiKey) {
      const resend = new Resend(resendApiKey);
      // Resend supports batch sending up to 100 emails at once
      const batchSize = 100;
      for (let i = 0; i < recipientList.length; i += batchSize) {
        const batch = recipientList.slice(i, i + batchSize);

        const batchPayload = batch.map((sub) => ({
          from: `TechPulse Chicago <${fromEmail}>`,
          to: sub.email,
          subject: content.subject,
          html: buildEmailHtml(
            content.html_body,
            content.subject,
            content.preview_text,
            issue.id,
            sub.email,
            siteUrl
          ),
          text: content.markdown_body,
        }));

        try {
          const { data: batchData, error: batchError } = await resend.batch.send(batchPayload);
          if (batchError) {
            console.error('Resend batch error:', batchError);
            emailResults.failed += batch.length;
            emailResults.errors.push(String(batchError));
          } else {
            emailResults.sent += batchData?.data?.length ?? batch.length;
          }
        } catch (err) {
          console.error('Resend batch exception:', err);
          emailResults.failed += batch.length;
          emailResults.errors.push(String(err));
        }
      }
    } else if (!resendApiKey) {
      console.warn('RESEND_API_KEY not set — skipping email delivery (dev mode)');
    }

    // Mark as sent
    await supabase
      .from('newsletter_issues')
      .update({ sent_at: new Date().toISOString(), recipient_count: recipientCount })
      .eq('id', issue.id);

    return NextResponse.json({
      success: true,
      issue_id: issue.id,
      month_year: monthYear,
      recipient_count: recipientCount,
      email_results: emailResults,
    });
  } catch (error) {
    console.error('Newsletter generation failed:', error);
    // Log full error server-side; never expose internals to client
    return NextResponse.json(
      { error: 'Newsletter generation failed' },
      { status: 500 }
    );
  }
}
