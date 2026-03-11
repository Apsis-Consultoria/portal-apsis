import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Sincronização Manual ERP
 * Permite sincronização sob demanda de módulos específicos
 * Requer permissão de admin ou gerente
 */

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar permissão
    if (!['admin', 'diretor', 'gerente'].includes(user.role)) {
      return Response.json({ 
        error: 'Acesso negado. Apenas admin, diretor ou gerente podem executar sincronização manual.' 
      }, { status: 403 });
    }

    const { module, dataType, filters } = await req.json();

    if (!module) {
      return Response.json({ error: 'Módulo não especificado' }, { status: 400 });
    }

    let result;
    let functionName;

    switch (module.toLowerCase()) {
      case 'dashboard':
        functionName = 'erpDashboard';
        break;
      case 'projetos':
        functionName = 'erpProjetos';
        break;
      case 'financeiro':
        functionName = 'erpFinanceiro';
        break;
      case 'qualidade':
        functionName = 'erpQualidade';
        break;
      default:
        return Response.json({ error: 'Módulo inválido' }, { status: 400 });
    }

    result = await base44.functions.invoke(functionName, {
      dataType: dataType || 'all',
      filters: filters || {}
    });

    const executionTime = Date.now() - startTime;

    await base44.asServiceRole.entities.IntegrationLog.create({
      integration_name: 'ERP_Sync_Manual',
      operation_type: 'sync',
      entity_name: module,
      status: result.data?.success ? 'success' : 'error',
      records_processed: 1,
      records_success: result.data?.success ? 1 : 0,
      records_error: result.data?.success ? 0 : 1,
      execution_time_ms: executionTime,
      metadata: JSON.stringify({ 
        module, 
        dataType, 
        user: user.email,
        timestamp: new Date().toISOString()
      })
    });

    return Response.json({ 
      success: true, 
      data: result.data,
      execution_time_ms: executionTime
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    try {
      const base44 = createClientFromRequest(req);
      const { module } = await req.json().catch(() => ({}));
      
      await base44.asServiceRole.entities.IntegrationLog.create({
        integration_name: 'ERP_Sync_Manual',
        operation_type: 'sync',
        entity_name: module || 'unknown',
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