import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

/**
 * Função auxiliar para registrar notificações de e-mail
 * Chamada quando eventos importantes ocorrem (mensagens, documentos, solicitações)
 * 
 * NÃO faz envio real ainda - apenas registra para processamento posterior
 */

export async function registrarNotificacaoEmail(base44, {
  tipo_evento,
  contexto_id,
  contexto_tipo,
  cliente_id,
  cliente_email,
  assunto,
  corpo,
  variaveis_dinamicas = {},
  destinatarios_extras = []
}) {
  try {
    // Buscar configurações de e-mail
    const configs = await base44.entities.EmailConfig.list();
    const config = configs[0]; // Usar a primeira/única config

    if (!config || !config.habilitado) {
      console.log('Email notifications desabilitadas');
      return { success: false, reason: 'disabled' };
    }

    // Construir lista de destinatários baseado em configurações
    const destinatarios = [];

    // Cliente sempre recebe se notificação for ativada para este tipo
    if (
      (tipo_evento === 'mensagem' && config.notificar_cliente_mensagens) ||
      (tipo_evento === 'documento' && config.notificar_cliente_documentos) ||
      (tipo_evento === 'solicitacao' && config.notificar_cliente_solicitacoes)
    ) {
      destinatarios.push({
        email: cliente_email,
        tipo: 'cliente',
        enviado: false
      });
    }

    // Adicionar cópias se configurado
    if (config.copia_consultor && destinatarios_extras.consultor_email) {
      destinatarios.push({
        email: destinatarios_extras.consultor_email,
        tipo: 'consultor',
        enviado: false
      });
    }

    if (config.copia_gestor && destinatarios_extras.gestor_email) {
      destinatarios.push({
        email: destinatarios_extras.gestor_email,
        tipo: 'gestor',
        enviado: false
      });
    }

    // Se nenhum destinatário, retornar
    if (destinatarios.length === 0) {
      return { success: false, reason: 'no_recipients' };
    }

    // Registrar notificação pendente
    const notificacao = await base44.entities.EmailNotification.create({
      tipo_evento,
      contexto_id,
      contexto_tipo,
      cliente_id,
      cliente_email,
      destinatarios,
      assunto,
      corpo,
      variáveis_dinâmicas: variaveis_dinamicas,
      status: 'pendente',
      tentativas: 0
    });

    console.log(`Notificação email registrada: ${notificacao.id}`);
    return {
      success: true,
      notification_id: notificacao.id,
      destinatarios: destinatarios.length
    };
  } catch (error) {
    console.error('Erro ao registrar notificação:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Gatilho para nova mensagem
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { tipo_evento, contexto_id, contexto_tipo, cliente_id, cliente_email, assunto, corpo, variaveis_dinamicas, destinatarios_extras } = payload;

    const resultado = await registrarNotificacaoEmail(base44, {
      tipo_evento,
      contexto_id,
      contexto_tipo,
      cliente_id,
      cliente_email,
      assunto,
      corpo,
      variaveis_dinamicas: variaveis_dinamicas || {},
      destinatarios_extras: destinatarios_extras || {}
    });

    return Response.json(resultado);
  } catch (error) {
    console.error('Erro:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});