import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  'https://uoovbueakhhswpmythsb.supabase.co'

const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvb3ZidWVha2hoc3dwbXl0aHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTcyOTIsImV4cCI6MjA5MzA3MzI5Mn0.AiyO8XNrkrAleg7S3CSvxuYdnlB68nIEBOHKwL2BqtQ'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)