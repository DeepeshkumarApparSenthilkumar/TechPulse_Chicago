import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabase = await createClient();

  let query = supabase
    .from('events')
    .select('*, organizer:profiles(*)')
    .eq('status', 'published');

  const category = searchParams.get('category');
  if (category) query = query.eq('category', category);

  const format = searchParams.get('format');
  if (format === 'online') query = query.eq('is_online', true);
  if (format === 'in-person') query = query.eq('is_online', false);

  const q = searchParams.get('q');
  if (q) query = query.ilike('title', `%${q}%`);

  const sort = searchParams.get('sort');
  if (sort === 'popular') {
    query = query.order('rsvp_count', { ascending: false });
  } else {
    query = query.order('start_time', { ascending: true });
  }

  const limit = parseInt(searchParams.get('limit') ?? '24');
  const offset = parseInt(searchParams.get('offset') ?? '0');
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ events: data, total: count });
}
