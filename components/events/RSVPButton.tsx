'use client';

import { useState } from 'react';
import { Check, Clock, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRSVPStore } from '@/store/rsvpStore';
import { createClient } from '@/lib/supabase/client';
import type { Event } from '@/types';
import { cn } from '@/lib/utils';
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
  const supabase = createClient();

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

    // Optimistic update
    optimisticRSVP(event.id, newStatus, count);

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: event.id, status: newStatus }),
      });

      if (!response.ok) throw new Error('RSVP failed');
    } catch {
      // Revert optimistic update
      optimisticRSVP(event.id, isGoing ? 'going' : 'cancelled', count);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleRSVP}
        disabled={loading || event.status === 'cancelled'}
        className={cn(
          'w-full py-2 rounded-lg text-sm font-medium transition-all',
          isGoing
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
            : 'text-white hover:opacity-90',
          loading && 'opacity-50 cursor-not-allowed'
        )}
        style={!isGoing ? { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' } : {}}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5 animate-spin" /> Loading...
          </span>
        ) : isGoing ? (
          <span className="flex items-center justify-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> Going ✓
          </span>
        ) : (
          'RSVP Free'
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleRSVP}
        disabled={loading || event.status === 'cancelled'}
        className={cn(
          'flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold transition-all',
          isGoing
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
            : 'text-white hover:opacity-90',
          loading && 'opacity-50 cursor-not-allowed'
        )}
        style={!isGoing ? { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' } : {}}
      >
        {loading ? (
          <>
            <Clock className="w-4 h-4 animate-spin" /> Processing...
          </>
        ) : isGoing ? (
          <>
            <Check className="w-4 h-4" /> You're Going!
          </>
        ) : (
          'RSVP — It's Free'
        )}
      </button>
      {isGoing && (
        <button
          onClick={handleRSVP}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-3 rounded-xl text-sm text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-400/30 transition-all"
        >
          <X className="w-4 h-4" /> Cancel
        </button>
      )}
    </div>
  );
}
