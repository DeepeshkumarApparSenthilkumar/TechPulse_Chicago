import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { NewsletterIssue } from '@/types';

interface Props { params: Promise<{ id: string }> }

export default async function NewsletterIssuePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: issue } = await supabase.from('newsletter_issues').select('*').eq('id', id).single();

  if (!issue) notFound();
  const ni = issue as NewsletterIssue;

  return (
    <div style={{ minHeight: '100vh', padding: '80px 0 80px' }} className="page-transition">
      <div style={{ maxWidth: '896px', margin: '0 auto', padding: '0 24px' }}>

        <Link href="/newsletter" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B', textDecoration: 'none', marginBottom: '24px' }}>
          <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Newsletter
        </Link>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', backdropFilter: 'blur(16px)' }}>
          {/* Header */}
          <div style={{ padding: '28px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="cat-finops" style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, marginBottom: '12px' }}>FinOps Digest</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.2 }}>
              {ni.subject ?? `FinOps Digest — ${ni.month_year}`}
            </h1>
            {ni.preview_text && <p style={{ color: '#94A3B8', marginTop: '8px', fontSize: '14px' }}>{ni.preview_text}</p>}
          </div>

          {/* Body */}
          {ni.html_body ? (
            <div
              style={{ padding: '28px', color: '#CBD5E1', lineHeight: 1.8, fontSize: '14px' }}
              dangerouslySetInnerHTML={{ __html: ni.html_body }}
            />
          ) : ni.text_body ? (
            <div style={{ padding: '28px', color: '#CBD5E1', whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '14px' }}>{ni.text_body}</div>
          ) : (
            <div style={{ padding: '48px', color: '#64748B', textAlign: 'center', fontSize: '14px' }}>No content available for this issue.</div>
          )}
        </div>
      </div>
    </div>
  );
}
