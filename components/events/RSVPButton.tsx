'use client';

import { useState } from 'react';
import { Check, Clock, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRSVPStore } from '@/store/rsvpStore';
import type { Event } from '@/types';
import { useRouter } from 'next/navigation';

interface RSVPButtonProps {
  event: Event;
  compact?: boolean;
  currentStatus?: 'going' | 'waitlist' | 'cancelled' | null;
}

export default function RSVPButton({ event, compact = false, currentStatus }: RSVPButtonProps) {
  const { user } = useAuthStore();
  const { rsvps, rsvpCounts, optimisticRSVP } = useRSVPStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const status = rsvps[event.id] ?? currentStatus ?? null;
  const count = rsvpCounts[event.id] ?? event.rsvp_count;
  const isGoing = status === 'going';

  const handleRSVP = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (event.status === 'cancelled') return;

    setLoading(true);
    const newStatus = isGoing ? 'cancelled' : 'going';
    optimisticRSVP(event.id, newStatus, count);

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: event.id, status: newStatus }),
      });
      if (!response.ok) throw new Error('RSVP failed');
    } catch {
      optimisticRSVP(event.id, isGoing ? 'going' : 'cancelled', count);
    } finally {
      setLoading(false);
    }
  };

  const goingStyle: React.CSSProperties = {
    background: 'rgba(16,185,129,0.12)',
    color: '#34D399',
    border: '1px solid rgba(16,185,129,0.3)',
  };

  const defaultStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
    color: '#fff',
    border: 'none',
  };

  if (compact) {
    return (
      <button
        onClick={handleRSVP}
        disabled={loading || event.status === 'cancelled'}
        style={{
          width: '100%', padding: '9px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
          cursor: loading || event.status === 'cancelled' ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          ...(isGoing ? goingStyle : defaultStyle),
        }}
      >
        {loading ? (
          <><Clock style={{ width: '13px', height: '13px' }} /> Loading...</>
        ) : isGoing ? (
          <><Check style={{ width: '13px', height: '13px' }} /> Going ✓</>
        ) : 'RSVP Free'}
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <button
        onClick={handleRSVP}
        disabled={loading || event.status === 'cancelled'}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '13px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 700,
          cursor: loading || event.status === 'cancelled' ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1,
          ...(isGoing ? goingStyle : defaultStyle),
        }}
      >
        {loading ? (
          <><Clock style={{ width: '16px', height: '16px' }} /> Processing...</>
        ) : isGoing ? (
          <><Check style={{ width: '16px', height: '16px' }} /> You&apos;re Going!</>
        ) : (
          <span>RSVP &mdash; It&apos;s Free</span>
        )}
      </button>
      {isGoing && (
        <button
          onClick={handleRSVP}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '13px 16px', borderRadius: '12px', fontSize: '13px',
            color: '#94A3B8', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
          }}
        >
          <X style={{ width: '15px', height: '15px' }} /> Cancel
        </button>
      )}
    </div>
  );
}
