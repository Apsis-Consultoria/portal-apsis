import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  return Response.json({
    clientId: Deno.env.get("VITE_AZURE_CLIENT_ID"),
    tenantId: Deno.env.get("VITE_AZURE_TENANT_ID"),
  });
});