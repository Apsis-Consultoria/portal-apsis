import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    const payload = {
      nome_usuario: body.nome_usuario,
      email: body.email,
      setor: body.setor,
      cargo: body.cargo || null,
      tipo_solicitacao: body.tipo_solicitacao,
      prioridade: body.prioridade,
      sistema_area: body.sistema_area,
      titulo: body.titulo,
      descricao: body.descricao,
      beneficio: body.beneficio,
      processo_atual: body.processo_atual || null,
      processo_desejado: body.processo_desejado || null,
      link_evidencia: body.link_evidencia || null,
      sugestao_ia: body.sugestao_ia || null,
      anexos: body.anexos || [],
      status: body.status || 'Novo',
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/solicitacoes_ia`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Supabase error:', err);
      return Response.json({ error: 'Erro ao salvar no Supabase', details: err }, { status: 500 });
    }

    const data = await response.json();
    return Response.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Function error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});