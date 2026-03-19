'use client';

import { useState } from 'react';
import { Search, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { RSVP } from '@/types';

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

  // suppress unused import warning
  void eventId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#475569', pointerEvents: 'none' }} />
        <input
          type="search"
          placeholder="Search attendees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px 12px 42px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            color: '#F8FAFC',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Attendee list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map((rsvp) => (
          <div
            key={rsvp.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '14px 16px', borderRadius: '14px',
              background: rsvp.checked_in ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${rsvp.checked_in ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.08)'}`,
              backdropFilter: 'blur(16px)',
            }}
          >
            <div
              style={{
                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 700, color: rsvp.checked_in ? '#34D399' : '#fff',
                background: rsvp.checked_in ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              }}
            >
              {rsvp.checked_in ? <Check style={{ width: '16px', height: '16px' }} /> : rsvp.profile?.full_name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>{rsvp.profile?.full_name ?? 'Attendee'}</div>
              {rsvp.checked_in && <div style={{ fontSize: '12px', color: '#34D399', marginTop: '2px' }}>Checked in</div>}
            </div>
            <button
              onClick={() => handleCheckin(rsvp.id, rsvp.checked_in)}
              disabled={loading === rsvp.id}
              style={{
                padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                minWidth: '90px', cursor: loading === rsvp.id ? 'not-allowed' : 'pointer',
                opacity: loading === rsvp.id ? 0.5 : 1,
                ...(rsvp.checked_in
                  ? { background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)' }
                  : { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff', border: 'none' }),
              }}
            >
              {loading === rsvp.id ? '...' : rsvp.checked_in ? '✓ Done' : 'Check In'}
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '48px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
            No attendees found
          </div>
        )}
      </div>
    </div>
  );
}
