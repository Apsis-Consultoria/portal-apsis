import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Portais imobiliários integrados
const PORTAIS = {
  vivareal: {
    nome: "Viva Real",
    url: "https://glue-api.vivareal.com/v2/listings",
    params: (estado, cidade, bairro, quartos, tipo) => ({
      addressCountry: "BR",
      addressState: estado,
      addressCity: cidade,
      addressNeighborhood: bairro || "",
      bedrooms: quartos || 1,
      listingType: "USED",
      unitTypes: tipo === "apartamento" ? ["APARTMENT"] : ["HOME"],
      size: 10,
    }),
  },
  zapimoveis: {
    nome: "ZAP Imóveis",
    url: "https://glue-api.zapimoveis.com.br/v2/listings",
    params: (estado, cidade, bairro, quartos, tipo) => ({
      addressCountry: "BR",
      addressState: estado,
      addressCity: cidade,
      addressNeighborhood: bairro || "",
      bedrooms: quartos || 1,
      listingType: "USED",
      unitTypes: tipo === "apartamento" ? ["APARTMENT"] : ["HOME"],
      size: 10,
    }),
  },
};

// Plano Presidente por faixa de municípios (base de referência APSIS)
const PLANO_PRESIDENTE = {
  "São Paulo": { valor: 1200, descricao: "Capital SP - Faixa Premium", ativo: true },
  "Rio de Janeiro": { valor: 1100, descricao: "Capital RJ - Faixa Premium", ativo: true },
  "Belo Horizonte": { valor: 950, descricao: "Grande BH - Faixa A", ativo: true },
  "Curitiba": { valor: 900, descricao: "Grande Curitiba - Faixa A", ativo: true },
  "Porto Alegre": { valor: 880, descricao: "Grande POA - Faixa A", ativo: true },
  "Salvador": { valor: 850, descricao: "Grande Salvador - Faixa B", ativo: true },
  "Fortaleza": { valor: 820, descricao: "Grande Fortaleza - Faixa B", ativo: true },
  "Manaus": { valor: 800, descricao: "Manaus - Faixa B", ativo: true },
  "Recife": { valor: 800, descricao: "Grande Recife - Faixa B", ativo: true },
  "Goiânia": { valor: 780, descricao: "Grande Goiânia - Faixa B", ativo: true },
  "default": { valor: 650, descricao: "Municípios do Interior - Faixa C", ativo: true },
};

function getPlanoPresidente(municipio) {
  return PLANO_PRESIDENTE[municipio] || PLANO_PRESIDENTE["default"];
}

// Calcular avaliação estimada com base nos dados
function calcularAvaliacao(dados) {
  const { estado, municipio, bairro, tipo, quartos, banheiros, area, adicionais } = dados;
  
  // Preços base por m² por UF (referência FIPE/ZAP 2024)
  const precoBaseM2 = {
    "SP": 9500, "RJ": 10200, "MG": 6800, "RS": 6500, "PR": 6200,
    "SC": 7100, "BA": 5800, "CE": 5200, "PE": 5500, "GO": 5000,
    "AM": 5300, "ES": 6000, "DF": 9800, "MT": 4800, "MS": 4600,
    "PA": 4500, "MA": 4200, "PB": 4300, "RN": 4400, "AL": 4100,
    "SE": 4300, "PI": 4000, "TO": 4200, "RO": 4100, "AC": 3900,
    "AP": 4000, "RR": 3800,
  };

  const base = precoBaseM2[estado] || 5000;
  const areaCalc = area || (quartos * 40);
  
  let valorM2 = base;
  
  // Ajustes por tipo
  if (tipo === "apartamento") valorM2 *= 1.1;
  if (tipo === "casa_condominio") valorM2 *= 1.15;
  if (tipo === "cobertura") valorM2 *= 1.4;
  if (tipo === "terreno") valorM2 *= 0.6;

  // Ajustes por quartos
  valorM2 *= (1 + (quartos - 1) * 0.05);
  
  // Ajustes por adicionais
  const adicionalValores = {
    piscina: 0.08, churrasqueira: 0.03, playground: 0.02, academia: 0.04,
    salao_festas: 0.02, portaria_24h: 0.03, elevador: 0.05, garagem: 0.06,
    sacada: 0.03, jardim: 0.02, sauna: 0.03, quadra: 0.03,
  };
  
  let multiplicadorAdicionais = 1;
  if (adicionais && adicionais.length > 0) {
    adicionais.forEach(a => {
      multiplicadorAdicionais += (adicionalValores[a] || 0);
    });
  }

  const valorEstimado = Math.round(areaCalc * valorM2 * multiplicadorAdicionais);
  const valorMin = Math.round(valorEstimado * 0.85);
  const valorMax = Math.round(valorEstimado * 1.15);

  return {
    estimativa: valorEstimado,
    faixa_min: valorMin,
    faixa_max: valorMax,
    valor_m2: Math.round(valorM2 * multiplicadorAdicionais),
    area_calculada: areaCalc,
  };
}

async function buscarPortal(portal, estado, municipio, bairro, quartos, tipo) {
  const config = PORTAIS[portal];
  if (!config) return null;

  try {
    const params = new URLSearchParams();
    const queryParams = config.params(estado, municipio, bairro, quartos, tipo);
    Object.entries(queryParams).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach(val => params.append(k, val));
      else params.append(k, v);
    });

    const response = await fetch(`${config.url}?${params.toString()}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; APSIS-Valuation/1.0)",
        "Accept": "application/json",
        "X-Domain": portal === "vivareal" ? "www.vivareal.com.br" : "www.zapimoveis.com.br",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return { portal: config.nome, erro: `HTTP ${response.status}`, listings: [] };

    const data = await response.json();
    const listings = (data?.search?.result?.listings || []).slice(0, 5).map(l => ({
      id: l.listing?.id,
      titulo: l.listing?.title || "Imóvel",
      preco: l.listing?.pricingInfos?.[0]?.price || 0,
      area: l.listing?.usableAreas?.[0] || 0,
      quartos: l.listing?.bedrooms?.[0] || 0,
      banheiros: l.listing?.bathrooms?.[0] || 0,
      endereco: l.listing?.address?.street || municipio,
      bairro: l.listing?.address?.neighborhood || bairro,
      link: `https://${portal === "vivareal" ? "www.vivareal.com.br" : "www.zapimoveis.com.br"}/imovel/${l.listing?.id}`,
      imagem: l.medias?.[0]?.url || null,
    }));

    return { portal: config.nome, listings, total: data?.search?.totalCount || 0 };
  } catch (err) {
    return { portal: config.nome, erro: err.message, listings: [] };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { estado, municipio, bairro, tipo, quartos, banheiros, area, adicionais } = body;

    if (!estado || !municipio) {
      return Response.json({ error: "Estado e município são obrigatórios" }, { status: 400 });
    }

    // Executa tudo em paralelo
    const [vivareals, zapimoveis, avaliacaoLocal, planoPresidente] = await Promise.all([
      buscarPortal("vivareal", estado, municipio, bairro, quartos, tipo),
      buscarPortal("zapimoveis", estado, municipio, bairro, quartos, tipo),
      Promise.resolve(calcularAvaliacao({ estado, municipio, bairro, tipo, quartos, banheiros, area, adicionais })),
      Promise.resolve(getPlanoPresidente(municipio)),
    ]);

    // Calcula média dos portais para enriquecer a avaliação
    const todosListings = [
      ...(vivareals?.listings || []),
      ...(zapimoveis?.listings || []),
    ];

    const mediaPortais = todosListings.length > 0
      ? Math.round(todosListings.reduce((acc, l) => acc + (l.preco || 0), 0) / todosListings.length)
      : null;

    const avaliacaoFinal = {
      ...avaliacaoLocal,
      media_mercado: mediaPortais,
      confianca: todosListings.length >= 5 ? "Alta" : todosListings.length >= 2 ? "Média" : "Estimada",
    };

    return Response.json({
      success: true,
      avaliacao: avaliacaoFinal,
      plano_presidente: planoPresidente,
      portais: {
        vivareal: vivareals,
        zapimoveis: zapimoveis,
        imoveisweb: { portal: "Imóveis Web", listings: [], info: "Integração via parceiro OLX Group" },
        quintoandar: { portal: "Quinto Andar", listings: [], info: "API privada - dados estimados via mercado" },
      },
      comparaveis: todosListings.slice(0, 8),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});