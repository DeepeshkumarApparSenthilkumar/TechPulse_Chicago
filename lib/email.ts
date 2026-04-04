import { Resend } from 'resend';

// Lazy-initialize so build doesn't fail without env vars
function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'newsletter@techpulsechicago.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://techpulsechicago.com';

// Convert newsletter markdown to email-safe inline-styled HTML
function markdownToEmailHtml(markdown: string): string {
  const lines = markdown.split('\n');
  const output: string[] = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw.trimEnd();

    // H2
    if (line.startsWith('## ')) {
      if (inList) { output.push('</ul>'); inList = false; }
      output.push(
        `<h2 style="color:#06B6D4;font-family:Arial,sans-serif;font-size:18px;font-weight:700;` +
        `margin:36px 0 10px;padding-bottom:8px;border-bottom:2px solid #1E3A5F;letter-spacing:-0.01em;">` +
        renderInline(line.slice(3)) + '</h2>'
      );
      continue;
    }

    // H3
    if (line.startsWith('### ')) {
      if (inList) { output.push('</ul>'); inList = false; }
      output.push(
        `<h3 style="color:#93C5FD;font-family:Arial,sans-serif;font-size:15px;font-weight:600;margin:20px 0 6px;">` +
        renderInline(line.slice(4)) + '</h3>'
      );
      continue;
    }

    // Bullet
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) { output.push('<ul style="padding-left:20px;margin:8px 0 8px;">'); inList = true; }
      output.push(
        `<li style="color:#CBD5E1;font-size:14px;line-height:1.75;margin-bottom:6px;">` +
        renderInline(line.slice(2)) + '</li>'
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      if (inList) { output.push('</ul>'); inList = false; }
      output.push('<ol style="padding-left:20px;margin:8px 0 8px;">');
      output.push(
        `<li style="color:#CBD5E1;font-size:14px;line-height:1.75;margin-bottom:6px;">` +
        renderInline(line.replace(/^\d+\.\s/, '')) + '</li>'
      );
      output.push('</ol>');
      continue;
    }

    // Empty line
    if (line === '') {
      if (inList) { output.push('</ul>'); inList = false; }
      output.push('<div style="height:12px;"></div>');
      continue;
    }

    // Plain paragraph
    if (inList) { output.push('</ul>'); inList = false; }
    output.push(
      `<p style="color:#CBD5E1;font-size:14px;line-height:1.8;margin:0 0 12px;">` +
      renderInline(line) + '</p>'
    );
  }

  if (inList) output.push('</ul>');
  return output.join('\n');
}

function renderInline(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#E2E8F0;font-weight:600;">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em style="color:#CBD5E1;">$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code style="background:#1E3A5F;color:#7DD3FC;padding:1px 5px;border-radius:3px;font-size:12px;font-family:monospace;">$1</code>')
    // Source citation
    .replace(/\(Source:\s*(https?:\/\/[^\s)]+)\)/g,
      '(<a href="$1" style="color:#475569;font-size:11px;text-decoration:underline;">source</a>)')
    // Markdown links
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" style="color:#3B82F6;text-decoration:none;font-weight:500;">$1</a>')
    // Plain URLs
    .replace(/(https?:\/\/[^\s<]+)/g,
      '<a href="$1" style="color:#3B82F6;text-decoration:none;">$1</a>');
}

export function buildNewsletterEmail(params: {
  subscriberName: string | null;
  subject: string;
  monthYear: string;
  previewText: string;
  markdownBody: string;
  unsubscribeToken: string;
}): string {
  const { subscriberName, subject, monthYear, previewText, markdownBody, unsubscribeToken } = params;
  const greeting = subscriberName ? `Hi ${subscriberName.split(' ')[0]},` : 'Hi there,';
  const bodyHtml = markdownToEmailHtml(markdownBody);
  const year = new Date().getFullYear();
  const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
  const webUrl = `${SITE_URL}/newsletter`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#0A1628;-webkit-text-size-adjust:100%;font-family:Arial,Helvetica,sans-serif;">
<!-- Gmail preview text hack -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#0A1628;line-height:1px;">${previewText}&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0A1628;">
  <tr>
    <td align="center" style="padding:32px 16px 48px;">
      <table width="620" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;width:100%;">

        <!-- Top badge -->
        <tr>
          <td align="center" style="padding-bottom:20px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background-color:#0F2440;border:1px solid #1E4A6E;border-radius:100px;padding:5px 16px;">
                  <span style="color:#06B6D4;font-size:11px;font-weight:700;letter-spacing:0.08em;font-family:Arial,sans-serif;">&#129302; AI-POWERED &nbsp;&#183;&nbsp; MONTHLY DIGEST</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Header card -->
        <tr>
          <td style="background-color:#0F1F3D;border:1px solid #1E3A5F;border-radius:16px 16px 0 0;padding:32px 40px 24px;text-align:center;">
            <h1 style="color:#FFFFFF;font-family:Arial,sans-serif;font-size:30px;font-weight:700;margin:0 0 6px;line-height:1.2;">
              FinOps <span style="color:#06B6D4;">Intelligence</span> Digest
            </h1>
            <p style="color:#64748B;font-size:13px;font-family:Arial,sans-serif;margin:0;">${monthYear}</p>
          </td>
        </tr>

        <!-- Platform coverage bar -->
        <tr>
          <td style="background-color:#0D1B2E;border-left:1px solid #1E3A5F;border-right:1px solid #1E3A5F;padding:14px 24px;text-align:center;">
            <span style="color:#475569;font-size:11px;font-family:Arial,sans-serif;margin-right:8px;">Covering:</span>
            ${['Snowflake', 'Databricks', 'BigQuery', 'Redshift', 'Azure Fabric'].map(p =>
              `<span style="display:inline-block;background-color:#0F2440;border:1px solid #1E4A6E;color:#38BDF8;font-size:10px;font-weight:600;padding:3px 10px;border-radius:100px;margin:2px 3px;font-family:Arial,sans-serif;">${p}</span>`
            ).join('')}
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="background-color:#0D1B2E;border-left:1px solid #1E3A5F;border-right:1px solid #1E3A5F;padding:28px 40px 4px;">
            <p style="color:#E2E8F0;font-size:15px;font-family:Arial,sans-serif;margin:0 0 10px;font-weight:500;">${greeting}</p>
            <p style="color:#94A3B8;font-size:13px;font-family:Arial,sans-serif;line-height:1.7;margin:0 0 24px;border-left:3px solid #1E4A6E;padding-left:14px;">
              Your monthly FinOps intelligence digest is here. Claude AI searched official vendor docs, release notes, pricing pages, and community sources — so you have everything in one place.
            </p>
          </td>
        </tr>

        <!-- Main content -->
        <tr>
          <td style="background-color:#0D1B2E;border-left:1px solid #1E3A5F;border-right:1px solid #1E3A5F;padding:0 40px 32px;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="background-color:#0D1B2E;border-left:1px solid #1E3A5F;border-right:1px solid #1E3A5F;padding:0 40px 28px;">
            <hr style="border:none;border-top:1px solid #1E3A5F;margin:0;"/>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#080F1E;border:1px solid #1E3A5F;border-top:none;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
            <p style="color:#3B82F6;font-size:14px;font-weight:700;font-family:Arial,sans-serif;margin:0 0 4px;">TechPulse Chicago</p>
            <p style="color:#475569;font-size:12px;font-family:Arial,sans-serif;margin:0 0 16px;line-height:1.6;">
              Monthly FinOps intelligence &nbsp;&#183;&nbsp; Evidence-backed &nbsp;&#183;&nbsp; Powered by Claude AI
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center">
                  <a href="${unsubscribeUrl}" style="color:#475569;font-size:12px;font-family:Arial,sans-serif;text-decoration:underline;">Unsubscribe</a>
                  <span style="color:#334155;font-size:12px;margin:0 10px;">&nbsp;&#183;&nbsp;</span>
                  <a href="${webUrl}" style="color:#475569;font-size:12px;font-family:Arial,sans-serif;text-decoration:underline;">View in browser</a>
                  <span style="color:#334155;font-size:12px;margin:0 10px;">&nbsp;&#183;&nbsp;</span>
                  <a href="${SITE_URL}" style="color:#475569;font-size:12px;font-family:Arial,sans-serif;text-decoration:underline;">Visit site</a>
                </td>
              </tr>
            </table>
            <p style="color:#1E3A5F;font-size:11px;font-family:Arial,sans-serif;margin:16px 0 0;">
              &copy; ${year} TechPulse Chicago &nbsp;&#183;&nbsp; Chicago, IL
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

export interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  unsubscribe_token: string;
}

export interface SendResult {
  email: string;
  success: boolean;
  error?: string;
}

export interface BatchSendResult {
  sent: number;
  failed: number;
  results: SendResult[];
}

export async function sendNewsletterBatch(params: {
  subscribers: Subscriber[];
  subject: string;
  monthYear: string;
  previewText: string;
  markdownBody: string;
}): Promise<BatchSendResult> {
  const { subscribers, subject, monthYear, previewText, markdownBody } = params;
  const results: SendResult[] = [];
  const BATCH_SIZE = 100;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);

    const emails = batch.map((sub) => ({
      from: `TechPulse Chicago <${FROM_EMAIL}>`,
      to: sub.email,
      subject,
      html: buildNewsletterEmail({
        subscriberName: sub.name,
        subject,
        monthYear,
        previewText,
        markdownBody,
        unsubscribeToken: sub.unsubscribe_token,
      }),
    }));

    try {
      const resend = getResend();
      const { error } = await resend.batch.send(emails);
      if (error) {
        batch.forEach((sub) => results.push({ email: sub.email, success: false, error: String(error) }));
      } else {
        batch.forEach((sub) => results.push({ email: sub.email, success: true }));
      }
    } catch (err) {
      batch.forEach((sub) => results.push({ email: sub.email, success: false, error: String(err) }));
    }
  }

  return {
    sent: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };
}
