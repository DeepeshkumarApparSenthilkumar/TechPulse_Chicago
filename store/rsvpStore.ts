'use client';

import { create } from 'zustand';

interface RSVPState {
  rsvps: Record<string, 'going' | 'waitlist' | 'cancelled' | null>;
  rsvpCounts: Record<string, number>;
  setRSVP: (eventId: string, status: 'going' | 'waitlist' | 'cancelled' | null) => void;
  setRSVPCount: (eventId: string, count: number) => void;
  optimisticRSVP: (eventId: string, status: 'going' | 'waitlist' | 'cancelled', currentCount: number) => void;
}

export const useRSVPStore = create<RSVPState>((set) => ({
  rsvps: {},
  rsvpCounts: {},
  setRSVP: (eventId, status) =>
    set((state) => ({ rsvps: { ...state.rsvps, [eventId]: status } })),
  setRSVPCount: (eventId, count) =>
    set((state) => ({ rsvpCounts: { ...state.rsvpCounts, [eventId]: count } })),
  optimisticRSVP: (eventId, status, currentCount) =>
    set((state) => {
      const prev = state.rsvps[eventId];
      const wasGoing = prev === 'going';
      const nowGoing = status === 'going';
      const delta = nowGoing && !wasGoing ? 1 : !nowGoing && wasGoing ? -1 : 0;
      return {
        rsvps: { ...state.rsvps, [eventId]: status },
        rsvpCounts: { ...state.rsvpCounts, [eventId]: Math.max(0, currentCount + delta) },
      };
    }),
}));
