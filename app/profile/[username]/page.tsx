import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Globe, Linkedin, Building2 } from 'lucide-react';
import EventCard from '@/components/events/EventCard';
import type { Profile, Event } from '@/types';

interface Props { params: Promise<{ username: string }> }

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) notFound();

  const p = profile as Profile;

  const { data: hostedEvents } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', p.id)
    .eq('status', 'published')
    .order('start_time', { ascending: false })
    .limit(6);

  const initials = p.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  const roleColor =
    p.role === 'admin' ? { background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.25)' } :
    p.role === 'organizer' ? { background: 'rgba(59,130,246,0.12)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.25)' } :
    { background: 'rgba(100,116,139,0.12)', color: '#94A3B8', border: '1px solid rgba(100,116,139,0.25)' };

  return (
    <div style={{ minHeight: '100vh', padding: '80px 0 80px' }} className="page-transition">
      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 24px' }}>

        {/* Profile header */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', marginBottom: '32px', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', flexShrink: 0, overflow: 'hidden' }}>
            {p.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.avatar_url} alt={p.full_name ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : initials}
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>{p.full_name}</h1>
                <p style={{ color: '#64748B', fontSize: '14px', marginTop: '2px' }}>@{p.username}</p>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize', ...roleColor }}>{p.role}</span>
            </div>
            {p.bio && <p style={{ color: '#CBD5E1', lineHeight: 1.7, fontSize: '14px', marginTop: '8px' }}>{p.bio}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
              {p.company && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#94A3B8' }}>
                  <Building2 style={{ width: '14px', height: '14px' }} /> {p.company}
                </span>
              )}
              {p.website && (
                <a href={p.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#60A5FA', textDecoration: 'none' }}>
                  <Globe style={{ width: '14px', height: '14px' }} /> Website
                </a>
              )}
              {p.linkedin_url && (
                <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#60A5FA', textDecoration: 'none' }}>
                  <Linkedin style={{ width: '14px', height: '14px' }} /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Hosted events */}
        {hostedEvents && hostedEvents.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '24px', fontFamily: 'Space Grotesk, sans-serif' }}>
              Events by <span className="gradient-text">{p.full_name?.split(' ')[0]}</span>
            </h2>
            <div className="events-grid">
              {(hostedEvents as Event[]).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {(!hostedEvents || hostedEvents.length === 0) && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#64748B', fontSize: '14px' }}>No events hosted yet.</p>
            <Link href="/create-event" style={{ display: 'inline-block', marginTop: '12px', fontSize: '13px', color: '#60A5FA', textDecoration: 'none' }}>Host an event →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
