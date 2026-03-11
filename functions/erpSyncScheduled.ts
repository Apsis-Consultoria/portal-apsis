import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Sincronização Agendada ERP
 * Executada automaticamente para sincronizar dados do ERP
 * Deve ser configurada como automação agendada (ex: diariamente às 2h)
 */

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    const base44 = createClientFromRequest(req);

    // Buscar configurações ativas de integração
    const configs = await base44.asServiceRole.entities.IntegrationConfig.filter({
      is_active: true
    });

    const results = {
      total: configs.length,
      success: 0,
      errors: 0,
      details: []
    };

    for (const config of configs) {
      try {
        let syncResult;

        // Executar sincronização baseada no tipo de integração
        switch (config.integration_type) {
          case 'dashboard':
            syncResult = await base44.asServiceRole.functions.invoke('erpDashboard', {
              dataType: 'all',
              filters: config.filter_rules ? JSON.parse(config.filter_rules) : {}
            });
            break;

          case 'projetos':
            syncResult = await base44.asServiceRole.functions.invoke('erpProjetos', {
              dataType: 'all',
              filters: config.filter_rules ? JSON.parse(config.filter_rules) : {}
            });
            break;

          case 'financeiro':
            syncResult = await base44.asServiceRole.functions.invoke('erpFinanceiro', {
              dataType: 'all',
              filters: config.filter_rules ? JSON.parse(config.filter_rules) : {}
            });
            break;

          case 'qualidade':
            syncResult = await base44.asServiceRole.functions.invoke('erpQualidade', {
              dataType: 'all',
              filters: config.filter_rules ? JSON.parse(config.filter_rules) : {}
            });
            break;
        }

        // Atualizar última sincronização
        await base44.asServiceRole.entities.IntegrationConfig.update(config.id, {
          last_sync_date: new Date().toISOString()
        });

        results.success++;
        results.details.push({
          integration: config.integration_name,
          status: 'success',
          data: syncResult?.data
        });

      } catch (error) {
        results.errors++;
        results.details.push({
          integration: config.integration_name,
          status: 'error',
          error: error.message
        });

        // Enviar notificação de erro se configurado
        if (config.error_notification_email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: config.error_notification_email,
            subject: `Erro na Sincronização ERP - ${config.integration_name}`,
            body: `Erro ao sincronizar ${config.integration_name}:\n\n${error.message}`
          });
        }
      }
    }

    const executionTime = Date.now() - startTime;

    await base44.asServiceRole.entities.IntegrationLog.create({
      integration_name: 'ERP_Sync_Scheduled',
      operation_type: 'sync',
      entity_name: 'All',
      status: results.errors > 0 ? 'partial' : 'success',
      records_processed: results.total,
      records_success: results.success,
      records_error: results.errors,
      execution_time_ms: executionTime,
      metadata: JSON.stringify(results.details)
    });

    return Response.json({ 
      success: true, 
      results,
      execution_time_ms: executionTime
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    return Response.json({ 
      error: error.message,
      execution_time_ms: executionTime 
    }, { status: 500 });
  }
});