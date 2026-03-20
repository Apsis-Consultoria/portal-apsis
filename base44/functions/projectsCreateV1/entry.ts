/**
 * Backend Function - Criar Projeto (v1)
 * 
 * POST /api/v1/projects
 * 
 * Autenticação: Obrigatória
 * Permissões: Criar projetos
 * 
 * Body:
 * {
 *   "nome": string (required),
 *   "cliente_id": string (required),
 *   "status": string (default: "planejamento"),
 *   "valor_total": number,
 *   "data_inicio": date,
 *   "data_fim": date,
 *   "descricao": string,
 *   "gerente_id": string
 * }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    // 1. Autenticação
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Token inválido ou expirado' },
        meta: { timestamp: new Date().toISOString() }
      }, { status: 401 });
    }

    // 2. Validação de payload
    const body = await req.json().catch(() => ({}));
    const errors = {};
    
    if (!body.nome || typeof body.nome !== 'string') {
      errors.nome = 'Nome é obrigatório';
    }
    if (!body.cliente_id || typeof body.cliente_id !== 'string') {
      errors.cliente_id = 'Cliente é obrigatório';
    }
    
    if (Object.keys(errors).length > 0) {
      return Response.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: { fields: errors }
        },
        meta: { timestamp: new Date().toISOString() }
      }, { status: 400 });
    }

    // 3. Criar projeto
    const projeto = await base44.entities.Projeto.create({
      nome: body.nome,
      cliente_id: body.cliente_id,
      status: body.status || 'planejamento',
      valor_total: body.valor_total || 0,
      data_inicio: body.data_inicio,
      data_fim: body.data_fim,
      descricao: body.descricao,
      gerente_id: body.gerente_id,
      created_by: user.email
    });

    // 4. Log em IntegrationLog
    await base44.entities.IntegrationLog.create({
      integration_name: 'base44_projects',
      event_type: 'create',
      status: 'success',
      request: { nome: body.nome, cliente_id: body.cliente_id },
      response: { id: projeto.id },
      user_id: user.email,
      external_id: projeto.id
    }).catch(() => {});

    return Response.json({
      success: true,
      data: {
        id: projeto.id,
        nome: projeto.nome,
        cliente_id: projeto.cliente_id,
        status: projeto.status,
        valor_total: projeto.valor_total,
        created_date: projeto.created_date
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('[projectsCreateV1] Error:', {
      message: error.message,
      timestamp: new Date().toISOString()
    });

    return Response.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao criar projeto. Por favor, tente novamente.'
      },
      meta: { timestamp: new Date().toISOString() }
    }, { status: 500 });
  }
});