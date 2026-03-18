import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Guardrails: padrões sensíveis a bloquear
const SENSITIVE_PATTERNS = [
  /senha/i, /password/i, /token/i, /secret/i, /api.?key/i,
  /\d{3}\.\d{3}\.\d{3}-\d{2}/, // CPF
  /bearer\s+[a-z0-9\-_\.]+/i
];

function containsSensitiveData(text) {
  return SENSITIVE_PATTERNS.some(p => p.test(text));
}

// Busca RAG simples por relevância de palavras-chave
function scoreDocument(doc, query) {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter(w => w.length > 3);
  const text = `${doc.title} ${doc.content} ${doc.tags || ''}`.toLowerCase();
  let score = 0;
  for (const word of words) {
    if (text.includes(word)) score++;
  }
  return score;
}

// Contexto por módulo/página
function getModuleContext(module) {
  const contexts = {
    'Dashboard': 'O usuário está no Dashboard. Priorize explicar métricas de budget, orçado vs realizado, pipeline e KPIs financeiros.',
    'Pipeline': 'O usuário está no Pipeline. Priorize informações sobre propostas (AP), oportunidades (OAP), follow-ups e funil de vendas.',
    'Projetos': 'O usuário está em Projetos. Priorize informações sobre Ordens de Serviço, responsáveis técnicos, status e prazos.',
    'Financeiro': 'O usuário está no Financeiro. Priorize informações sobre parcelas, faturamento, recebimentos e inadimplência.',
    'Budget': 'O usuário está no Budget. Priorize informações sobre metas anuais, budget por natureza e alocação de colaboradores.',
    'Marketing': 'O usuário está em Marketing. Priorize informações sobre vendas, orçado vs realizado de marketing e campanhas.',
    'Admin': 'O usuário está no Admin. Priorize informações sobre gestão de usuários, departamentos e configurações do sistema.',
  };
  return contexts[module] || 'O usuário está no Portal APSIS.';
}

Deno.serve(async (req) => {
  const startTime = Date.now();

  try {
    const base44 = createClientFromRequest(req);

    // Autenticação obrigatória
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const { message, history = [], currentPage = 'Geral' } = body;

    if (!message || !message.trim()) {
      return Response.json({ error: 'Mensagem vazia.' }, { status: 400 });
    }

    // Guardrail: bloquear dados sensíveis na entrada
    if (containsSensitiveData(message)) {
      await base44.asServiceRole.entities.AssistantLog.create({
        user_email: user.email,
        user_role: user.role,
        modulo: currentPage,
        status: 'blocked',
        sources_count: 0,
        latency_ms: Date.now() - startTime
      });
      return Response.json({
        response: '⚠️ Sua mensagem parece conter dados sensíveis (senhas, tokens, CPF, etc.). Por segurança, não posso processar esse tipo de conteúdo. Por favor, reformule sem incluir informações confidenciais.',
        sources: []
      });
    }

    // Verificar se widget está ativo
    const configs = await base44.asServiceRole.entities.AssistantConfig.filter({ key: 'widget_enabled' });
    if (configs && configs.length > 0 && configs[0].value === 'false') {
      return Response.json({
        response: 'O Assistente APSIS está temporariamente desativado. Entre em contato com o administrador.',
        sources: []
      });
    }

    // RAG: buscar documentos relevantes com filtro de RBAC
    const allDocs = await base44.asServiceRole.entities.KnowledgeBase.filter({ ativo: true });

    // Filtrar por permissão de role e módulo
    const accessibleDocs = allDocs.filter(doc => {
      // Verificar acesso por role
      if (doc.allowed_roles && doc.allowed_roles.length > 0) {
        if (!doc.allowed_roles.includes(user.role)) return false;
      }
      // Sensibilidade: RESTRITO só para admin/manager
      if (doc.sensitivity === 'RESTRITO' && !['admin', 'manager'].includes(user.role)) return false;
      return true;
    });

    // Módulo: priorizar docs do módulo atual + Geral
    const moduleFiltered = accessibleDocs.filter(doc =>
      doc.module === currentPage || doc.module === 'Geral'
    );
    const docsToSearch = moduleFiltered.length > 0 ? moduleFiltered : accessibleDocs;

    // Scoring por relevância
    const scored = docsToSearch
      .map(doc => ({ doc, score: scoreDocument(doc, message) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    // Montar contexto RAG
    let ragContext = '';
    const sources = [];
    if (scored.length > 0) {
      ragContext = '\n\n--- BASE DE CONHECIMENTO APSIS ---\n';
      for (const { doc } of scored) {
        ragContext += `\n[${doc.title}]\n${doc.content}\n`;
        sources.push({ title: doc.title, category: doc.category, module: doc.module });
      }
      ragContext += '--- FIM DA BASE DE CONHECIMENTO ---\n';
    }

    // Contexto por módulo
    const moduleContext = getModuleContext(currentPage);

    // Histórico formatado (últimas 6 mensagens)
    const recentHistory = history.slice(-6).map(h =>
      `${h.role === 'user' ? 'Usuário' : 'Assistente'}: ${h.content}`
    ).join('\n');

    // Montar prompt completo
    const systemPrompt = `Você é o Assistente APSIS, um assistente corporativo do Portal APSIS — sistema de gestão de projetos, pipeline e financeiro.

REGRAS OBRIGATÓRIAS:
- Responda SEMPRE em português brasileiro.
- Baseie-se prioritariamente no contexto da base de conhecimento fornecido.
- Se usar informações da base, mencione as fontes ao final.
- NÃO invente informações. Se não souber, diga claramente.
- NUNCA solicite nem aceite senhas, tokens, chaves de API ou dados sensíveis.
- Se o usuário pedir conteúdo fora do seu acesso, recuse e oriente a solicitar formalmente ao administrador.
- Seja objetivo e profissional.

CONTEXTO DO MÓDULO ATUAL: ${moduleContext}

USUÁRIO ATUAL: ${user.full_name} (perfil: ${user.role})`;

    const fullPrompt = `${systemPrompt}

${ragContext}

HISTÓRICO RECENTE:
${recentHistory || '(sem histórico)'}

PERGUNTA ATUAL DO USUÁRIO:
${message}

Responda de forma clara e objetiva. ${sources.length > 0 ? 'Ao final, liste as fontes utilizadas da base de conhecimento.' : ''}`;

    // Chamar o LLM
    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: fullPrompt
    });

    const responseText = typeof llmResponse === 'string' ? llmResponse : llmResponse?.result || 'Não foi possível gerar uma resposta.';

    // Log de uso
    await base44.asServiceRole.entities.AssistantLog.create({
      user_email: user.email,
      user_role: user.role,
      modulo: currentPage,
      status: 'success',
      sources_count: sources.length,
      latency_ms: Date.now() - startTime
    });

    return Response.json({
      response: responseText,
      sources: sources
    });

  } catch (error) {
    return Response.json({ error: 'Erro interno: ' + error.message }, { status: 500 });
  }
});