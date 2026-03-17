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
  if (params.format === 'online') query = query.eq('is_online', true);
  if (params.format === 'in-person') query = query.eq('is_online', false);
  if (params.q) query = query.ilike('title', `%${params.q}%`);

  if (params.sort === 'popular') {
    query = query.order('rsvp_count', { ascending: false });
  } else {
    query = query.order('start_time', { ascending: true });
  }

  const { data: events } = await query.limit(24);

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Explore <span className="gradient-text">Events</span>
          </h1>
          <p className="text-slate-400">Discover Chicago's best tech events</p>
        </div>

        {/* Search bar */}
        <div className="relative mb-8 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <form>
            <input
              name="q"
              type="search"
              defaultValue={params.q ?? ''}
              placeholder="Search events..."
              className="input-dark w-full pl-11 pr-4 py-3 rounded-xl text-sm"
            />
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <Suspense>
              <EventFilters />
            </Suspense>
          </aside>

          {/* Events grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-400">
                {events?.length ?? 0} events found
              </p>
              <form className="flex items-center gap-2">
                <select
                  name="sort"
                  defaultValue={params.sort ?? 'upcoming'}
                  className="input-dark px-3 py-2 rounded-lg text-sm"
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
