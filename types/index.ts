export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: 'member' | 'organizer' | 'admin';
  company: string | null;
  website: string | null;
  linkedin_url: string | null;
  newsletter_subscribed: boolean;
  newsletter_email: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  category: string | null;
  tags: string[] | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_lat: number | null;
  venue_lng: number | null;
  is_online: boolean;
  online_link: string | null;
  start_time: string;
  end_time: string;
  capacity: number | null;
  is_free: boolean;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  rsvp_count: number;
  created_at: string;
  organizer?: Profile;
}

export interface RSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: 'going' | 'waitlist' | 'cancelled';
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
  profile?: Profile;
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  name: string | null;
  topics: string[] | null;
  is_active: boolean;
  unsubscribe_token: string | null;
  subscribed_at: string;
}

export interface NewsletterIssue {
  id: string;
  month_year: string;
  subject: string | null;
  preview_text: string | null;
  html_body: string | null;
  text_body: string | null;
  sources: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  sent_at: string | null;
  recipient_count: number | null;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
}

export type EventCategory =
  | 'AI/ML'
  | 'Web Dev'
  | 'DevOps'
  | 'FinOps'
  | 'Startup'
  | 'Networking';

export const CATEGORY_COLORS: Record<string, string> = {
  'AI/ML': '#8B5CF6',
  'Web Dev': '#3B82F6',
  DevOps: '#10B981',
  FinOps: '#06B6D4',
  Startup: '#EC4899',
  Networking: '#F59E0B',
};

export const FINOPS_TOPICS = [
  'Snowflake',
  'Databricks',
  'BigQuery',
  'Redshift',
  'Azure Fabric/Synapse',
];
