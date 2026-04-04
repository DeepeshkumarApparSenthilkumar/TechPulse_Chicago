export const revalidate = 60; // cache for 60 seconds

import HeroSection from '@/components/hero/HeroSection';
import EventCard from '@/components/events/EventCard';
import SubscribeForm from '@/components/newsletter/SubscribeForm';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowRight, Brain, Cloud, Network, Zap } from 'lucide-react';
import type { Event } from '@/types';

const categories = [
  { name: 'AI/ML',       icon: Brain,   catClass: 'cat-ai' },
  { name: 'Web Dev',     icon: Zap,     catClass: 'cat-web' },
  { name: 'DevOps',      icon: Cloud,   catClass: 'cat-devops' },
  { name: 'FinOps',      icon: Cloud,   catClass: 'cat-finops' },
  { name: 'Startup',     icon: Zap,     catClass: 'cat-startup' },
  { name: 'Networking',  icon: Network, catClass: 'cat-networking' },
];

export default async function HomePage() {
  const supabase = await createClient();

  let events: Event[] = [];
  let stats = { events: 0, members: 0, organizers: 0 };

  try {
    const [{ data: eventsData }, { count: eventCount }, { count: memberCount }, { count: orgCount }] = await Promise.all([
      supabase
        .from('events')
        .select('*, organizer:profiles(*)')
        .eq('status', 'published')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(6),
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'organizer'),
    ]);
    
    events = (eventsData as Event[]) || [];
    stats = { events: eventCount ?? 0, members: memberCount ?? 0, organizers: orgCount ?? 0 };
  } catch (error) {
    console.warn('Supabase fetch failed (likely missing valid .env.local keys). Loading fallback UI.');
  }

  return (
    <div className="page-transition">
      <HeroSection stats={stats} />

      {/* ── Section divider ── */}
      <div className="section-divider" />

      {/* ── Categories ── */}
      <section style={{ padding: '96px 0 80px' }}>
        <div className="container-page">
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <div className="section-label">✦ Browse Topics</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 700, color: '#fff', marginBottom: '12px', fontFamily: 'Space Grotesk, sans-serif' }}>
              Explore by <span className="gradient-text">Category</span>
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '420px', margin: '0 auto', lineHeight: 1.7 }}>Find events that match your interests and expertise</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px' }}>
            {categories.map(({ name, icon: Icon, catClass }) => (
              <Link
                key={name}
                href={`/events?category=${encodeURIComponent(name)}`}
                className={catClass}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', borderRadius: '100px',
                  fontSize: '14px', fontWeight: 600, textDecoration: 'none',
                  transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                }}
              >
                <Icon style={{ width: '16px', height: '16px' }} />
                {name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── Upcoming Events ── */}
      <section style={{ padding: '96px 0' }}>
        <div className="container-page">
          {events && events.length > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '48px', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <div className="section-label">📅 What&apos;s On</div>
                  <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 700, color: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>
                    Upcoming <span className="gradient-text">Events</span>
                  </h2>
                  <p style={{ color: '#94A3B8', marginTop: '8px', fontSize: '0.95rem' }}>
                    Don&apos;t miss what&apos;s happening in Chicago&apos;s tech scene
                  </p>
                </div>
                <Link href="/events" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '10px 20px', borderRadius: '10px',
                  fontSize: '14px', fontWeight: 600, color: '#60A5FA',
                  background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
                  textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all 0.2s',
                }}>
                  View all <ArrowRight style={{ width: '15px', height: '15px' }} />
                </Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {(events as Event[]).map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </>
          ) : (
            <div className="glass" style={{ borderRadius: '24px', padding: '80px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: '56px', marginBottom: '20px' }}>🎉</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '12px', fontFamily: 'Space Grotesk, sans-serif' }}>No events yet</h3>
              <p style={{ color: '#94A3B8', marginBottom: '32px', fontSize: '1rem', maxWidth: '380px', margin: '0 auto 32px' }}>Be the first to host an event for Chicago&apos;s tech community.</p>
              <Link href="/create-event" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 32px', borderRadius: '12px', fontSize: '15px',
                fontWeight: 700, color: '#fff',
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', textDecoration: 'none',
              }}>
                Host an Event <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="section-divider" />

      {/* ── FinOps Newsletter CTA ── */}
      <section style={{ padding: '96px 0' }}>
        <div className="container-page">
          <div style={{
            background: 'linear-gradient(135deg, #080F28 0%, #0A1530 50%, #06102A 100%)',
            border: '1px solid rgba(59,130,246,0.22)',
            borderRadius: '28px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 0 80px rgba(59,130,246,0.06), 0 32px 64px rgba(0,0,0,0.5)',
          }}>
            {/* Decorative glows */}
            <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.08), transparent 70%)', pointerEvents: 'none' }} />

            <div className="finops-cta-grid">
              {/* Left */}
              <div className="finops-left" style={{ padding: '56px 48px' }}>
                <div className="cat-finops" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, marginBottom: '24px', letterSpacing: '0.05em' }}>
                  🤖 AI-Powered · Monthly Digest
                </div>
                <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '20px', fontFamily: 'Space Grotesk, sans-serif' }}>
                  Stay ahead of<br />
                  <span className="gradient-text">FinOps changes</span>
                </h2>
                <p style={{ color: '#94A3B8', lineHeight: 1.8, marginBottom: '32px', fontSize: '0.95rem', maxWidth: '400px' }}>
                  Claude AI searches official vendor docs, release notes, and pricing pages every month — one evidence-backed digest covering all 5 major platforms.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '36px' }}>
                  {['Snowflake', 'Databricks', 'BigQuery', 'Redshift', 'Azure Fabric'].map((p) => (
                    <span key={p} className="cat-finops" style={{ padding: '5px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>{p}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  {[['100%', 'Evidence-backed'], ['Free', 'Always'], ['Monthly', 'Digest']].map(([val, label]) => (
                    <div key={label}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>{val}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — distinct background so it reads as a panel */}
              <div style={{
                padding: '48px 44px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.02)',
              }}>
                <SubscribeForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── Host CTA ── */}
      <section style={{ padding: '96px 0 112px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px' }}>
          <div className="glass" style={{ borderRadius: '28px', padding: '72px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Glow */}
            <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div className="cat-web" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, marginBottom: '24px', letterSpacing: '0.05em' }}>
                🎤 Community Speakers
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: '#fff', marginBottom: '20px', fontFamily: 'Space Grotesk, sans-serif' }}>
                Ready to <span className="gradient-text">Host?</span>
              </h2>
              <p style={{ color: '#94A3B8', marginBottom: '40px', maxWidth: '460px', margin: '0 auto 40px', lineHeight: 1.8, fontSize: '1rem' }}>
                Share your knowledge with Chicago&apos;s tech community. Free RSVP system, no ticketing fees, and simple event setup.
              </p>
              <Link href="/create-event" className="hero-btn-primary">
                Host an Event <ArrowRight style={{ width: '18px', height: '18px' }} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
