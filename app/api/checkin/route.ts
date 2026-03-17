import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { rsvp_id, checked_in } = await request.json();
  if (!rsvp_id) return NextResponse.json({ error: 'Missing rsvp_id' }, { status: 400 });

  // Verify requester is the event organizer
  const { data: rsvp } = await supabase
    .from('rsvps')
    .select('event_id')
    .eq('id', rsvp_id)
    .single();

  if (!rsvp) return NextResponse.json({ error: 'RSVP not found' }, { status: 404 });

  const { data: event } = await supabase
    .from('events')
    .select('organizer_id')
    .eq('id', rsvp.event_id)
    .single();

  if (event?.organizer_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase
    .from('rsvps')
    .update({
      checked_in,
      checked_in_at: checked_in ? new Date().toISOString() : null,
    })
    .eq('id', rsvp_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
