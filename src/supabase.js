import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tu-url-de-supabase.supabase.co' // Aquí pon tu URL real
const supabaseAnonKey = 'tu-clave-anon-de-supabase'         // Aquí pon tu clave real

export const supabase = createClient(supabaseUrl, supabaseAnonKey)