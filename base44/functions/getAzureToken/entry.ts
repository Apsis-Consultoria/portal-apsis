/**
 * getAzureToken - Obtém token de acesso do Azure AD usando credenciais de cliente
 * 
 * Utiliza o fluxo OAuth 2.0 Client Credentials para autenticar com o Microsoft Graph.
 * Requer variáveis de ambiente: AZ_TENANT_ID, AZ_CLIENT_ID, AZ_CLIENT_SECRET
 * 
 * Retorna:
 * - Sucesso: { ok: true, access_token, expires_in, token_type }
 * - Erro: { ok: false, error }
 */

Deno.serve(async (req) => {
  try {
    const tenant = Deno.env.get("AZ_TENANT_ID");
    const clientId = Deno.env.get("AZ_CLIENT_ID");
    const clientSecret = Deno.env.get("AZ_CLIENT_SECRET");

    if (!tenant || !clientId || !clientSecret) {
      return Response.json(
        { 
          ok: false, 
          error: "Variáveis de ambiente não configuradas: AZ_TENANT_ID, AZ_CLIENT_ID, AZ_CLIENT_SECRET" 
        },
        { status: 500 }
      );
    }

    const url = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials"
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          ok: false,
          error: data
        },
        { status: response.status }
      );
    }

    return Response.json({
      ok: true,
      access_token: data.access_token,
      expires_in: data.expires_in,
      token_type: data.token_type
    });

  } catch (error) {
    return Response.json(
      { 
        ok: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
});