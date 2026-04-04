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

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  backdropFilter: 'blur(16px)',
};

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

  const { data: rsvps } = await supabase
    .from('rsvps')
    .select('*, profile:profiles(full_name, avatar_url)')
    .eq('event_id', ev.id)
    .eq('status', 'going')
    .limit(20);

  const catClass = getCategoryClass(ev.category ?? '');

  return (
    <div style={{ minHeight: '100vh', padding: '80px 0 80px' }} className="page-transition">
      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 24px' }}>

        {/* Back */}
        <Link href="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B', textDecoration: 'none', marginBottom: '24px' }}>
          <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Events
        </Link>

        {/* Hero image */}
        <div style={{ position: 'relative', height: '320px', borderRadius: '20px', overflow: 'hidden', marginBottom: '32px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {ev.cover_image_url ? (
            <Image src={ev.cover_image_url} alt={ev.title} fill style={{ objectFit: 'cover' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))' }}>
              <span style={{ fontSize: '80px', opacity: 0.2 }}>⚡</span>
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(2,7,16,0.9) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', bottom: '24px', left: '24px' }}>
            {ev.category && (
              <span className={catClass} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'inline-block', marginBottom: '10px' }}>
                {ev.category}
              </span>
            )}
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk, sans-serif', maxWidth: '640px', lineHeight: 1.2 }}>
              {ev.title}
            </h1>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="event-detail-grid">
          <style>{`@media (min-width: 768px) { .event-detail-grid { grid-template-columns: 1fr 320px !important; } }`}</style>

          {/* Left: content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Meta details */}
            <div style={{ ...glassCard, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#CBD5E1' }}>
                <Calendar style={{ width: '18px', height: '18px', color: '#60A5FA', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{formatEventDate(ev.start_time)}</div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>{formatEventTime(ev.start_time)} — {formatEventTime(ev.end_time)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#CBD5E1' }}>
                {ev.is_online ? (
                  <>
                    <Globe style={{ width: '18px', height: '18px', color: '#C084FC', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>Online Event</div>
                      {ev.online_link && (
                        <a href={ev.online_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#60A5FA', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', marginTop: '2px' }}>
                          Join link <ExternalLink style={{ width: '11px', height: '11px' }} />
                        </a>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <MapPin style={{ width: '18px', height: '18px', color: '#22D3EE', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{ev.venue_name}</div>
                      <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>{ev.venue_address}</div>
                    </div>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#CBD5E1' }}>
                <Users style={{ width: '18px', height: '18px', color: '#34D399', flexShrink: 0 }} />
                <span style={{ fontSize: '14px' }}>
                  {ev.rsvp_count} going {ev.capacity ? `· ${ev.capacity - ev.rsvp_count} spots left` : ''}
                  {ev.is_free && <span style={{ color: '#34D399', fontWeight: 600, marginLeft: '4px' }}>· Free</span>}
                </span>
              </div>
            </div>

            {/* Description */}
            <div style={{ ...glassCard, padding: '24px' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', marginBottom: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>About this event</h2>
              <div style={{ color: '#CBD5E1', lineHeight: 1.8, fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                {ev.description ?? 'No description provided.'}
              </div>
            </div>

            {/* Tags */}
            {ev.tags && ev.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {ev.tags.map((tag) => (
                  <span key={tag} style={{ padding: '4px 12px', borderRadius: '100px', fontSize: '12px', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)' }}>#{tag}</span>
                ))}
              </div>
            )}

            {/* Attendees */}
            {rsvps && rsvps.length > 0 && (
              <div style={{ ...glassCard, padding: '24px' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', marginBottom: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>
                  Who&apos;s going ({ev.rsvp_count})
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(rsvps as (RSVP & { profile: { full_name: string; avatar_url: string } })[]).map((rsvp) => (
                    <div
                      key={rsvp.id}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', flexShrink: 0 }}
                      title={rsvp.profile?.full_name ?? 'Attendee'}
                    >
                      {rsvp.profile?.full_name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* RSVP card */}
            <div style={{ ...glassCard, padding: '24px' }}>
              <RSVPButton event={ev} />
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', fontSize: '13px', color: '#94A3B8', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  <Share2 style={{ width: '14px', height: '14px' }} /> Share Event
                </button>
              </div>
            </div>

            {/* Organizer */}
            {ev.organizer && (
              <div style={{ ...glassCard, padding: '24px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Organizer</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', flexShrink: 0 }}>
                    {ev.organizer.full_name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>{ev.organizer.full_name}</div>
                    <Link href={`/profile/${ev.organizer.username}`} style={{ fontSize: '12px', color: '#60A5FA', textDecoration: 'none' }}>View profile</Link>
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
