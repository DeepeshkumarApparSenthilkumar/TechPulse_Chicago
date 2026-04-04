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
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(16px)', transition: 'border-color 0.2s, transform 0.2s', display: 'flex', flexDirection: 'column' }} className="glass-hover">

      {/* Cover image */}
      <Link href={`/events/${event.slug}`} style={{ display: 'block', position: 'relative', height: '176px', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))', flexShrink: 0 }}>
        {event.cover_image_url ? (
          <Image src={event.cover_image_url} alt={event.title} fill style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '40px', opacity: 0.3 }}>⚡</span>
          </div>
        )}
        {event.category && (
          <span className={catClass} style={{ position: 'absolute', top: '10px', left: '10px', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}>
            {event.category}
          </span>
        )}
        {event.status === 'cancelled' && (
          <span style={{ position: 'absolute', top: '10px', right: '10px', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, background: 'rgba(239,68,68,0.2)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }}>
            Cancelled
          </span>
        )}
      </Link>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Link href={`/events/${event.slug}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontWeight: 600, color: '#fff', fontSize: '14px', marginBottom: '10px', lineHeight: 1.4, fontFamily: 'Space Grotesk, sans-serif' }}>
            {truncate(event.title, 60)}
          </h3>
        </Link>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94A3B8' }}>
            <Calendar style={{ width: '13px', height: '13px', flexShrink: 0, color: '#60A5FA' }} />
            <span>{formatEventDateTime(event.start_time)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94A3B8' }}>
            {event.is_online ? (
              <>
                <Globe style={{ width: '13px', height: '13px', flexShrink: 0, color: '#C084FC' }} />
                <span>Online Event</span>
              </>
            ) : (
              <>
                <MapPin style={{ width: '13px', height: '13px', flexShrink: 0, color: '#22D3EE' }} />
                <span>{truncate(event.venue_name ?? event.venue_address ?? 'Chicago, IL', 35)}</span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94A3B8' }}>
            <Users style={{ width: '13px', height: '13px', flexShrink: 0, color: '#34D399' }} />
            <span>{event.rsvp_count} going</span>
            {event.is_free && <span style={{ color: '#34D399', fontWeight: 600 }}>· Free</span>}
          </div>
        </div>

        {showRSVP && <RSVPButton event={event} compact />}
      </div>
    </div>
  );
}
