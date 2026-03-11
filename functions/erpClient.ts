import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Cliente centralizado para integração com ERP externo
 * Gerencia autenticação, logging e tratamento de erros
 */

const ERP_BASE_URL = Deno.env.get("ERP_API_URL");
const ERP_API_KEY = Deno.env.get("ERP_API_KEY");
const ERP_API_TOKEN = Deno.env.get("ERP_API_TOKEN");

async function logIntegration(base44, integrationName, operationType, status, details = {}) {
  try {
    await base44.asServiceRole.entities.IntegrationLog.create({
      integration_name: integrationName,
      operation_type: operationType,
      entity_name: details.entity_name || 'N/A',
      status: status,
      records_processed: details.records_processed || 0,
      records_success: details.records_success || 0,
      records_error: details.records_error || 0,
      error_message: details.error_message || null,
      execution_time_ms: details.execution_time_ms || 0,
      metadata: JSON.stringify(details.metadata || {})
    });
  } catch (e) {
    console.error('Erro ao registrar log de integração:', e);
  }
}

async function makeERPRequest(endpoint, options = {}) {
  if (!ERP_BASE_URL) {
    throw new Error('ERP_API_URL não configurada');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (ERP_API_KEY) headers['X-API-Key'] = ERP_API_KEY;
  if (ERP_API_TOKEN) headers['Authorization'] = `Bearer ${ERP_API_TOKEN}`;

  const url = `${ERP_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ERP API Error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { method, endpoint, body, integrationName, entityName } = await req.json();

    const data = await makeERPRequest(endpoint, {
      method: method || 'GET',
      body: body ? JSON.stringify(body) : undefined
    });

    const executionTime = Date.now() - startTime;

    await logIntegration(base44, integrationName || 'ERP_API', 'sync', 'success', {
      entity_name: entityName || 'unknown',
      records_processed: Array.isArray(data) ? data.length : 1,
      records_success: Array.isArray(data) ? data.length : 1,
      execution_time_ms: executionTime,
      metadata: { endpoint, method }
    });

    return Response.json({ success: true, data, execution_time_ms: executionTime });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    try {
      const base44 = createClientFromRequest(req);
      const { integrationName, entityName } = await req.json().catch(() => ({}));
      
      await logIntegration(base44, integrationName || 'ERP_API', 'sync', 'error', {
        entity_name: entityName || 'unknown',
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