'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Search, UserX, UserCheck, Trash2, Download, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  topics: string[] | null;
  is_active: boolean;
  subscribed_at: string;
}

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
  backdropFilter: 'blur(16px)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 16px 10px 40px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  fontSize: '14px',
  color: '#F8FAFC',
  outline: 'none',
  boxSizing: 'border-box',
};

export default function SubscribersPage() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filtered, setFiltered] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [actionId, setActionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') { router.push('/dashboard'); return; }

    const { data } = await supabase
      .from('newsletter_subscriptions')
      .select('id, email, name, topics, is_active, subscribed_at')
      .order('subscribed_at', { ascending: false });

    setSubscribers(data ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let list = subscribers;
    if (filterStatus === 'active') list = list.filter((s) => s.is_active);
    if (filterStatus === 'inactive') list = list.filter((s) => !s.is_active);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.email.toLowerCase().includes(q) || s.name?.toLowerCase().includes(q));
    }
    setFiltered(list);
  }, [subscribers, search, filterStatus]);

  const toggle = async (id: string, currentActive: boolean) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/subscribers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentActive }),
      });
      if (!res.ok) throw new Error();
      setSubscribers((prev) => prev.map((s) => s.id === id ? { ...s, is_active: !currentActive } : s));
      showToast(currentActive ? 'Subscriber deactivated' : 'Subscriber activated', 'success');
    } catch {
      showToast('Action failed', 'error');
    } finally {
      setActionId(null);
    }
  };

  const remove = async (id: string, email: string) => {
    if (!confirm(`Delete subscriber ${email}? This cannot be undone.`)) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      showToast('Subscriber deleted', 'success');
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setActionId(null);
    }
  };

  const exportCsv = () => {
    const rows = [
      ['Email', 'Name', 'Status', 'Topics', 'Subscribed At'],
      ...filtered.map((s) => [
        s.email,
        s.name ?? '',
        s.is_active ? 'active' : 'inactive',
        (s.topics ?? []).join('; '),
        new Date(s.subscribed_at).toLocaleDateString(),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeCount = subscribers.filter((s) => s.is_active).length;
  const inactiveCount = subscribers.filter((s) => !s.is_active).length;

  const btnStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
    color: '#CBD5E1', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
  };

  return (
    <div style={{ minHeight: '100vh', padding: '48px 0 80px' }} className="page-transition">
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B', textDecoration: 'none', marginBottom: '12px' }}>
              <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Admin
            </Link>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>
              Newsletter <span className="gradient-text">Subscribers</span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={load} style={btnStyle}>
              <RefreshCw style={{ width: '14px', height: '14px' }} /> Refresh
            </button>
            <button onClick={exportCsv} style={btnStyle}>
              <Download style={{ width: '14px', height: '14px' }} /> Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-3col" style={{ marginBottom: '24px' }}>
          {[
            { label: 'Total', value: subscribers.length, color: '#3B82F6' },
            { label: 'Active', value: activeCount, color: '#10B981' },
            { label: 'Inactive', value: inactiveCount, color: '#64748B' },
          ].map((stat) => (
            <div key={stat.label} style={{ ...glassCard, padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color, fontFamily: 'Space Grotesk, sans-serif' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#475569', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['all', 'active', 'inactive'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
                  cursor: 'pointer', textTransform: 'capitalize',
                  border: `1px solid ${filterStatus === s ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  background: filterStatus === s ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)',
                  color: filterStatus === s ? '#60A5FA' : '#94A3B8',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ ...glassCard, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '64px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>Loading subscribers...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>No subscribers found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Email', 'Name', 'Topics', 'Subscribed', 'Status', 'Actions'].map((h, i) => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: i === 5 ? 'right' : 'left', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub) => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{sub.email}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '13px', color: '#CBD5E1' }}>{sub.name ?? '—'}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {sub.topics && sub.topics.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {sub.topics.map((t) => (
                              <span key={t} style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>{t}</span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#475569' }}>All topics</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '12px', color: '#475569' }}>
                          {new Date(sub.subscribed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
                          ...(sub.is_active
                            ? { background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.25)' }
                            : { background: 'rgba(255,255,255,0.06)', color: '#64748B', border: '1px solid rgba(255,255,255,0.1)' }),
                        }}>
                          {sub.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => toggle(sub.id, sub.is_active)}
                            disabled={actionId === sub.id}
                            title={sub.is_active ? 'Deactivate' : 'Activate'}
                            style={{ padding: '6px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8', opacity: actionId === sub.id ? 0.4 : 1 }}
                          >
                            {sub.is_active ? <UserX style={{ width: '15px', height: '15px' }} /> : <UserCheck style={{ width: '15px', height: '15px' }} />}
                          </button>
                          <button
                            onClick={() => remove(sub.id, sub.email)}
                            disabled={actionId === sub.id}
                            title="Delete permanently"
                            style={{ padding: '6px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8', opacity: actionId === sub.id ? 0.4 : 1 }}
                          >
                            <Trash2 style={{ width: '15px', height: '15px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p style={{ fontSize: '12px', color: '#475569', marginTop: '16px', textAlign: 'center' }}>
          Showing {filtered.length} of {subscribers.length} subscribers
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 500,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          ...(toast.type === 'success'
            ? { background: 'rgba(16,185,129,0.15)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)' }
            : { background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }),
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
