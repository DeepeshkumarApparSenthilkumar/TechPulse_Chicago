import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
  }

  let email: string, name: string, topics: string[];
  try {
    ({ email, name, topics } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const safeName = typeof name === 'string' ? name.slice(0, 100) : null;
  const safeTopics = Array.isArray(topics)
    ? topics.filter((t) => typeof t === 'string').slice(0, 20)
    : [];

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('newsletter_subscriptions')
    .upsert({ email, name: safeName, topics: safeTopics, is_active: true }, { onConflict: 'email' });

  if (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Subscription failed. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
