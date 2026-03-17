import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Globe, Linkedin, Building2 } from 'lucide-react';
import EventCard from '@/components/events/EventCard';
import type { Profile, Event } from '@/types';

interface Props { params: Promise<{ username: string }> }

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) notFound();

  const p = profile as Profile;

  // Events they're hosting
  const { data: hostedEvents } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', p.id)
    .eq('status', 'published')
    .order('start_time', { ascending: false })
    .limit(6);

  const initials = p.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  return (
    <div className="min-h-screen pt-20 page-transition">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Profile header */}
        <div className="glass rounded-2xl p-8 mb-8 flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
            {p.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.avatar_url} alt={p.full_name ?? ''} className="w-full h-full rounded-2xl object-cover" />
            ) : initials}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{p.full_name}</h1>
                <p className="text-slate-400">@{p.username}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                p.role === 'admin' ? 'cat-finops' : p.role === 'organizer' ? 'cat-web' : 'cat-devops'
              }`}>{p.role}</span>
            </div>
            {p.bio && <p className="text-slate-300 mt-3 leading-relaxed">{p.bio}</p>}
            <div className="flex flex-wrap gap-3 mt-4">
              {p.company && (
                <span className="flex items-center gap-1.5 text-sm text-slate-400">
                  <Building2 className="w-4 h-4" /> {p.company}
                </span>
              )}
              {p.website && (
                <a href={p.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-blue-400 hover:underline">
                  <Globe className="w-4 h-4" /> Website
                </a>
              )}
              {p.linkedin_url && (
                <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-blue-400 hover:underline">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Hosted events */}
        {hostedEvents && hostedEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Events by <span className="gradient-text">{p.full_name?.split(' ')[0]}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(hostedEvents as Event[]).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
