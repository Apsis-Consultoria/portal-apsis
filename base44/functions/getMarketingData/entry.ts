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
      Deno.env.get('VITE_SUPABASE_SERVICE_KEY')
    );

    const { data, error } = await supabase
      .from('mkt_vendas_ticket_medio')
      .select('ref_id, ano, trimestre, area, grupo_de_servico, vendas, clientes, ticket_medio')
      .order('ano', { ascending: true })
      .order('trimestre', { ascending: true });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});