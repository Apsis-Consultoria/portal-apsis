import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Integração ERP - Financeiro
 * Busca dados de contas a pagar, receber, parcelas e fluxo de caixa
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

    // Contas a Pagar
    if (dataType === 'all' || dataType === 'contas_pagar') {
      const response = await base44.functions.invoke('erpClient', {
        endpoint: '/api/financeiro/contas-pagar',
        method: 'POST',
        body: { filters },
        integrationName: 'ERP_Financeiro_ContasPagar',
        entityName: 'ContasPagar'
      });
      
      if (response.data?.success) {
        data.contasPagar = response.data.data;
      }
    }

    // Contas a Receber
    if (dataType === 'all' || dataType === 'contas_receber') {
      const response = await base44.functions.invoke('erpClient', {
        endpoint: '/api/financeiro/contas-receber',
        method: 'POST',
        body: { filters },
        integrationName: 'ERP_Financeiro_ContasReceber',
        entityName: 'ContasReceber'
      });
      
      if (response.data?.success) {
        data.contasReceber = response.data.data;
      }
    }

    // Parcelas
    if (dataType === 'all' || dataType === 'parcelas') {
      const response = await base44.functions.invoke('erpClient', {
        endpoint: '/api/financeiro/parcelas',
        method: 'POST',
        body: { filters },
        integrationName: 'ERP_Financeiro_Parcelas',
        entityName: 'Parcela'
      });
      
      if (response.data?.success) {
        data.parcelas = response.data.data;
        
        // Sincronizar parcelas locais
        for (const parcela of response.data.data) {
          const existing = await base44.asServiceRole.entities.Parcela.filter({ 
            proposta_id: parcela.proposta_id,
            data_vencimento: parcela.data_vencimento
          });
          
          if (existing.length > 0) {
            await base44.asServiceRole.entities.Parcela.update(existing[0].id, parcela);
          } else {
            await base44.asServiceRole.entities.Parcela.create(parcela);
          }
        }
      }
    }

    // Fluxo de Caixa
    if (dataType === 'all' || dataType === 'fluxo_caixa') {
      const response = await base44.functions.invoke('erpClient', {
        endpoint: '/api/financeiro/fluxo-caixa',
        method: 'POST',
        body: { filters },
        integrationName: 'ERP_Financeiro_FluxoCaixa',
        entityName: 'FluxoCaixa'
      });
      
      if (response.data?.success) {
        data.fluxoCaixa = response.data.data;
      }
    }

    const executionTime = Date.now() - startTime;

    await base44.asServiceRole.entities.IntegrationLog.create({
      integration_name: 'ERP_Financeiro',
      operation_type: 'sync',
      entity_name: 'Financeiro',
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
        integration_name: 'ERP_Financeiro',
        operation_type: 'sync',
        entity_name: 'Financeiro',
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