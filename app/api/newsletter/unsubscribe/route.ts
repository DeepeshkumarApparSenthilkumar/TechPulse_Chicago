import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/unsubscribe?status=invalid`);
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('newsletter_subscriptions')
    .update({ is_active: false })
    .eq('unsubscribe_token', token)
    .eq('is_active', true)
    .select('email')
    .single();

  if (error || !data) {
    // Token not found or already unsubscribed
    return NextResponse.redirect(`${siteUrl}/unsubscribe?status=already`);
  }

  return NextResponse.redirect(`${siteUrl}/unsubscribe?status=success`);
}
