import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import { v4 as uuidv4 } from 'npm:uuid@9.0.0';

const generateToken = () => uuidv4();
const generateActivationCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { action, email, password, code, token } = await req.json();

    // Login
    if (action === 'login') {
      try {
        const clients = await base44.asServiceRole.entities.ClientAuth.filter({
          email: email.toLowerCase().trim(),
          status: 'ativo'
        });

        if (clients.length === 0) {
          return Response.json({
            success: false,
            message: 'E-mail ou senha inválidos.'
          });
        }

        const client = clients[0];

        // Verificar bloqueio por tentativas falhas
        if (client.bloqueado_ate && new Date(client.bloqueado_ate) > new Date()) {
          const minutos = Math.ceil((new Date(client.bloqueado_ate) - new Date()) / 60000);
          return Response.json({
            success: false,
            message: `Sua conta foi temporariamente bloqueada. Tente novamente em ${minutos} minutos.`
          });
        }

        // Validar senha (simplificado - em produção usar bcrypt)
        if (client.password_hash !== hashPassword(password)) {
          // Incrementar tentativas falhas
          const tentativas = (client.tentativas_falhas || 0) + 1;
          const bloqueadoAte = tentativas >= 5 ? new Date(Date.now() + 30 * 60000).toISOString() : null;

          await base44.asServiceRole.entities.ClientAuth.update(client.id, {
            tentativas_falhas: tentativas,
            bloqueado_ate: bloqueadoAte
          });

          return Response.json({
            success: false,
            message: tentativas >= 5 ? 'Muitas tentativas. Conta bloqueada por 30 minutos.' : 'E-mail ou senha inválidos.'
          });
        }

        // Sucesso - gerar token de sessão
        const sessionToken = generateToken();
        const expiresIn = 3600; // 1 hora
        const sessaoExpira = new Date(Date.now() + expiresIn * 1000).toISOString();

        await base44.asServiceRole.entities.ClientAuth.update(client.id, {
          sessao_token: sessionToken,
          sessao_expira: sessaoExpira,
          ultimo_acesso: new Date().toISOString(),
          tentativas_falhas: 0,
          bloqueado_ate: null
        });

        // Registrar auditoria
        await registerAuditLog(base44, client.id, 'login_sucesso', email);

        return Response.json({
          success: true,
          user: {
            email: client.email,
            workspace_id: client.workspace_id,
            nome_cliente: client.nome_cliente
          },
          sessionToken,
          expiresIn
        });
      } catch (error) {
        console.error('Login error:', error);
        return Response.json({
          success: false,
          message: 'Erro ao processar login.'
        }, { status: 500 });
      }
    }

    // Solicitar código de ativação
    if (action === 'request_activation_code') {
      try {
        const clients = await base44.asServiceRole.entities.ClientAuth.filter({
          email: email.toLowerCase().trim()
        });

        if (clients.length === 0) {
          return Response.json({
            success: false,
            message: 'E-mail não encontrado.'
          });
        }

        const client = clients[0];

        if (client.status === 'ativo') {
          return Response.json({
            success: false,
            message: 'Esta conta já está ativada.'
          });
        }

        const code = generateActivationCode();
        const expiresAt = new Date(Date.now() + 10 * 60000).toISOString(); // 10 minutos

        // Guardar código temporariamente (em produção usar cache/Redis)
        // Por simplicidade, guardar em um campo de meta
        await base44.asServiceRole.entities.ClientAuth.update(client.id, {
          token_recuperacao: code,
          token_recuperacao_expira: expiresAt
        });

        // Em produção: enviar e-mail com o código
        // await sendEmail(email, 'Código de Ativação APSIS', `Seu código: ${code}`);

        return Response.json({ success: true });
      } catch (error) {
        console.error('Activation request error:', error);
        return Response.json({ success: false }, { status: 500 });
      }
    }

    // Verificar código de ativação
    if (action === 'verify_activation_code') {
      try {
        const clients = await base44.asServiceRole.entities.ClientAuth.filter({
          email: email.toLowerCase().trim(),
          token_recuperacao: code
        });

        if (clients.length === 0 || new Date(clients[0].token_recuperacao_expira) < new Date()) {
          return Response.json({
            success: false,
            message: 'Código inválido ou expirado.'
          });
        }

        return Response.json({ success: true });
      } catch (error) {
        console.error('Verification error:', error);
        return Response.json({ success: false }, { status: 500 });
      }
    }

    // Ativar conta
    if (action === 'activate_account') {
      try {
        const clients = await base44.asServiceRole.entities.ClientAuth.filter({
          email: email.toLowerCase().trim(),
          token_recuperacao: code
        });

        if (clients.length === 0 || new Date(clients[0].token_recuperacao_expira) < new Date()) {
          return Response.json({
            success: false,
            message: 'Código inválido ou expirado.'
          });
        }

        const client = clients[0];

        await base44.asServiceRole.entities.ClientAuth.update(client.id, {
          status: 'ativo',
          password_hash: hashPassword(password),
          token_recuperacao: null,
          token_recuperacao_expira: null
        });

        await registerAuditLog(base44, client.id, 'conta_ativada', email);

        return Response.json({ success: true });
      } catch (error) {
        console.error('Activation error:', error);
        return Response.json({ success: false }, { status: 500 });
      }
    }

    // Solicitar redefinição de senha
    if (action === 'request_password_reset') {
      try {
        const clients = await base44.asServiceRole.entities.ClientAuth.filter({
          email: email.toLowerCase().trim(),
          status: 'ativo'
        });

        if (clients.length === 0) {
          return Response.json({
            success: false,
            message: 'E-mail não encontrado.'
          });
        }

        const client = clients[0];
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 2 * 60 * 60000).toISOString(); // 2 horas

        await base44.asServiceRole.entities.ClientAuth.update(client.id, {
          token_recuperacao: token,
          token_recuperacao_expira: expiresAt
        });

        // Em produção: enviar e-mail com link de reset
        // const resetLink = `https://seu-dominio.com/ClientResetPassword?token=${token}`;
        // await sendEmail(email, 'Recuperar Senha', `Link: ${resetLink}`);

        await registerAuditLog(base44, client.id, 'reset_solicitado', email);

        return Response.json({ success: true });
      } catch (error) {
        console.error('Password reset request error:', error);
        return Response.json({ success: false }, { status: 500 });
      }
    }

    // Redefinir senha
    if (action === 'reset_password') {
      try {
        const clients = await base44.asServiceRole.entities.ClientAuth.filter({
          token_recuperacao: token,
          status: 'ativo'
        });

        if (clients.length === 0 || new Date(clients[0].token_recuperacao_expira) < new Date()) {
          return Response.json({
            success: false,
            message: 'Link inválido ou expirado.'
          });
        }

        const client = clients[0];

        await base44.asServiceRole.entities.ClientAuth.update(client.id, {
          password_hash: hashPassword(password),
          token_recuperacao: null,
          token_recuperacao_expira: null
        });

        await registerAuditLog(base44, client.id, 'senha_alterada', client.email);

        return Response.json({ success: true });
      } catch (error) {
        console.error('Password reset error:', error);
        return Response.json({ success: false }, { status: 500 });
      }
    }

    return Response.json({ error: 'Action not found' }, { status: 400 });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// Funções auxiliares
function hashPassword(password) {
  // Em produção, usar bcrypt ou similar
  // Isso é apenas para demonstração
  return btoa(password + 'apsis-salt');
}

async function registerAuditLog(base44, clientId, action, email) {
  try {
    // Criar registro de auditoria - você pode criar uma entidade AuditLog se quiser
    console.log(`[AUDIT] ${action} | Client: ${clientId} | Email: ${email} | Time: ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error logging audit:', error);
  }
}