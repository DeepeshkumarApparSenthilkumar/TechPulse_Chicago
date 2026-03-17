'use client';

import { useState } from 'react';
import { Mail, Check } from 'lucide-react';
import { FINOPS_TOPICS } from '@/types';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const toggleTopic = (topic: string) => {
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

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
      <div className="glass rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(16,185,129,0.2)' }}>
          <Check className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>You're subscribed!</h3>
        <p className="text-slate-400">You'll receive the next FinOps digest in your inbox.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Subscribe to FinOps Digest
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-dark px-4 py-3 rounded-xl text-sm w-full"
        />
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-dark px-4 py-3 rounded-xl text-sm w-full"
        />
      </div>

      <div>
        <p className="text-xs text-slate-400 mb-2">Topics (optional)</p>
        <div className="flex flex-wrap gap-2">
          {FINOPS_TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => toggleTopic(topic)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                topics.includes(topic)
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                  : 'text-slate-400 border-white/10 hover:border-blue-500/30 hover:text-white'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
      >
        {loading ? 'Subscribing...' : 'Subscribe — It\'s Free'}
      </button>

      <p className="text-xs text-slate-500 text-center">
        Sent monthly. Unsubscribe anytime. No spam.
      </p>
    </form>
  );
}
