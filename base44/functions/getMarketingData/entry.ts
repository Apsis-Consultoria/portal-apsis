import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_ANON_KEY')
    );

    // Try with count to check if table exists and has rows
    const { count, error: countError } = await supabase
      .from('mkt_vendas_ticket_medio')
      .select('*', { count: 'exact', head: true });

    const { data, error } = await supabase
      .from('mkt_vendas_ticket_medio')
      .select('*')
      .limit(3);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ count, countError: countError?.message, data, error: error?.message });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});