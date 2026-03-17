import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { event_id, status } = await request.json();

  if (!event_id || !['going', 'waitlist', 'cancelled'].includes(status)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // Upsert RSVP
  const { data: existingRsvp } = await supabase
    .from('rsvps')
    .select('id')
    .eq('event_id', event_id)
    .eq('user_id', user.id)
    .single();

  if (existingRsvp) {
    const { error } = await supabase
      .from('rsvps')
      .update({ status })
      .eq('id', existingRsvp.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase
      .from('rsvps')
      .insert({ event_id, user_id: user.id, status });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update rsvp_count on the event
  const { count } = await supabase
    .from('rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event_id)
    .eq('status', 'going');

  await supabase.from('events').update({ rsvp_count: count ?? 0 }).eq('id', event_id);

  return NextResponse.json({ success: true, rsvp_count: count });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ rsvps: [] });

  const { searchParams } = new URL(request.url);
  const event_id = searchParams.get('event_id');

  let query = supabase.from('rsvps').select('event_id, status').eq('user_id', user.id);
  if (event_id) query = query.eq('event_id', event_id);

  const { data } = await query;
  return NextResponse.json({ rsvps: data ?? [] });
}
