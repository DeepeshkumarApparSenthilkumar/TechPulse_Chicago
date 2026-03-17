import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { CATEGORY_COLORS } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEventDate(dateStr: string): string {
  return format(new Date(dateStr), 'EEE, MMM d, yyyy');
}

export function formatEventTime(dateStr: string): string {
  return format(new Date(dateStr), 'h:mm a');
}

export function formatEventDateTime(dateStr: string): string {
  return format(new Date(dateStr), 'EEE, MMM d · h:mm a');
}

export function timeFromNow(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-' + Math.random().toString(36).substr(2, 6);
}

export function getCategoryClass(category: string): string {
  const map: Record<string, string> = {
    'AI/ML': 'cat-ai',
    'Web Dev': 'cat-web',
    'DevOps': 'cat-devops',
    'FinOps': 'cat-finops',
    'Startup': 'cat-startup',
    'Networking': 'cat-networking',
  };
  return map[category] ?? 'cat-web';
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#3B82F6';
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural ?? singular + 's'}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
