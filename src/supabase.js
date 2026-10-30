import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars. Check your .env file.')
}

// Native APK uses implicit flow — tokens arrive directly in the deep-link hash,
// so there is no PKCE code_verifier to lose across activity lifecycles.
const isNative = import.meta.env.VITE_IS_NATIVE === 'true'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { flowType: isNative ? 'implicit' : 'pkce' },
})
