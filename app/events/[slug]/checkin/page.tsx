import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import CheckinClient from './CheckinClient';
import type { RSVP } from '@/types';

interface Props { params: Promise<{ slug: string }> }

export default async function CheckinPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: event } = await supabase.from('events').select('*').eq('slug', slug).single();
  if (!event) notFound();
  if (event.organizer_id !== user.id) redirect(`/events/${slug}`);

  const { data: rsvps } = await supabase
    .from('rsvps')
    .select('*, profile:profiles(full_name, email:newsletter_email)')
    .eq('event_id', event.id)
    .eq('status', 'going')
    .order('created_at', { ascending: true });

  const checkedInCount = (rsvps ?? []).filter((r: RSVP) => r.checked_in).length;

  return (
    <div style={{ minHeight: '100vh', padding: '80px 0 80px' }}>
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '0 24px' }}>

        <Link href={`/events/${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B', textDecoration: 'none', marginBottom: '24px' }}>
          <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Event
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>Check-In</h1>
            <p style={{ color: '#64748B', fontSize: '13px', marginTop: '4px' }}>{event.title}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px 20px', textAlign: 'center', backdropFilter: 'blur(16px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34D399', fontWeight: 800, fontSize: '1.25rem', fontFamily: 'Space Grotesk, sans-serif' }}>
              <Users style={{ width: '18px', height: '18px' }} />
              {checkedInCount} / {(rsvps ?? []).length}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Checked in</div>
          </div>
        </div>

        <CheckinClient rsvps={(rsvps ?? []) as (RSVP & { profile: { full_name: string } })[]} eventId={event.id} />
      </div>
    </div>
  );
}
