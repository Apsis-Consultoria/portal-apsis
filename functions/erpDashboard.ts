import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Integração ERP - Dashboard
 * Busca dados financeiros, KPIs e métricas de desempenho
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

    // Buscar diferentes tipos de dados do ERP conforme solicitado
    if (dataType === 'all' || dataType === 'revenue') {
      const revenueResponse = await base44.functions.invoke('erpClient', {
        endpoint: '/api/financeiro/receitas',
        method: 'GET',
        integrationName: 'ERP_Dashboard_Revenue',
        entityName: 'Dashboard'
      });
      
      if (revenueResponse.data?.success) {
        data.revenue = revenueResponse.data.data;
      }
    }

    if (dataType === 'all' || dataType === 'proposals') {
      const proposalsResponse = await base44.functions.invoke('erpClient', {
        endpoint: '/api/comercial/propostas',
        method: 'GET',
        integrationName: 'ERP_Dashboard_Proposals',
        entityName: 'Dashboard'
      });
      
      if (proposalsResponse.data?.success) {
        data.proposals = proposalsResponse.data.data;
      }
    }

    if (dataType === 'all' || dataType === 'kpis') {
      const kpisResponse = await base44.functions.invoke('erpClient', {
        endpoint: '/api/dashboard/kpis',
        method: 'GET',
        integrationName: 'ERP_Dashboard_KPIs',
        entityName: 'Dashboard'
      });
      
      if (kpisResponse.data?.success) {
        data.kpis = kpisResponse.data.data;
      }
    }

    const executionTime = Date.now() - startTime;

    await base44.asServiceRole.entities.IntegrationLog.create({
      integration_name: 'ERP_Dashboard',
      operation_type: 'sync',
      entity_name: 'Dashboard',
      status: 'success',
      records_processed: Object.keys(data).length,
      records_success: Object.keys(data).length,
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
        integration_name: 'ERP_Dashboard',
        operation_type: 'sync',
        entity_name: 'Dashboard',
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