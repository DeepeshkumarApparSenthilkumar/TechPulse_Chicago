import Link from 'next/link';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const { status } = await searchParams;

  const config = {
    success: {
      icon: <CheckCircle className="w-12 h-12 text-emerald-400" />,
      title: "You've been unsubscribed",
      message: "You won't receive any more FinOps Digest emails. You can re-subscribe anytime.",
      bg: 'rgba(16,185,129,0.15)',
    },
    error: {
      icon: <XCircle className="w-12 h-12 text-red-400" />,
      title: 'Something went wrong',
      message: 'We could not process your unsubscribe request. Please try again or contact us.',
      bg: 'rgba(239,68,68,0.15)',
    },
    invalid: {
      icon: <AlertCircle className="w-12 h-12 text-amber-400" />,
      title: 'Invalid unsubscribe link',
      message: 'This unsubscribe link is invalid or has expired.',
      bg: 'rgba(245,158,11,0.15)',
    },
  };

  const cfg = config[(status as keyof typeof config) ?? 'invalid'] ?? config.invalid;

  return (
    <div className="min-h-screen pt-20 page-transition flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="glass rounded-2xl p-10 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: cfg.bg }}
          >
            {cfg.icon}
          </div>
          <h1
            className="text-2xl font-bold text-white mb-3"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {cfg.title}
          </h1>
          <p className="text-slate-400 mb-8">{cfg.message}</p>
          <Link
            href="/newsletter"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
          >
            Back to Newsletter
          </Link>
        </div>
      </div>
    </div>
  );
}
