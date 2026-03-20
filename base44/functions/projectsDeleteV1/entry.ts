/**
 * Backend Function - Deletar Projeto (v1)
 * 
 * DELETE /api/v1/projects/:id
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

    const projectId = new URL(req.url).pathname.split('/').pop();
    
    if (!projectId) {
      return Response.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'ID do projeto é obrigatório' },
        meta: { timestamp: new Date().toISOString() }
      }, { status: 400 });
    }

    await base44.entities.Projeto.delete(projectId);

    await base44.entities.IntegrationLog.create({
      integration_name: 'base44_projects',
      event_type: 'delete',
      status: 'success',
      user_id: user.email,
      external_id: projectId
    }).catch(() => {});

    return Response.json({
      success: true,
      data: { id: projectId },
      meta: { timestamp: new Date().toISOString(), version: 'v1' }
    }, { status: 200 });

  } catch (error) {
    console.error('[projectsDeleteV1] Error:', { message: error.message });
    return Response.json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao deletar projeto' },
      meta: { timestamp: new Date().toISOString() }
    }, { status: 500 });
  }
});