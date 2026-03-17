'use client';

import { useState } from 'react';
import { Search, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { RSVP } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  rsvps: (RSVP & { profile: { full_name: string } })[];
  eventId: string;
}

export default function CheckinClient({ rsvps: initialRsvps, eventId }: Props) {
  const [rsvps, setRsvps] = useState(initialRsvps);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  const filtered = rsvps.filter((r) =>
    r.profile?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckin = async (rsvpId: string, currentStatus: boolean) => {
    setLoading(rsvpId);
    const checked_in = !currentStatus;
    await supabase.from('rsvps').update({
      checked_in,
      checked_in_at: checked_in ? new Date().toISOString() : null,
    }).eq('id', rsvpId);
    setRsvps((prev) => prev.map((r) => r.id === rsvpId ? { ...r, checked_in } : r));
    setLoading(null);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="search"
          placeholder="Search attendees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-dark w-full pl-11 pr-4 py-3 rounded-xl text-sm"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((rsvp) => (
          <div key={rsvp.id} className={cn('glass rounded-xl p-4 flex items-center gap-4 transition-all', rsvp.checked_in && 'border-emerald-500/30 bg-emerald-500/5')}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: rsvp.checked_in ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
              {rsvp.checked_in ? <Check className="w-4 h-4 text-emerald-400" /> : rsvp.profile?.full_name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1">
              <div className="font-medium text-white">{rsvp.profile?.full_name ?? 'Attendee'}</div>
              {rsvp.checked_in && <div className="text-xs text-emerald-400">Checked in</div>}
            </div>
            <button
              onClick={() => handleCheckin(rsvp.id, rsvp.checked_in)}
              disabled={loading === rsvp.id}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all min-w-[90px]',
                rsvp.checked_in
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10'
                  : 'text-white hover:opacity-90',
                loading === rsvp.id && 'opacity-50'
              )}
              style={!rsvp.checked_in ? { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' } : {}}
            >
              {loading === rsvp.id ? '...' : rsvp.checked_in ? '✓ Done' : 'Check In'}
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="glass rounded-xl p-8 text-center text-slate-400">
            No attendees found
          </div>
        )}
      </div>
    </div>
  );
}
