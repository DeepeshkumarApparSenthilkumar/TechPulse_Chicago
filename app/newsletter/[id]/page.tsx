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
    <div className="min-h-screen pt-20 page-transition">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/newsletter" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Newsletter
        </Link>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <span className="text-xs font-medium cat-finops px-2 py-1 rounded-md inline-block mb-3">FinOps Digest</span>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {ni.subject ?? `FinOps Digest — ${ni.month_year}`}
            </h1>
            {ni.preview_text && <p className="text-slate-400 mt-2">{ni.preview_text}</p>}
          </div>

          {ni.html_body ? (
            <div
              className="p-6 prose prose-invert max-w-none prose-headings:text-white prose-a:text-blue-400"
              dangerouslySetInnerHTML={{ __html: ni.html_body }}
            />
          ) : ni.text_body ? (
            <div className="p-6 text-slate-300 whitespace-pre-wrap leading-relaxed">{ni.text_body}</div>
          ) : (
            <div className="p-6 text-slate-400 text-center">No content available for this issue.</div>
          )}
        </div>
      </div>
    </div>
  );
}
