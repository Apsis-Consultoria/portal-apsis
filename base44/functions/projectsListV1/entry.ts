/**
 * Backend Function - Listar Projetos (v1)
 * 
 * Padrão refatorado de resposta:
 * GET /api/v1/projects
 * 
 * Autenticação: Obrigatória
 * Permissões: Qualquer usuário autenticado
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

    // 2. Buscar projetos do usuário
    const projects = await base44.entities.Projeto.list('-updated_date', 100);

    // 3. Retornar sucesso
    return Response.json({
      success: true,
      data: projects.map(p => ({
        id: p.id,
        nome: p.nome,
        cliente_id: p.cliente_id,
        status: p.status,
        valor_total: p.valor_total,
        data_inicio: p.data_inicio,
        data_fim: p.data_fim,
        created_date: p.created_date,
        updated_date: p.updated_date
      })),
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        count: projects.length
      }
    }, { status: 200 });

  } catch (error) {
    // 4. Logar erro técnico
    console.error('[projectsListV1] Error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // 5. Retornar erro genérico (nunca detalhes técnicos ao cliente)
    return Response.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao buscar projetos. Por favor, tente novamente.'
      },
      meta: { timestamp: new Date().toISOString() }
    }, { status: 500 });
  }
});