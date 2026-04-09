import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { form } = await req.json();

    const emailBody = `
Nova solicitação de IA recebida!

👤 Solicitante: ${form.nome_usuario} (${form.email})
🏢 Setor: ${form.setor} | Cargo: ${form.cargo || 'Não informado'}
📋 Tipo: ${form.tipo_solicitacao}
⚠️ Prioridade: ${form.prioridade}
💻 Sistema/Área: ${form.sistema_area}

📌 Título: ${form.titulo}

📝 Descrição:
${form.descricao}

✅ Benefício Esperado:
${form.beneficio}

${form.processo_atual ? `🔄 Processo Atual:\n${form.processo_atual}\n\n` : ''}${form.processo_desejado ? `🎯 Processo Desejado:\n${form.processo_desejado}\n\n` : ''}${form.link_evidencia ? `🔗 Link de Evidência: ${form.link_evidencia}\n` : ''}${form.anexos?.length > 0 ? `📎 Anexos: ${form.anexos.length} arquivo(s) enviado(s)\n` : ''}${form.sugestao_ia ? `\n🤖 Sugestão IA:\n${form.sugestao_ia}` : ''}
`.trim();

    const destinatarios = ['filipe.oliveira@apsis.com.br', 'leonardo.carvalho@apsis.com.br'];

    await Promise.all(destinatarios.map(to =>
      base44.asServiceRole.integrations.Core.SendEmail({
        to,
        subject: `[Solicitação IA] ${form.titulo} - ${form.prioridade}`,
        body: emailBody,
        from_name: 'Portal APSIS'
      })
    ));

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});