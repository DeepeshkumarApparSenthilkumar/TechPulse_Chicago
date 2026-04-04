import Link from 'next/link';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const { status } = await searchParams;

  const config = {
    success: {
      icon: <CheckCircle style={{ width: '56px', height: '56px', color: '#34D399' }} />,
      title: "You've been unsubscribed",
      message: "You'll no longer receive the TechPulse FinOps Digest. We're sorry to see you go.",
      color: '#34D399',
    },
    already: {
      icon: <AlertCircle style={{ width: '56px', height: '56px', color: '#FBBF24' }} />,
      title: 'Already unsubscribed',
      message: 'This email is already inactive. You will not receive any future newsletters.',
      color: '#FBBF24',
    },
    invalid: {
      icon: <XCircle style={{ width: '56px', height: '56px', color: '#F87171' }} />,
      title: 'Invalid link',
      message: 'This unsubscribe link is invalid or has expired. Please contact us if you need help.',
      color: '#F87171',
    },
  }[status ?? 'invalid'] ?? {
    icon: <AlertCircle style={{ width: '56px', height: '56px', color: '#94A3B8' }} />,
    title: 'Something went wrong',
    message: 'We could not process your request. Please try again or contact support.',
    color: '#94A3B8',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }} className="page-transition">
      <div style={{ maxWidth: '440px', width: '100%' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '48px 32px', textAlign: 'center', backdropFilter: 'blur(16px)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>{config.icon}</div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: config.color, marginBottom: '12px', fontFamily: 'Space Grotesk, sans-serif' }}>
            {config.title}
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: 1.7, marginBottom: '32px' }}>{config.message}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
            <Link
              href="/newsletter"
              style={{ display: 'inline-flex', padding: '12px 28px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', textDecoration: 'none' }}
            >
              Re-subscribe
            </Link>
            <Link
              href="/"
              style={{ display: 'inline-flex', padding: '12px 28px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
