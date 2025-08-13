import { createClient } from '@supabase/supabase-js'

// Fallbacks so local dev works even if .env is not configured yet.
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://ufitbcjbmgdinkbspmrt.supabase.co'
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmaXRiY2pibWdkaW5rYnNwbXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwODU2NjYsImV4cCI6MjA3MDY2MTY2Nn0.IXr4ZDYW6GLJJjkY0NOVwF2mPcgI9t-zEVbdrt6aBiw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


