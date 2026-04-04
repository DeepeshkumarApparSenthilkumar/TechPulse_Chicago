import EventCard from './EventCard';
import type { Event } from '@/types';

interface EventGridProps {
  events: Event[];
  loading?: boolean;
}

function SkeletonCard() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ height: '176px' }} className="shimmer" />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ height: '16px', borderRadius: '6px' }} className="shimmer" />
        <div style={{ height: '12px', width: '75%', borderRadius: '6px' }} className="shimmer" />
        <div style={{ height: '12px', width: '50%', borderRadius: '6px' }} className="shimmer" />
        <div style={{ height: '32px', borderRadius: '8px', marginTop: '6px' }} className="shimmer" />
      </div>
    </div>
  );
}

export default function EventGrid({ events, loading = false }: EventGridProps) {
  if (loading) {
    return (
      <div className="events-grid">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔍</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>
          No events found
        </h3>
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="events-grid">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
