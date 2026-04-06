'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Zap, Twitter, Linkedin, Github } from 'lucide-react';

const quickLinks = [
  { href: '/events', label: 'Explore Events' },
  { href: '/create-event', label: 'Host an Event' },
  { href: '/newsletter', label: 'Newsletter' },
  { href: '/dashboard', label: 'Dashboard' },
];

const categories = ['AI/ML', 'Web Dev', 'DevOps', 'FinOps', 'Startup', 'Networking'];
const socials = [
  { label: 'Twitter', Icon: Twitter, href: 'https://twitter.com/techpulsechicago' },
  { label: 'LinkedIn', Icon: Linkedin, href: 'https://linkedin.com/company/techpulsechicago' },
  { label: 'GitHub', Icon: Github, href: 'https://github.com/DeepeshkumarApparSenthilkumar/TechPulse_Chicago' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <footer style={{ borderTop: '1px solid rgba(59,130,246,0.15)', background: 'rgba(2,5,14,0.95)', marginTop: '0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 32px 48px' }}>

        {/* Grid */}
        <div className="footer-grid">

          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '16px', textDecoration: 'none' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap style={{ width: '18px', height: '18px', color: '#fff' }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>
                <span style={{ color: '#fff' }}>TechPulse</span>{' '}
                <span style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Chicago</span>
              </span>
            </Link>
            <p style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.7, marginBottom: '20px', maxWidth: '260px' }}>
              Chicago&apos;s premier tech community hub. Discover events, connect with developers, and stay ahead with AI-powered FinOps insights.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {socials.map(({ label, Icon, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ width: '34px', height: '34px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748B', transition: 'all 0.2s', textDecoration: 'none' }}>
                  <Icon style={{ width: '15px', height: '15px' }} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#fff', marginBottom: '20px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Links</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none', transition: 'color 0.2s' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#fff', marginBottom: '20px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Categories</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categories.map((cat) => (
                <li key={cat}>
                  <Link href={`/events?category=${encodeURIComponent(cat)}`} style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none', transition: 'color 0.2s' }}>
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#fff', marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>FinOps Digest</h3>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, marginBottom: '16px' }}>
              Monthly AI-powered cloud cost insights. Free, always.
            </p>
            {status === 'done' ? (
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#34D399' }}>
                ✓ You&apos;re subscribed!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#F8FAFC', outline: 'none', width: '100%' }}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{ padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', border: 'none', cursor: 'pointer', opacity: status === 'loading' ? 0.6 : 1 }}
                >
                  {status === 'loading' ? 'Subscribing...' : 'Subscribe — Free'}
                </button>
                {status === 'error' && <p style={{ fontSize: '12px', color: '#F87171', margin: 0 }}>Something went wrong. Try again.</p>}
              </form>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '48px', paddingTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '13px', color: '#334155' }}>
            © {new Date().getFullYear()} TechPulse Chicago. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/newsletter" style={{ fontSize: '13px', color: '#334155', textDecoration: 'none' }}>Newsletter</Link>
            <Link href="/events" style={{ fontSize: '13px', color: '#334155', textDecoration: 'none' }}>Events</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
