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
    <div className="min-h-screen pt-20">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href={`/events/${slug}`} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Event
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Check-In</h1>
            <p className="text-slate-400 text-sm mt-1">{event.title}</p>
          </div>
          <div className="glass rounded-xl px-4 py-3 text-center">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xl">
              <Users className="w-5 h-5" />
              {checkedInCount} / {(rsvps ?? []).length}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Checked in</div>
          </div>
        </div>

        <CheckinClient rsvps={(rsvps ?? []) as (RSVP & { profile: { full_name: string } })[]} eventId={event.id} />
      </div>
    </div>
  );
}
