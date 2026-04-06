'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function GenerateNewsletterButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [issueId, setIssueId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (status === 'loading') return;
    setStatus('loading');
    setMessage('');
    setIssueId(null);

    try {
      const res = await fetch('/api/newsletter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Generation failed');
        return;
      }

      setStatus('success');
      setMessage(`Done! ${data.recipient_count} sent · ${data.failed_count ?? 0} failed`);
      setIssueId(data.issue_id ?? null);
      setTimeout(() => window.location.reload(), 4000);
    } catch {
      setStatus('error');
      setMessage('An unexpected error occurred. Check server logs.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
      <button
        onClick={handleGenerate}
        disabled={status === 'loading'}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '9px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
          color: '#fff', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
          border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          opacity: status === 'loading' ? 0.6 : 1,
          boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
        }}
      >
        {status === 'loading' ? '⏳ Generating...' : '🤖 Generate & Send Newsletter'}
      </button>
      {message && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <p style={{ fontSize: '12px', color: status === 'success' ? '#34D399' : '#F87171', margin: 0 }}>
            {message}
          </p>
          {status === 'success' && issueId && (
            <Link
              href={`/newsletter/${issueId}`}
              style={{ fontSize: '12px', color: '#60A5FA', textDecoration: 'underline' }}
            >
              View issue →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
