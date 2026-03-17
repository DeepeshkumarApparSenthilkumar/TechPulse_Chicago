'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';

const categories = ['AI/ML', 'Web Dev', 'DevOps', 'FinOps', 'Startup', 'Networking'];
const formats = [{ label: 'All', value: '' }, { label: 'In-Person', value: 'in-person' }, { label: 'Online', value: 'online' }];

export default function EventFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const currentCategory = params.get('category') ?? '';
  const currentFormat = params.get('format') ?? '';

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    router.push(`/events?${p.toString()}`);
  };

  return (
    <div className="glass rounded-2xl p-5 space-y-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Filter className="w-4 h-4 text-blue-400" />
        Filters
      </div>

      {/* Categories */}
      <div>
        <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Category</p>
        <div className="space-y-1">
          <button
            onClick={() => updateParam('category', '')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!currentCategory ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300 hover:bg-white/5'}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateParam('category', cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${currentCategory === cat ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300 hover:bg-white/5'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Format */}
      <div>
        <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Format</p>
        <div className="space-y-1">
          {formats.map((f) => (
            <button
              key={f.value}
              onClick={() => updateParam('format', f.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${currentFormat === f.value ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300 hover:bg-white/5'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
