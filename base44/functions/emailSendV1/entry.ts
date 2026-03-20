/**
 * Backend Function - Enviar Email (v1)
 * 
 * POST /api/v1/emails/send
 * 
 * Autenticação: Obrigatória
 * Permissões: Enviar emails
 * 
 * Usa Core.SendEmail do Base44 ou integração email configurada
 * 
 * Body:
 * {
 *   "to": string (email dest, required),
 *   "subject": string (required),
 *   "body": string (HTML, required),
 *   "from_name": string (optional),
 *   "cc": array (optional),
 *   "reply_to": string (optional),
 *   "template": string (optional, ex: "project_created"),
 *   "template_data": object (optional)
 * }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const emailTemplates = {
  project_created: {
    subject: 'Novo Projeto Criado: {{project_name}}',
    body: '<p>O projeto <strong>{{project_name}}</strong> foi criado com sucesso.</p>'
  },
  payment_received: {
    subject: 'Pagamento Recebido - {{amount}}',
    body: '<p>Recebemos o pagamento de <strong>R$ {{amount}}</strong>.</p>'
  },
  project_completed: {
    subject: 'Projeto Finalizado: {{project_name}}',
    body: '<p>O projeto <strong>{{project_name}}</strong> foi finalizado.</p>'
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Token inválido' },
        meta: { timestamp: new Date().toISOString() }
      }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const errors = {};
    
    if (!body.to || !body.to.includes('@')) errors.to = 'Email válido é obrigatório';
    if (!body.subject) errors.subject = 'Assunto é obrigatório';
    if (!body.body && !body.template) errors.body = 'Corpo ou template é obrigatório';
    
    if (Object.keys(errors).length > 0) {
      return Response.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: { fields: errors } },
        meta: { timestamp: new Date().toISOString() }
      }, { status: 400 });
    }

    // Processar template se fornecido
    let emailBody = body.body;
    let emailSubject = body.subject;
    
    if (body.template && emailTemplates[body.template]) {
      const template = emailTemplates[body.template];
      emailSubject = template.subject;
      emailBody = template.body;
      
      if (body.template_data) {
        Object.entries(body.template_data).forEach(([key, value]) => {
          emailSubject = emailSubject.replace(`{{${key}}}`, value);
          emailBody = emailBody.replace(`{{${key}}}`, value);
        });
      }
    }

    // ⚠️ PENDENTE: Usar integração de email configurada
    // TODO: Implementar quando credentials forem obtidas
    // const emailConfig = await base44.entities.IntegrationConfig.filter({ name: 'email', is_active: true });
    
    // Por enquanto, usar Core.SendEmail
    const emailResult = await base44.integrations.Core.SendEmail({
      to: body.to,
      subject: emailSubject,
      body: emailBody,
      from_name: body.from_name || 'APSIS Portal'
    });

    // Log da operação
    await base44.entities.IntegrationLog.create({
      integration_name: 'email',
      event_type: 'notification',
      status: 'success',
      request: { to: body.to, subject: emailSubject },
      response: { sent: true },
      user_id: user.email,
      external_id: `email_${Date.now()}`
    }).catch(() => {});

    return Response.json({
      success: true,
      data: { sent: true, to: body.to },
      meta: { timestamp: new Date().toISOString(), version: 'v1' }
    }, { status: 200 });

  } catch (error) {
    console.error('[emailSendV1] Error:', { message: error.message });
    return Response.json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao enviar email' },
      meta: { timestamp: new Date().toISOString() }
    }, { status: 500 });
  }
});