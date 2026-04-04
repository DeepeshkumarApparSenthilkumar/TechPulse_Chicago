import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { supabase, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };

  return { supabase, error: null };
}

// PATCH /api/admin/subscribers/[id] — toggle is_active
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const { is_active } = await request.json();

  const { error: dbError } = await supabase
    .from('newsletter_subscriptions')
    .update({ is_active })
    .eq('id', id);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE /api/admin/subscribers/[id] — remove subscriber
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const { error: dbError } = await supabase
    .from('newsletter_subscriptions')
    .delete()
    .eq('id', id);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
