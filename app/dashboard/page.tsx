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

  const { data: hostedEvents } = await supabase
    .from('events').select('*').eq('organizer_id', user.id)
    .order('start_time', { ascending: false }).limit(10);

  const { data: myRsvps } = await supabase
    .from('rsvps').select('*, event:events(*)')
    .eq('user_id', user.id).eq('status', 'going')
    .gte('events.start_time', new Date().toISOString())
    .order('created_at', { ascending: false }).limit(10);

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex', alignItems: 'center', gap: '16px',
    textDecoration: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', padding: '48px 0 80px' }} className="page-transition">
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>
              Welcome back, <span className="gradient-text">{profile?.full_name?.split(' ')[0] ?? 'there'}</span>!
            </h1>
            <p style={{ color: '#64748B', marginTop: '4px', fontSize: '14px', textTransform: 'capitalize' }}>
              Role: {profile?.role ?? 'member'}
            </p>
          </div>
          <Link href="/create-event" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '11px 22px', borderRadius: '12px',
            fontSize: '14px', fontWeight: 700, color: '#fff',
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            textDecoration: 'none', boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
          }}>
            <Plus style={{ width: '16px', height: '16px' }} /> Host Event
          </Link>
        </div>

        {/* Two column grid */}
        <div className="grid-2col" style={{ marginBottom: '32px' }}>
          {/* Upcoming RSVPs */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Calendar style={{ width: '18px', height: '18px', color: '#60A5FA' }} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>My Upcoming Events</h2>
            </div>
            {myRsvps && myRsvps.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(myRsvps as (RSVP & { event: Event })[]).map((rsvp) => rsvp.event && (
                  <Link key={rsvp.id} href={`/events/${rsvp.event.slug}`} style={card} className="glass-hover">
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>⚡</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rsvp.event.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{formatEventDateTime(rsvp.event.start_time)}</div>
                    </div>
                    {rsvp.event.category && (
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', flexShrink: 0 }} className={getCategoryClass(rsvp.event.category)}>{rsvp.event.category}</span>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
                <Calendar style={{ width: '32px', height: '32px', color: '#475569', margin: '0 auto 8px' }} />
                <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '12px' }}>No upcoming RSVPs</p>
                <Link href="/events" style={{ color: '#60A5FA', fontSize: '13px', textDecoration: 'none' }}>Explore events →</Link>
              </div>
            )}
          </div>

          {/* Hosted Events */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Users style={{ width: '18px', height: '18px', color: '#C084FC' }} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>Events I&apos;m Hosting</h2>
            </div>
            {hostedEvents && hostedEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(hostedEvents as Event[]).map((event) => (
                  <div key={event.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{formatEventDateTime(event.start_time)} · {event.rsvp_count} RSVPs</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, ...(event.status === 'published' ? { color: '#34D399', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' } : { color: '#94A3B8', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }) }}>
                        {event.status}
                      </span>
                      <Link href={`/events/${event.slug}/checkin`} style={{ fontSize: '12px', color: '#60A5FA', textDecoration: 'none' }}>Check-in</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
                <Plus style={{ width: '32px', height: '32px', color: '#475569', margin: '0 auto 8px' }} />
                <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '12px' }}>You haven&apos;t hosted any events yet</p>
                <Link href="/create-event" style={{ color: '#60A5FA', fontSize: '13px', textDecoration: 'none' }}>Host your first event →</Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid-3col">
          {[
            { href: '/events',   label: 'Explore Events',    icon: '🔍' },
            { href: '/newsletter', label: 'FinOps Newsletter', icon: '📧' },
            { href: `/profile/${profile?.username ?? ''}`, label: 'Edit Profile', icon: '👤' },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '16px', borderRadius: '14px', textDecoration: 'none',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.2s ease',
            }} className="glass-hover">
              <span style={{ fontSize: '22px' }}>{item.icon}</span>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#CBD5E1', flex: 1 }}>{item.label}</span>
              <ArrowRight style={{ width: '15px', height: '15px', color: '#475569', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
