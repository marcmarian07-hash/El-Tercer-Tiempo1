import { createClient } from '@supabase/supabase-js' // ¡Corregido el nombre de la librería!

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export default supabase