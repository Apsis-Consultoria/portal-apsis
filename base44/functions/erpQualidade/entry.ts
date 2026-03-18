import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Integração ERP - Qualidade
 * Busca dados de questionários, auditorias e métricas de qualidade
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

    // Questionários de Revisão
    if (dataType === 'all' || dataType === 'questionarios') {
      const response = await base44.functions.invoke('erpClient', {
        endpoint: '/api/qualidade/questionarios',
        method: 'POST',
        body: { filters },
        integrationName: 'ERP_Qualidade_Questionarios',
        entityName: 'Questionarios'
      });
      
      if (response.data?.success) {
        data.questionarios = response.data.data;
      }
    }

    // Auditorias
    if (dataType === 'all' || dataType === 'auditorias') {
      const response = await base44.functions.invoke('erpClient', {
        endpoint: '/api/qualidade/auditorias',
        method: 'POST',
        body: { filters },
        integrationName: 'ERP_Qualidade_Auditorias',
        entityName: 'Auditorias'
      });
      
      if (response.data?.success) {
        data.auditorias = response.data.data;
      }
    }

    // Não Conformidades
    if (dataType === 'all' || dataType === 'nao_conformidades') {
      const response = await base44.functions.invoke('erpClient', {
        endpoint: '/api/qualidade/nao-conformidades',
        method: 'POST',
        body: { filters },
        integrationName: 'ERP_Qualidade_NaoConformidades',
        entityName: 'NaoConformidades'
      });
      
      if (response.data?.success) {
        data.naoConformidades = response.data.data;
      }
    }

    // Indicadores de Qualidade
    if (dataType === 'all' || dataType === 'indicadores') {
      const response = await base44.functions.invoke('erpClient', {
        endpoint: '/api/qualidade/indicadores',
        method: 'POST',
        body: { filters },
        integrationName: 'ERP_Qualidade_Indicadores',
        entityName: 'IndicadoresQualidade'
      });
      
      if (response.data?.success) {
        data.indicadores = response.data.data;
      }
    }

    const executionTime = Date.now() - startTime;

    await base44.asServiceRole.entities.IntegrationLog.create({
      integration_name: 'ERP_Qualidade',
      operation_type: 'sync',
      entity_name: 'Qualidade',
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
        integration_name: 'ERP_Qualidade',
        operation_type: 'sync',
        entity_name: 'Qualidade',
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