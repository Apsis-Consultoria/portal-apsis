// Estrutura de grupos de páginas
export const MENU_GROUPS = [
  {
    label: "Inovação e Tecnologia",
    group: "TecnologiaInicio",
    pages: [
      { label: "Estoque de Ativos", page: "EstoqueAtivos" },
      { label: "Alocação de Equipamentos", page: "AlocacaoEquipamentos" },
      { label: "Movimentações", page: "MovimentacoesEquipamentos" },
      { label: "Dashboard TI", page: "DashboardTI" },
      { label: "Painel de Solicitações IA", page: "SolicitacoesIAAdmin" }
    ]
  },
  {
    label: "Infraestrutura",
    group: "Infraestrutura",
    pages: [
      { label: "Infraestrutura", page: "Infraestrutura" }
    ]
  },
  {
    label: "Business Valuation",
    group: "BusinessValuation",
    pages: [
      { label: "Controle de Alocação de Horas", page: "BusinessValuation" }
    ]
  },
  {
    label: "Financeiro",
    group: "Financeiro",
    pages: [
      { label: "Contas a Pagar", page: "ContasAPagar" },
      { label: "Contas a Receber", page: "ContasAReceber" },
      { label: "Fluxo de Caixa", page: "FluxoCaixa" },
      { label: "Estoque", page: "Estoque" },
      { label: "Rateio de Despesas", page: "RateioDespesas" }
    ]
  },
  {
    label: "Ativos Fixos",
    group: "AtivosFixos",
    pages: [
      { label: "APP Inventário", page: "AppAtivoFixo" },
      { label: "App Conciliação", page: "AppConciliacao" },
      { label: "App Imóveis", page: "AppImoveis" }
    ]
  },
  {
    label: "Projetos Especiais",
    group: "ProjetosEspeciais",
    pages: [
      { label: "Projetos Especiais", page: "ProjetosEspeciais" }
    ]
  },
  {
    label: "M&A",
    group: "MA",
    pages: [
      { label: "M&A", page: "MA" }
    ]
  },
  {
    label: "Marketing & Estratégia",
    group: "Marketing",
    pages: [
      { label: "Indicadores Estratégicos", page: "MarketingIndicadores" }
    ]
  },
  {
    label: "Consultoria Contábil",
    group: "ConsultoriaContabil",
    pages: [
      { label: "Consultoria Contábil", page: "ConsultoriaContabil" }
    ]
  },
  {
    label: "Capital Humano",
    group: "CapitalHumano",
    pages: [
      { label: "Capital Humano", page: "CapitalHumano" },
      { label: "Rateios CH", page: "RateiosCapitalHumano" },
      { label: "Rateio Caju", page: "RateioCaju" },
      { label: "Férias", page: "Ferias" },
      { label: "Onboarding", page: "OnboardingInterno" }
    ]
  },
  {
    label: "Editoração",
    group: "Editoracao",
    pages: [
      { label: "Editoração", page: "Editoracao" }
    ]
  },
  {
    label: "Perícias",
    group: "Pericias",
    pages: [
      { label: "Perícias", page: "Pericias" }
    ]
  },
  {
    label: "Comercial",
    group: "Comercial",
    pages: [
      { label: "Comercial", page: "Comercial" }
    ]
  },
  {
    label: "Diretoria Técnica",
    group: "DiretoriaTecnica",
    pages: [
      { label: "Diretoria Técnica", page: "DiretoriaTecnica" }
    ]
  },
  {
    label: "Consultoria Estratégica",
    group: "ConsultoriaEstrategica",
    pages: [
      { label: "Consultoria Estratégica", page: "ConsultoriaEstrategica" }
    ]
  },
  {
    label: "Sustentabilidade",
    group: "Sustentabilidade",
    pages: [
      { label: "Sustentabilidade", page: "Sustentabilidade" }
    ]
  },
  {
    label: "Apps APSIS",
    group: "AppsAPSIS",
    pages: [
      { label: "APSIS CUBUS", page: "AppCubus" }
    ]
  },
  {
    label: "Planejamento Estratégico",
    group: "PlanejamentoEstrategico",
    pages: [
      { label: "Planejamento Estratégico", page: "PlanejamentoEstrategico" }
    ]
  },
  {
    label: "Inova+",
    group: "InovaPlus",
    pages: [
      { label: "Inova+ Platform", externalUrl: "https://inova.apsis.com.br/" }
    ]
  },
  {
    label: "Geral",
    group: "Geral",
    pages: [
      { label: "Boas-Vindas", page: "BoasVindas" },
      { label: "Configurações", page: "Configuracoes" },
      { label: "Gerenciamento de Acessos", page: "GerenciamentoAcessos" }
    ]
  }
];

export const AREAS_DISPONIVEIS = [
  "Contábil",
  "Consultoria",
  "Tributária",
  "Societária",
  "M&A",
  "Projetos Especiais",
  "Outros"
];

export const CARGOS_DISPONIVEIS = [
  "Analista",
  "Coordenador",
  "Gerente",
  "Diretor",
  "Partner",
  "Estagiário"
];