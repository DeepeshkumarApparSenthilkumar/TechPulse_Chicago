'use client';

import { useState } from 'react';

export default function GenerateNewsletterButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleGenerate = async () => {
    if (status === 'loading') return;
    setStatus('loading');
    setMessage('');

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
      setMessage(
        `Generated! Issue ID: ${data.issue_id} · ${data.recipient_count} recipients · ${data.email_results?.sent ?? 0} emails sent`
      );
      // Refresh after 3 seconds to show new issue in list
      setTimeout(() => window.location.reload(), 3000);
    } catch {
      setStatus('error');
      setMessage('An unexpected error occurred. Check server logs.');
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleGenerate}
        disabled={status === 'loading'}
        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
        style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
      >
        {status === 'loading' ? '⏳ Generating...' : '🤖 Generate & Send Newsletter'}
      </button>
      {message && (
        <p className={`text-xs ${status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
