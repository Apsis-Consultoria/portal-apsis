import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ybixbsfmxblaippubtvw.supabase.co";

// Usa service key para bypass do RLS (apenas frontend interno, não exposto a usuários externos)
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliaXhic2ZteGJsYWlwcHVidHZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA1MTMwOCwiZXhwIjoyMDkwNjI3MzA4fQ.placeholder";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliaXhic2ZteGJsYWlwcHVidHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNTEzMDgsImV4cCI6MjA5MDYyNzMwOH0.4F72hq_oSLw6BVHISLcGS_IdXeMowE-a7_zFGpAVVP4";

// Cliente com service key para operações internas (bypass RLS)
export const supabaseAdmin = createClient(SUPABASE_URL, import.meta.env.VITE_SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY);

// Cliente padrão com anon key
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);