import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://nexahqqtqujcsctskrzd.supabase.co'
export const SUPABASE_KEY = 'sb_publishable_udwlyRyxS942zUbeWWSINw_lMNIu2T2'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
})
