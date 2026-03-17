import { createClient } from '@/lib/supabase/server';
import SubscribeForm from '@/components/newsletter/SubscribeForm';
import Link from 'next/link';
import { formatEventDate } from '@/lib/utils';
import type { NewsletterIssue } from '@/types';

export default async function NewsletterPage() {
  const supabase = await createClient();
  const { data: issues } = await supabase
    .from('newsletter_issues')
    .select('id, month_year, subject, preview_text, sent_at, recipient_count')
    .not('sent_at', 'is', null)
    .order('sent_at', { ascending: false })
    .limit(12);

  return (
    <div className="min-h-screen pt-20 page-transition">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 cat-finops">
            🤖 AI-Powered · Monthly
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            FinOps <span className="gradient-text">Intelligence</span> Digest
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Every month, our AI (Claude) web-searches for the latest pricing changes, cost optimizations, and FinOps updates — compiled into one expert digest.
          </p>
        </div>

        {/* Platform coverage */}
        <div className="glass rounded-2xl p-6 mb-12">
          <h2 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Platforms Covered</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {['Snowflake', 'Databricks', 'BigQuery', 'Redshift', 'Azure Fabric'].map((p) => (
              <div key={p} className="glass rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">☁️</div>
                <div className="text-xs font-medium text-slate-300">{p}</div>
              </div>
            ))}
          </div>
        </div>

        {/* What Claude does */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: '🔍', title: 'AI Web Search', desc: 'Claude searches vendor docs, release notes, and official blogs every month' },
            { icon: '📊', title: 'Evidence-Backed', desc: 'Every claim is verified against official sources — no hallucinations, all citations included' },
            { icon: '💡', title: 'Actionable Insights', desc: 'Executive summary + practitioner deep-dive with optimization plays and action checklists' },
          ].map((item) => (
            <div key={item.title} className="glass rounded-2xl p-5">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{item.title}</h3>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Subscribe form */}
        <div className="max-w-xl mx-auto mb-16">
          <SubscribeForm />
        </div>

        {/* Archive */}
        {issues && issues.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Past <span className="gradient-text">Issues</span>
            </h2>
            <div className="space-y-3">
              {(issues as NewsletterIssue[]).map((issue) => (
                <Link
                  key={issue.id}
                  href={`/newsletter/${issue.id}`}
                  className="glass glass-hover rounded-xl p-5 flex items-center justify-between group"
                >
                  <div>
                    <div className="font-medium text-white group-hover:text-blue-400 transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {issue.subject ?? `FinOps Digest — ${issue.month_year}`}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">{issue.preview_text ?? issue.month_year}</div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className="text-xs text-slate-400">{issue.sent_at ? formatEventDate(issue.sent_at) : issue.month_year}</div>
                    {issue.recipient_count && (
                      <div className="text-xs text-slate-500 mt-0.5">{issue.recipient_count} recipients</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
