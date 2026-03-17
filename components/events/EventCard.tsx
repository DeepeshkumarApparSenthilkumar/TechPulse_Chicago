'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, Globe } from 'lucide-react';
import { formatEventDateTime, getCategoryClass, truncate } from '@/lib/utils';
import type { Event } from '@/types';
import RSVPButton from './RSVPButton';

interface EventCardProps {
  event: Event;
  showRSVP?: boolean;
}

export default function EventCard({ event, showRSVP = true }: EventCardProps) {
  const catClass = getCategoryClass(event.category ?? 'Web Dev');

  return (
    <div className="glass glass-hover rounded-2xl overflow-hidden group">
      {/* Cover image */}
      <Link href={`/events/${event.slug}`} className="block relative h-44 overflow-hidden bg-gradient-to-br from-blue-900/40 to-purple-900/40">
        {event.cover_image_url ? (
          <Image
            src={event.cover_image_url}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))' }}>
            <span className="text-4xl opacity-30">⚡</span>
          </div>
        )}
        {/* Category badge */}
        {event.category && (
          <span className={`absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium ${catClass}`}>
            {event.category}
          </span>
        )}
        {/* Status badge */}
        {event.status === 'cancelled' && (
          <span className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
            Cancelled
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/events/${event.slug}`}>
          <h3 className="font-semibold text-white text-base mb-2 leading-snug group-hover:text-blue-400 transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {truncate(event.title, 60)}
          </h3>
        </Link>

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" />
            <span>{formatEventDateTime(event.start_time)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {event.is_online ? (
              <>
                <Globe className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" />
                <span>Online Event</span>
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-cyan-400" />
                <span>{truncate(event.venue_name ?? event.venue_address ?? 'Chicago, IL', 35)}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Users className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
            <span>{event.rsvp_count} going</span>
            {event.is_free && <span className="text-emerald-400 font-medium">· Free</span>}
          </div>
        </div>

        {showRSVP && <RSVPButton event={event} compact />}
      </div>
    </div>
  );
}
