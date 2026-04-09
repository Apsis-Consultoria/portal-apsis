import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ybixbsfmxblaippubtvw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliaXhic2ZteGJsYWlwcHVidHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNTEzMDgsImV4cCI6MjA5MDYyNzMwOH0.4F72hq_oSLw6BVHISLcGS_IdXeMowE-a7_zFGpAVVP4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);