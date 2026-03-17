import HeroSection from '@/components/hero/HeroSection';
import EventCard from '@/components/events/EventCard';
import SubscribeForm from '@/components/newsletter/SubscribeForm';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowRight, Zap, Brain, Cloud, Network } from 'lucide-react';
import type { Event } from '@/types';

const categories = [
  { name: 'AI/ML', icon: Brain, catClass: 'cat-ai' },
  { name: 'Web Dev', icon: Zap, catClass: 'cat-web' },
  { name: 'DevOps', icon: Cloud, catClass: 'cat-devops' },
  { name: 'FinOps', icon: Cloud, catClass: 'cat-finops' },
  { name: 'Startup', icon: Zap, catClass: 'cat-startup' },
  { name: 'Networking', icon: Network, catClass: 'cat-networking' },
];

export default async function HomePage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from('events')
    .select('*, organizer:profiles(*)')
    .eq('status', 'published')
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(6);

  const [{ count: eventCount }, { count: memberCount }, { count: orgCount }] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'organizer'),
  ]);

  const stats = { events: eventCount ?? 0, members: memberCount ?? 0, organizers: orgCount ?? 0 };

  return (
    <div className="page-transition">
      <HeroSection stats={stats} />

      {/* Category Pills */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Explore by <span className="gradient-text">Category</span>
          </h2>
          <p className="text-slate-400">Find events that match your interests</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map(({ name, icon: Icon, catClass }) => (
            <Link
              key={name}
              href={`/events?category=${encodeURIComponent(name)}`}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${catClass}`}
            >
              <Icon className="w-4 h-4" />
              {name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Events */}
      {events && events.length > 0 && (
        <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Upcoming <span className="gradient-text">Events</span>
              </h2>
              <p className="text-slate-400 mt-1">Don&apos;t miss what&apos;s happening in Chicago&apos;s tech scene</p>
            </div>
            <Link href="/events" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(events as Event[]).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }} />
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 cat-finops">🤖 AI-Powered</div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Stay on top of <span className="gradient-text">FinOps</span>
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Our AI (Claude) searches the web every month to compile the latest pricing changes, cost optimizations, and FinOps updates across Snowflake, Databricks, BigQuery, Redshift, and Azure Fabric.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Snowflake', 'Databricks', 'BigQuery', 'Redshift', 'Azure'].map((p) => (
                  <span key={p} className="px-3 py-1 rounded-full text-xs cat-finops">{p}</span>
                ))}
              </div>
            </div>
            <SubscribeForm />
          </div>
        </div>
      </section>

      {/* Host CTA */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Ready to <span className="gradient-text">Host?</span>
        </h2>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto">
          Share your knowledge with Chicago&apos;s tech community. Free RSVP, no ticketing fees, easy setup.
        </p>
        <Link
          href="/create-event"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
        >
          Host an Event <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
