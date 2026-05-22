import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hdkcyzbywdfoqwpmypoc.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhka2N5emJ5d2Rmb3F3cG15cG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MzMxMDMsImV4cCI6MjA5NTAwOTEwM30.M3LlU4OzH8J8S7-N7CIVi0ovts5hQ1CrkFhfcXIlmr4'

export const db = createClient(SUPABASE_URL, SUPABASE_KEY)