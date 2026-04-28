import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { ap_os, empresa, emails, area, status, criado_em } = body;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("VITE_SUPABASE_SERVICE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return Response.json({ error: 'Supabase credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Gera um token de acesso único
    const access_token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');

    // Mapeia status para o valor aceito pela tabela
    const statusMap = { "ativo": "active", "encerrado": "inactive" };
    const dbStatus = statusMap[status] || status;

    const { data, error } = await supabase
      .from("inov_secure_share")
      .insert([{ ap_os, empresa, emails, area, status: dbStatus, criado_em, name: empresa, access_token }])
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});