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

    // List all tables via information_schema
    const { data, error } = await supabase
      .rpc('get_tables')
      .select('*');

    // Fallback: try querying mkt tables directly
    const { data: mktData, error: mktError } = await supabase
      .from('mkt_vendas_ticket_medio')
      .select('*');

    return Response.json({ 
      tables_error: error?.message,
      mkt_data: mktData,
      mkt_error: mktError?.message
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});