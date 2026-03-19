'use client';

import { useState } from 'react';
import { Mail, Check, Sparkles } from 'lucide-react';
import { FINOPS_TOPICS } from '@/types';

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '12px',
  padding: '12px 16px',
  fontSize: '14px',
  color: '#F8FAFC',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const toggleTopic = (topic: string) =>
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, topics }),
      });
      if (!res.ok) throw new Error('Subscription failed');
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        background: 'rgba(16,185,129,0.08)',
        border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: '20px',
        padding: '48px 32px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'rgba(16,185,129,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 0 32px rgba(16,185,129,0.3)',
        }}>
          <Check style={{ width: '28px', height: '28px', color: '#34D399' }} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>
          You&apos;re subscribed!
        </h3>
        <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: 1.7 }}>
          You&apos;ll receive the next FinOps digest in your inbox.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '20px',
      padding: '32px',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Mail style={{ width: '16px', height: '16px', color: '#fff' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.2 }}>
            Subscribe to FinOps Digest
          </h3>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Monthly · AI-generated · Free forever</p>
        </div>
      </div>

      {/* Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setFocused('name')}
          onBlur={() => setFocused(null)}
          style={{
            ...inputStyle,
            borderColor: focused === 'name' ? '#3B82F6' : 'rgba(255,255,255,0.12)',
            boxShadow: focused === 'name' ? '0 0 0 3px rgba(59,130,246,0.18)' : 'none',
          }}
        />
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
          style={{
            ...inputStyle,
            borderColor: focused === 'email' ? '#3B82F6' : 'rgba(255,255,255,0.12)',
            boxShadow: focused === 'email' ? '0 0 0 3px rgba(59,130,246,0.18)' : 'none',
          }}
        />
      </div>

      {/* Topics */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '11px', color: '#64748B', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Topics (optional)
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {FINOPS_TOPICS.map((topic) => {
            const active = topics.includes(topic);
            return (
              <button
                key={topic}
                type="button"
                onClick={() => toggleTopic(topic)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  background: active ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                  color: active ? '#60A5FA' : '#94A3B8',
                  border: `1px solid ${active ? 'rgba(59,130,246,0.45)' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                {topic}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p style={{ fontSize: '13px', color: '#F87171', marginBottom: '12px' }}>{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '13px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 700,
          color: '#fff',
          background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3B82F6, #7C3AED)',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: loading ? 'none' : '0 4px 20px rgba(59,130,246,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        {loading ? (
          'Subscribing...'
        ) : (
          <>
            <Sparkles style={{ width: '15px', height: '15px' }} />
            Subscribe — It&apos;s Free
          </>
        )}
      </button>

      <p style={{ fontSize: '12px', color: '#475569', textAlign: 'center' }}>
        Sent monthly. Unsubscribe anytime. No spam, ever.
      </p>
    </form>
  );
}
