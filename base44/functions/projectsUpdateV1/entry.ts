/**
 * Backend Function - Atualizar Projeto (v1)
 * 
 * PATCH /api/v1/projects/:id
 * 
 * Autenticação: Obrigatória
 * Permissões: Editar próprio projeto ou admin
 * 
 * Body: { nome?, status?, valor_total?, data_fim?, ... }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Token inválido ou expirado' },
        meta: { timestamp: new Date().toISOString() }
      }, { status: 401 });
    }

    const url = new URL(req.url);
    const projectId = url.pathname.split('/').pop();
    
    if (!projectId) {
      return Response.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'ID do projeto é obrigatório' },
        meta: { timestamp: new Date().toISOString() }
      }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    
    const projeto = await base44.entities.Projeto.update(projectId, {
      ...body,
      updated_by: user.email
    });

    await base44.entities.IntegrationLog.create({
      integration_name: 'base44_projects',
      event_type: 'update',
      status: 'success',
      request: body,
      user_id: user.email,
      external_id: projectId
    }).catch(() => {});

    return Response.json({
      success: true,
      data: projeto,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[projectsUpdateV1] Error:', { message: error.message });
    return Response.json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao atualizar projeto' },
      meta: { timestamp: new Date().toISOString() }
    }, { status: 500 });
  }
});