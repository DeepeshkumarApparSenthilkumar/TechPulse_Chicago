import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client with service role key.
 * Bypasses RLS — use ONLY in trusted server-side API routes.
 * Never expose to the client or browser.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
