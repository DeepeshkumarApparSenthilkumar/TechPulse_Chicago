import { createClient } from '@/lib/supabase/server';
import SubscribeForm from '@/components/newsletter/SubscribeForm';
import Link from 'next/link';
import { formatEventDate } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import type { NewsletterIssue } from '@/types';

const platforms = [
  { name: 'Snowflake',     icon: '❄️' },
  { name: 'Databricks',    icon: '🧱' },
  { name: 'BigQuery',      icon: '🔍' },
  { name: 'Redshift',      icon: '🔴' },
  { name: 'Azure Fabric',  icon: '☁️' },
];

const features = [
  { icon: '🔍', title: 'AI Web Search',     desc: 'Claude searches vendor docs, release notes, and official blogs every month — no manual research needed.' },
  { icon: '📊', title: 'Evidence-Backed',   desc: 'Every claim verified against official sources with citations. No hallucinations, ever.' },
  { icon: '💡', title: 'Actionable Insights',desc: 'Executive summary + practitioner deep-dive with optimization plays and action checklists.' },
];

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  padding: '24px',
  backdropFilter: 'blur(16px)',
};

export default async function NewsletterPage() {
  const supabase = await createClient();
  const { data: issues } = await supabase
    .from('newsletter_issues')
    .select('id, month_year, subject, preview_text, sent_at, recipient_count')
    .not('sent_at', 'is', null)
    .order('sent_at', { ascending: false })
    .limit(12);

  return (
    <div style={{ minHeight: '100vh', padding: '64px 0 96px' }} className="page-transition">
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div className="cat-finops" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, marginBottom: '24px' }}>
            🤖 AI-Powered · Monthly Digest
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.5rem)', fontWeight: 800, color: '#fff', marginBottom: '20px', lineHeight: 1.1, fontFamily: 'Space Grotesk, sans-serif' }}>
            FinOps <span className="gradient-text">Intelligence</span><br />Digest
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', maxWidth: '560px', margin: '0 auto', lineHeight: 1.8 }}>
            Every month, Claude AI searches for the latest pricing changes, cost optimizations, and FinOps updates — compiled into one evidence-backed digest.
          </p>
        </div>

        {/* Platform coverage */}
        <div style={{ ...glassCard, marginBottom: '32px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '20px', textAlign: 'center', fontFamily: 'Space Grotesk, sans-serif' }}>
            Platforms Covered Every Month
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
            {platforms.map((p) => (
              <div key={p.name} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px 8px', textAlign: 'center', transition: 'border-color 0.2s' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{p.icon}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#CBD5E1' }}>{p.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid-3col" style={{ marginBottom: '48px' }}>
          {features.map((item) => (
            <div key={item.title} style={{ ...glassCard, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '28px' }}>{item.icon}</div>
              <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif' }}>{item.title}</h3>
              <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Subscribe form */}
        <div style={{ maxWidth: '520px', margin: '0 auto 64px' }}>
          <SubscribeForm />
        </div>

        {/* Archive */}
        {issues && issues.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>
                Past <span className="gradient-text">Issues</span>
              </h2>
              <span style={{ fontSize: '13px', color: '#64748B' }}>{issues.length} issues</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(issues as NewsletterIssue[]).map((issue) => (
                <Link key={issue.id} href={`/newsletter/${issue.id}`} style={{
                  ...glassCard, padding: '18px 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  textDecoration: 'none', transition: 'all 0.2s ease',
                }} className="glass-hover">
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Space Grotesk, sans-serif' }}>
                      {issue.subject ?? `FinOps Digest — ${issue.month_year}`}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {issue.preview_text ?? issue.month_year}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '16px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{issue.sent_at ? formatEventDate(issue.sent_at) : issue.month_year}</div>
                      {issue.recipient_count ? <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{issue.recipient_count} recipients</div> : null}
                    </div>
                    <ArrowRight style={{ width: '15px', height: '15px', color: '#475569' }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {(!issues || issues.length === 0) && (
          <div style={{ ...glassCard, padding: '64px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📬</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>First issue coming soon</h3>
            <p style={{ color: '#94A3B8', fontSize: '14px' }}>Subscribe above to be notified when the first digest is published.</p>
          </div>
        )}
      </div>
    </div>
  );
}
