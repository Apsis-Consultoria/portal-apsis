import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Integração ERP - Projetos
 * Busca dados de projetos, propostas, ordens de serviço e alocações
 */

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dataType, filters } = await req.json().catch(() => ({ dataType: 'all', filters: {} }));

    let data = {};

    // Propostas
    if (dataType === 'all' || dataType === 'propostas') {
      const response = await base44.functions.invoke('erpClient', {
        endpoint: '/api/projetos/propostas',
        method: 'POST',
        body: { filters },
        integrationName: 'ERP_Projetos_Propostas',
        entityName: 'Proposta'
      });
      
      if (response.data?.success) {
        data.propostas = response.data.data;
        
        // Sincronizar com entidade local
        for (const proposta of response.data.data) {
          const existing = await base44.asServiceRole.entities.Proposta.filter({ 
            numero_ap: proposta.numero_ap 
          });
          
          if (existing.length > 0) {
            await base44.asServiceRole.entities.Proposta.update(existing[0].id, proposta);
          } else {
            await base44.asServiceRole.entities.Proposta.create(proposta);
          }
        }
      }
    }

    // Ordens de Serviço
    if (dataType === 'all' || dataType === 'os') {
      const response = await base44.functions.invoke('erpClient', {
        endpoint: '/api/projetos/ordens-servico',
        method: 'POST',
        body: { filters },
        integrationName: 'ERP_Projetos_OS',
        entityName: 'OrdemServico'
      });
      
      if (response.data?.success) {
        data.ordensServico = response.data.data;
      }
    }

    // Alocações de Horas
    if (dataType === 'all' || dataType === 'alocacoes') {
      const response = await base44.functions.invoke('erpClient', {
        endpoint: '/api/projetos/alocacoes',
        method: 'POST',
        body: { filters },
        integrationName: 'ERP_Projetos_Alocacoes',
        entityName: 'AlocacaoHoras'
      });
      
      if (response.data?.success) {
        data.alocacoes = response.data.data;
      }
    }

    // Budget
    if (dataType === 'all' || dataType === 'budget') {
      const response = await base44.functions.invoke('erpClient', {
        endpoint: '/api/projetos/budget',
        method: 'POST',
        body: { filters },
        integrationName: 'ERP_Projetos_Budget',
        entityName: 'Budget'
      });
      
      if (response.data?.success) {
        data.budget = response.data.data;
      }
    }

    const executionTime = Date.now() - startTime;

    await base44.asServiceRole.entities.IntegrationLog.create({
      integration_name: 'ERP_Projetos',
      operation_type: 'sync',
      entity_name: 'Projetos',
      status: 'success',
      records_processed: Object.values(data).flat().length,
      records_success: Object.values(data).flat().length,
      execution_time_ms: executionTime,
      metadata: JSON.stringify({ dataType, filters })
    });

    return Response.json({ 
      success: true, 
      data,
      execution_time_ms: executionTime
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    try {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.IntegrationLog.create({
        integration_name: 'ERP_Projetos',
        operation_type: 'sync',
        entity_name: 'Projetos',
        status: 'error',
        error_message: error.message,
        execution_time_ms: executionTime
      });
    } catch {}

    return Response.json({ 
      error: error.message,
      execution_time_ms: executionTime 
    }, { status: 500 });
  }
});