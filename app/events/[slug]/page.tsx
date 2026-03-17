import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Users, Globe, ExternalLink, Share2, ArrowLeft } from 'lucide-react';
import { formatEventDate, formatEventTime, getCategoryClass } from '@/lib/utils';
import RSVPButton from '@/components/events/RSVPButton';
import type { Event, RSVP } from '@/types';

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from('events').select('title, description').eq('slug', slug).single();
  if (!event) return { title: 'Event Not Found' };
  return { title: `${event.title} — TechPulse Chicago`, description: event.description };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from('events')
    .select('*, organizer:profiles(*)')
    .eq('slug', slug)
    .single();

  if (error || !event) notFound();

  const ev = event as Event & { organizer: { full_name: string; avatar_url: string; username: string } };

  // Fetch attendees (first 20 avatars)
  const { data: rsvps } = await supabase
    .from('rsvps')
    .select('*, profile:profiles(full_name, avatar_url)')
    .eq('event_id', ev.id)
    .eq('status', 'going')
    .limit(20);

  const catClass = getCategoryClass(ev.category ?? '');

  return (
    <div className="min-h-screen pt-20 page-transition">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back */}
        <Link href="/events" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>

        {/* Hero image */}
        <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden mb-8 glass">
          {ev.cover_image_url ? (
            <Image src={ev.cover_image_url} alt={ev.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))' }}>
              <span className="text-8xl opacity-20">⚡</span>
            </div>
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent" />
          <div className="absolute bottom-6 left-6">
            {ev.category && (
              <span className={`px-3 py-1.5 rounded-lg text-sm font-medium mb-3 inline-block ${catClass}`}>
                {ev.category}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold text-white max-w-2xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {ev.title}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event details */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 text-slate-300">
                <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <div className="font-medium">{formatEventDate(ev.start_time)}</div>
                  <div className="text-sm text-slate-400">{formatEventTime(ev.start_time)} — {formatEventTime(ev.end_time)}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-slate-300">
                {ev.is_online ? (
                  <>
                    <Globe className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">Online Event</div>
                      {ev.online_link && (
                        <a href={ev.online_link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline flex items-center gap-1">
                          Join link <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{ev.venue_name}</div>
                      <div className="text-sm text-slate-400">{ev.venue_address}</div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Users className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>{ev.rsvp_count} going {ev.capacity ? `· ${ev.capacity - ev.rsvp_count} spots left` : ''}</span>
                {ev.is_free && <span className="text-emerald-400 font-medium">· Free</span>}
              </div>
            </div>

            {/* Description */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>About this event</h2>
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {ev.description ?? 'No description provided.'}
              </div>
            </div>

            {/* Tags */}
            {ev.tags && ev.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ev.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs text-slate-400 border border-white/10">#{tag}</span>
                ))}
              </div>
            )}

            {/* Attendees */}
            {rsvps && rsvps.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Who&apos;s going ({ev.rsvp_count})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(rsvps as (RSVP & { profile: { full_name: string; avatar_url: string } })[]).map((rsvp) => (
                    <div key={rsvp.id} className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
                      title={rsvp.profile?.full_name ?? 'Attendee'}>
                      {rsvp.profile?.full_name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* RSVP card */}
            <div className="glass rounded-2xl p-6">
              <RSVPButton event={ev} />
              <div className="mt-4 pt-4 border-t border-white/10">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white border border-white/10 hover:border-blue-500/30 transition-all">
                  <Share2 className="w-4 h-4" /> Share Event
                </button>
              </div>
            </div>

            {/* Organizer */}
            {ev.organizer && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Organizer</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
                    {ev.organizer.full_name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <div className="font-medium text-white">{ev.organizer.full_name}</div>
                    <Link href={`/profile/${ev.organizer.username}`} className="text-xs text-blue-400 hover:underline">View profile</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
