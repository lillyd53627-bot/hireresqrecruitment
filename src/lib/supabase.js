import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uoovbueakhhswpmythsb.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvb3ZidWVha2hoc3dwbXl0aHNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5NzI5MiwiZXhwIjoyMDkzMDczMjkyfQ.-jnsfVBQP_750jKSNVNsYD3dap8NFvnfKTIYuNaWIQg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)