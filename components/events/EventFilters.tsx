'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';

const categories = ['AI/ML', 'Web Dev', 'DevOps', 'FinOps', 'Startup', 'Networking'];
const formats = [
  { label: 'All',       value: '' },
  { label: 'In-Person', value: 'in-person' },
  { label: 'Online',    value: 'online' },
];

const sectionLabel: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700, color: '#64748B',
  textTransform: 'uppercase', letterSpacing: '0.1em',
  marginBottom: '8px', display: 'block',
};

export default function EventFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const currentCategory = params.get('category') ?? '';
  const currentFormat   = params.get('format')   ?? '';

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value); else p.delete(key);
    router.push(`/events?${p.toString()}`);
  };

  const filterBtn = (active: boolean): React.CSSProperties => ({
    width: '100%', textAlign: 'left',
    padding: '9px 12px', borderRadius: '8px',
    fontSize: '13px', fontWeight: active ? 600 : 400,
    cursor: 'pointer', border: 'none',
    transition: 'all 0.15s ease',
    background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
    color: active ? '#60A5FA' : '#CBD5E1',
    display: 'block', marginBottom: '2px',
  });

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: '20px',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <Filter style={{ width: '15px', height: '15px', color: '#60A5FA', flexShrink: 0 }} />
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Filters</span>
      </div>

      {/* Categories */}
      <div style={{ marginBottom: '20px' }}>
        <span style={sectionLabel}>Category</span>
        <button style={filterBtn(!currentCategory)} onClick={() => updateParam('category', '')}>
          All Categories
        </button>
        {categories.map((cat) => (
          <button key={cat} style={filterBtn(currentCategory === cat)} onClick={() => updateParam('category', cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* Format */}
      <div>
        <span style={sectionLabel}>Format</span>
        {formats.map((f) => (
          <button key={f.value} style={filterBtn(currentFormat === f.value)} onClick={() => updateParam('format', f.value)}>
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
