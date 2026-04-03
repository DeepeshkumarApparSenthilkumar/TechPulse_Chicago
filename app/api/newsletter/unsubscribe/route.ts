import { createServiceClient } from '@/lib/supabase/service';
import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Generate an HMAC token for a given email so unsubscribe links are authenticated.
 * The token prevents arbitrary users from unsubscribing emails they don't own.
 * Exported so the generate route can include it in outgoing emails.
 */
export function generateUnsubscribeToken(email: string): string {
  const secret = process.env.CRON_SECRET ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'dev-secret';
  return createHmac('sha256', secret).update(email.toLowerCase()).digest('hex');
}

function verifyUnsubscribeToken(email: string, token: string): boolean {
  try {
    const expected = generateUnsubscribeToken(email);
    if (token.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

  if (!email || !email.includes('@') || !token) {
    return NextResponse.redirect(`${siteUrl}/newsletter/unsubscribe?status=invalid`);
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return NextResponse.redirect(`${siteUrl}/newsletter/unsubscribe?status=invalid`);
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('newsletter_subscriptions')
    .update({ is_active: false })
    .eq('email', email);

  if (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.redirect(`${siteUrl}/newsletter/unsubscribe?status=error`);
  }

  return NextResponse.redirect(`${siteUrl}/newsletter/unsubscribe?status=success`);
}
