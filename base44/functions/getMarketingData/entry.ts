import { createClient } from 'npm:@supabase/supabase-js@2';
import * as jose from 'npm:jose@5';

Deno.serve(async (req) => {
  try {
    const { azureToken } = await req.json().catch(() => ({}));

    const tenantId = Deno.env.get('AZ_TENANT_ID') || Deno.env.get('VITE_AZURE_TENANT_ID');
    const clientId = Deno.env.get('AZ_CLIENT_ID') || Deno.env.get('VITE_AZURE_CLIENT_ID');

    if (!azureToken || !tenantId || !clientId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const JWKS = jose.createRemoteJWKSet(
      new URL(`https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`)
    );

    await jose.jwtVerify(azureToken, JWKS, {
      issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
      audience: clientId,
    });

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

    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
