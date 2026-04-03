import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatEventDateTime } from '@/lib/utils';
import type { Event, Profile, NewsletterIssue } from '@/types';
import GenerateNewsletterButton from './GenerateNewsletterButton';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const [
    { data: events }, { data: users }, { data: newsletters },
    { count: eventCount }, { count: memberCount }, { count: subCount }
  ] = await Promise.all([
    supabase.from('events').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('newsletter_issues').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('newsletter_subscriptions').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ]);

  return (
    <div className="min-h-screen pt-20 page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Admin <span className="gradient-text">Panel</span>
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Events', value: eventCount ?? 0, color: '#3B82F6' },
            { label: 'Total Members', value: memberCount ?? 0, color: '#8B5CF6' },
            { label: 'Newsletter Subscribers', value: subCount ?? 0, color: '#06B6D4' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-5">
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif', color: stat.color }}>{stat.value}</div>
              <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Newsletter Control */}
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Newsletter Control</h2>
            <GenerateNewsletterButton />
          </div>
          <div className="space-y-2">
            {(newsletters as NewsletterIssue[] ?? []).map((issue) => (
              <div key={issue.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <div className="text-sm font-medium text-white">{issue.subject ?? issue.month_year}</div>
                  <div className="text-xs text-slate-400">{issue.sent_at ? `Sent ${formatEventDateTime(issue.sent_at)}` : 'Draft'} · {issue.recipient_count ?? 0} recipients</div>
                </div>
                <Link href={`/newsletter/${issue.id}`} className="text-xs text-blue-400 hover:underline">View</Link>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Events Table */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Recent Events</h2>
            <div className="space-y-2">
              {(events as Event[] ?? []).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{event.title}</div>
                    <div className="text-xs text-slate-400">{formatEventDateTime(event.start_time)}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 text-xs rounded ${event.status === 'published' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-white/5'}`}>
                      {event.status}
                    </span>
                    <Link href={`/events/${event.slug}`} className="text-xs text-blue-400 hover:underline">View</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Recent Members</h2>
            <div className="space-y-2">
              {(users as Profile[] ?? []).map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
                      {u.full_name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate">{u.full_name ?? 'Unknown'}</div>
                      <div className="text-xs text-slate-400 capitalize">{u.role}</div>
                    </div>
                  </div>
                  <Link href={`/profile/${u.username}`} className="text-xs text-blue-400 hover:underline flex-shrink-0 ml-2">Profile</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
