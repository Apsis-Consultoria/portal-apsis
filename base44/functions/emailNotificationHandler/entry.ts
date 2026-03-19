import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

/**
 * Processa e registra notificações de e-mail
 * Chamado por triggers de eventos (mensagem, documento, solicitação)
 */

export async function handleEmailNotification(base44, eventData) {
  try {
    const {
      tipo_evento,       // 'mensagem', 'documento', 'solicitacao'
      contexto_id,       // ID do recurso
      contexto_tipo,     // 'comunicacao', 'documento', 'solicitacao'
      cliente_email,
      cliente_nome,
      projeto_nome,
      assunto_custom,
      corpo_custom,
      destinatarios_extras = {}
    } = eventData;

    // Buscar config de e-mail
    const configs = await base44.entities.EmailConfig.list();
    const config = configs[0];

    if (!config || !config.habilitado) {
      console.log('Email notifications disabled');
      return { success: false, reason: 'disabled' };
    }

    // Verificar se cliente deve ser notificado para este tipo
    const shouldNotifyClient = {
      'mensagem': config.notificar_cliente_mensagens,
      'documento': config.notificar_cliente_documentos,
      'solicitacao': config.notificar_cliente_solicitacoes
    }[tipo_evento];

    if (!shouldNotifyClient) {
      console.log(`Notifications disabled for event type: ${tipo_evento}`);
      return { success: false, reason: 'event_type_disabled' };
    }

    // Selecionar template apropriado
    const templateKey = `template_${tipo_evento}`;
    const assuntoTemplate = config[`${templateKey}_assunto`] || config.template_assunto_padrao;
    const corpoTemplate = config[`${templateKey}_corpo`] || config.template_corpo_padrao;

    // Substituir variáveis nos templates
    const dados = {
      '{tipo}': tipo_evento,
      '{cliente_nome}': cliente_nome || 'Cliente',
      '{projeto_nome}': projeto_nome || 'Projeto',
      '{data}': new Date().toLocaleDateString('pt-BR'),
      '{link}': 'https://portal.apsis.com.br',
      '{email_remetente}': config.email_remetente
    };

    let assunto = assuntoTemplate || `[APSIS Nexus] Notificação - ${tipo_evento}`;
    let corpo = corpoTemplate || `Você recebeu uma notificação sobre ${tipo_evento}`;

    Object.entries(dados).forEach(([key, value]) => {
      assunto = assunto.replace(key, value);
      corpo = corpo.replace(key, value);
    });

    // Usar custom se fornecido
    assunto = assunto_custom || assunto;
    corpo = corpo_custom || corpo;

    // Construir lista de destinatários
    const destinatarios = [
      {
        email: cliente_email,
        tipo: 'cliente',
        enviado: false
      }
    ];

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

    // Registrar notificação pendente
    const notificacao = await base44.entities.EmailNotification.create({
      tipo_evento,
      contexto_id,
      contexto_tipo,
      cliente_email,
      cliente_id: cliente_email, // usar email como ID temporário
      destinatarios,
      assunto,
      corpo,
      variáveis_dinâmicas: dados,
      status: 'pendente',
      tentativas: 0
    });

    console.log(`Email notification registered: ${notificacao.id}`);
    return {
      success: true,
      notification_id: notificacao.id,
      destinatarios_count: destinatarios.length
    };
  } catch (error) {
    console.error('Error handling email notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Endpoint para registrar notificações (chamado por triggers)
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

    const eventData = await req.json();
    const resultado = await handleEmailNotification(base44, eventData);

    return Response.json(resultado);
  } catch (error) {
    console.error('Endpoint error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});