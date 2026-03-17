import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Plus, Users, ArrowRight } from 'lucide-react';
import { formatEventDateTime, getCategoryClass } from '@/lib/utils';
import type { Event, RSVP } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // My hosted events
  const { data: hostedEvents } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', user.id)
    .order('start_time', { ascending: false })
    .limit(10);

  // My RSVPs
  const { data: myRsvps } = await supabase
    .from('rsvps')
    .select('*, event:events(*)')
    .eq('user_id', user.id)
    .eq('status', 'going')
    .gte('events.start_time', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(10);

  // Profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return (
    <div className="min-h-screen pt-20 page-transition">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Welcome back, <span className="gradient-text">{profile?.full_name?.split(' ')[0] ?? 'there'}</span>!
            </h1>
            <p className="text-slate-400 mt-1 capitalize">Role: {profile?.role ?? 'member'}</p>
          </div>
          <Link
            href="/create-event"
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
          >
            <Plus className="w-4 h-4" /> Host Event
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming RSVPs */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>My Upcoming Events</h2>
            </div>
            {myRsvps && myRsvps.length > 0 ? (
              <div className="space-y-3">
                {(myRsvps as (RSVP & { event: Event })[]).map((rsvp) => rsvp.event && (
                  <Link key={rsvp.id} href={`/events/${rsvp.event.slug}`} className="glass glass-hover rounded-xl p-4 flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))' }}>
                      ⚡
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate group-hover:text-blue-400 transition-colors">{rsvp.event.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{formatEventDateTime(rsvp.event.start_time)}</div>
                    </div>
                    {rsvp.event.category && (
                      <span className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ${getCategoryClass(rsvp.event.category)}`}>{rsvp.event.category}</span>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="glass rounded-xl p-6 text-center">
                <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No upcoming RSVPs</p>
                <Link href="/events" className="text-blue-400 text-sm hover:underline mt-2 inline-block">Explore events →</Link>
              </div>
            )}
          </div>

          {/* Hosted Events */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Events I'm Hosting</h2>
            </div>
            {hostedEvents && hostedEvents.length > 0 ? (
              <div className="space-y-3">
                {(hostedEvents as Event[]).map((event) => (
                  <div key={event.id} className="glass rounded-xl p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{event.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{formatEventDateTime(event.start_time)} · {event.rsvp_count} RSVPs</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded text-xs ${event.status === 'published' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' : 'text-slate-400 bg-white/5 border border-white/10'}`}>
                        {event.status}
                      </span>
                      <Link href={`/events/${event.slug}/checkin`} className="text-xs text-blue-400 hover:underline">Check-in</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass rounded-xl p-6 text-center">
                <Plus className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">You haven&apos;t hosted any events yet</p>
                <Link href="/create-event" className="text-blue-400 text-sm hover:underline mt-2 inline-block">Host your first event →</Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/events', label: 'Explore Events', icon: '🔍' },
            { href: '/newsletter', label: 'FinOps Newsletter', icon: '📧' },
            { href: `/profile/${profile?.username ?? ''}`, label: 'Edit Profile', icon: '👤' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="glass glass-hover rounded-xl p-4 flex items-center gap-3 group">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 ml-auto transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
