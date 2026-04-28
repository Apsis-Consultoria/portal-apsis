import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Tenta autenticar mas não bloqueia — o app usa Azure SSO
    // e pode não ter sessão base44 ativa
    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}

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

    // Parse dos emails que vem como JSON string
    let acessos = [];
    try {
      acessos = typeof emails === 'string' ? JSON.parse(emails) : emails;
    } catch {
      acessos = [];
    }

    // Cria uma linha para cada usuário/contato
    const rowsToInsert = acessos.map(acesso => ({
      ap_os,
      empresa,
      area: area || null,
      client_name: acesso.email,
      name: acesso.nome || acesso.email,
      access_token: crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, ''),
      password_hash: acesso.senha,
      status: dbStatus,
      criado_em,
      emails: acesso.email // apenas o email
    }));

    const { data, error } = await supabase
      .from("inov_secure_share")
      .insert(rowsToInsert)
      .select();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});