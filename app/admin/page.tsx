import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatEventDateTime } from '@/lib/utils';
import type { Event, Profile, NewsletterIssue } from '@/types';
import { Users, Send } from 'lucide-react';

const row: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '12px 14px', borderRadius: '10px',
  background: 'rgba(255,255,255,0.04)',
  marginBottom: '6px',
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const [
    { data: events }, { data: users }, { data: newsletters },
    { count: eventCount }, { count: memberCount }, { count: subCount }
  ] = await Promise.all([
    supabase.from('events').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('newsletter_issues').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('newsletter_subscriptions').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ]);

  const glassCard: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px', padding: '24px',
    backdropFilter: 'blur(16px)',
  };

  return (
    <div style={{ minHeight: '100vh', padding: '48px 0 80px' }} className="page-transition">
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>
            Admin <span className="gradient-text">Panel</span>
          </h1>
        </div>

        {/* Stats */}
        <div className="grid-3col" style={{ marginBottom: '32px' }}>
          {[
            { label: 'Total Events',           value: eventCount ?? 0, color: '#3B82F6' },
            { label: 'Total Members',          value: memberCount ?? 0, color: '#8B5CF6' },
            { label: 'Newsletter Subscribers', value: subCount ?? 0,   color: '#06B6D4' },
          ].map((stat) => (
            <div key={stat.label} style={glassCard}>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: stat.color, fontFamily: 'Space Grotesk, sans-serif' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Newsletter control */}
        <div style={{ ...glassCard, marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>Newsletter Control</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link href="/admin/subscribers" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#CBD5E1', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
                <Users style={{ width: '14px', height: '14px' }} /> Manage Subscribers
              </Link>
              <form action="/api/newsletter/generate" method="POST">
                <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,0.35)' }}>
                  <Send style={{ width: '14px', height: '14px' }} /> Generate & Send
                </button>
              </form>
            </div>
          </div>
          {(newsletters as NewsletterIssue[] ?? []).length === 0 ? (
            <p style={{ fontSize: '13px', color: '#475569' }}>No newsletters sent yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(newsletters as NewsletterIssue[] ?? []).map((issue) => (
                <div key={issue.id} style={row}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{issue.subject ?? issue.month_year}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{issue.sent_at ? `Sent ${formatEventDateTime(issue.sent_at)}` : 'Draft'} · {issue.recipient_count ?? 0} recipients</div>
                  </div>
                  <Link href={`/newsletter/${issue.id}`} style={{ fontSize: '12px', color: '#60A5FA', textDecoration: 'none' }}>View</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tables */}
        <div className="grid-2col">
          {/* Events */}
          <div style={glassCard}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', marginBottom: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>Recent Events</h2>
            {(events as Event[] ?? []).map((event) => (
              <div key={event.id} style={row}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{formatEventDateTime(event.start_time)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px', flexShrink: 0 }}>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, ...(event.status === 'published' ? { color: '#34D399', background: 'rgba(16,185,129,0.12)' } : { color: '#94A3B8', background: 'rgba(255,255,255,0.06)' }) }}>{event.status}</span>
                  <Link href={`/events/${event.slug}`} style={{ fontSize: '12px', color: '#60A5FA', textDecoration: 'none' }}>View</Link>
                </div>
              </div>
            ))}
          </div>

          {/* Members */}
          <div style={glassCard}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', marginBottom: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>Recent Members</h2>
            {(users as Profile[] ?? []).map((u) => (
              <div key={u.id} style={row}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                    {u.full_name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.full_name ?? 'Unknown'}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'capitalize', marginTop: '2px' }}>{u.role}</div>
                  </div>
                </div>
                <Link href={`/profile/${u.username}`} style={{ fontSize: '12px', color: '#60A5FA', textDecoration: 'none', flexShrink: 0, marginLeft: '8px' }}>Profile</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
