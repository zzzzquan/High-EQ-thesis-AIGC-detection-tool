import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) as string

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables')
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
)

export default supabaseAdmin
 