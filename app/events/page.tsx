export const revalidate = 30;

import { createClient } from '@/lib/supabase/server';
import EventGrid from '@/components/events/EventGrid';
import EventFilters from '@/components/events/EventFilters';
import { Search } from 'lucide-react';
import type { Event } from '@/types';
import { Suspense } from 'react';

interface EventsPageProps {
  searchParams: Promise<{ category?: string; format?: string; q?: string; sort?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('events')
    .select('*, organizer:profiles(*)')
    .eq('status', 'published');

  if (params.category) query = query.eq('category', params.category);
  if (params.format === 'online')    query = query.eq('is_online', true);
  if (params.format === 'in-person') query = query.eq('is_online', false);
  if (params.q) query = query.ilike('title', `%${params.q}%`);
  if (params.sort === 'popular') query = query.order('rsvp_count', { ascending: false });
  else query = query.order('start_time', { ascending: true });

  const { data: events } = await query.limit(24);

  return (
    <div style={{ minHeight: '100vh', padding: '48px 0 80px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>
            Explore <span className="gradient-text">Events</span>
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '15px' }}>Discover Chicago&apos;s best tech events</p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '560px', marginBottom: '32px' }}>
          <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#64748B', pointerEvents: 'none' }} />
          <form>
            <input
              name="q"
              type="search"
              defaultValue={params.q ?? ''}
              placeholder="Search events..."
              style={{
                width: '100%',
                paddingLeft: '42px', paddingRight: '16px',
                paddingTop: '12px', paddingBottom: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '14px', color: '#F8FAFC',
                outline: 'none',
              }}
            />
          </form>
        </div>

        {/* Layout: sidebar + content */}
        <div className="layout-sidebar">
          {/* Filters */}
          <aside className="layout-sidebar-nav">
            <Suspense>
              <EventFilters />
            </Suspense>
          </aside>

          {/* Events */}
          <div className="layout-sidebar-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px' }}>
              <p style={{ fontSize: '14px', color: '#64748B' }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>{events?.length ?? 0}</span> events found
              </p>
              <form>
                <select
                  name="sort"
                  defaultValue={params.sort ?? 'upcoming'}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    fontSize: '13px', color: '#CBD5E1',
                    cursor: 'pointer',
                  }}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="popular">Most Popular</option>
                </select>
              </form>
            </div>
            <EventGrid events={(events ?? []) as Event[]} />
          </div>
        </div>
      </div>
    </div>
  );
}
