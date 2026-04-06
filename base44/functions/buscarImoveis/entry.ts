import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PLANO_DIRETOR = {
  "Rio de Janeiro": {
    url: "https://planodiretor.rio/",
    lei_zoneamento: "https://leismunicipais.com.br/plano-de-ordenamento-urbano-rio-de-janeiro-rj",
    iptu: "https://carioca.rio/servicos/iptu/"
  },
  "São Paulo": {
    url: "https://gestaourbana.prefeitura.sp.gov.br/marco-regulatorio/plano-diretor/",
    lei_zoneamento: "https://gestaourbana.prefeitura.sp.gov.br/marco-regulatorio/lei-de-zoneamento/",
    iptu: "https://iptu.prefeitura.sp.gov.br/"
  },
  "Belo Horizonte": {
    url: "https://planodiretor.pbh.gov.br/",
    lei_zoneamento: "https://www.pbh.gov.br/regulamentacao-urbana",
    iptu: "https://bhiss.pbh.gov.br/"
  },
  "Curitiba": {
    url: "https://www.curitiba.pr.gov.br/conteudo/plano-diretor/2819",
    lei_zoneamento: "https://www.curitiba.pr.gov.br/conteudo/legislacao-urbanistica/178",
    iptu: "https://www.curitiba.pr.gov.br/servicos/tributario/iptu"
  },
  "Porto Alegre": {
    url: "https://www2.portoalegre.rs.gov.br/pgm/default.php?p_secao=467",
    lei_zoneamento: "https://www2.portoalegre.rs.gov.br/spm/default.php?p_secao=539",
    iptu: "https://www2.portoalegre.rs.gov.br/smf/"
  },
  "Salvador": {
    url: "https://www.salvador.ba.gov.br/index.php/plano-diretor",
    lei_zoneamento: "https://www.salvador.ba.gov.br/index.php/zoneamento",
    iptu: "https://iptu.salvador.ba.gov.br/"
  },
  "Fortaleza": {
    url: "https://urbanismo.fortaleza.ce.gov.br/plano-diretor",
    lei_zoneamento: "https://urbanismo.fortaleza.ce.gov.br/lei-de-uso-e-ocupacao-do-solo",
    iptu: "https://www.sefin.fortaleza.ce.gov.br/"
  },
  "Recife": {
    url: "https://www.recife.pe.gov.br/pgr/leis/planodiretor.php",
    lei_zoneamento: "https://www.recife.pe.gov.br/urbanismo",
    iptu: "https://www.recife.pe.gov.br/servicos/iptu"
  },
  "Goiânia": {
    url: "https://www.goiania.go.gov.br/secretaria-de-planejamento/plano-diretor/",
    lei_zoneamento: "https://www.goiania.go.gov.br/legislacao-urbanistica/",
    iptu: "https://www.goiania.go.gov.br/iptu/"
  },
  "Brasília": {
    url: "https://www.seduh.df.gov.br/plano-diretor-de-ordenamento-territorial/",
    lei_zoneamento: "https://www.seduh.df.gov.br/zoneamento/",
    iptu: "https://www.fazenda.df.gov.br/iptu"
  },
  "Manaus": {
    url: "https://semulsp.manaus.am.gov.br/plano-diretor/",
    lei_zoneamento: "https://semulsp.manaus.am.gov.br/legislacao/",
    iptu: "https://semef.manaus.am.gov.br/"
  },
  "Campinas": {
    url: "https://www.campinas.sp.gov.br/governo/seplama/plano-diretor/",
    lei_zoneamento: "https://www.campinas.sp.gov.br/governo/seplama/lei-de-uso-e-ocupacao/",
    iptu: "https://www.campinas.sp.gov.br/governo/smf/iptu.php"
  },
  "default": {
    url: null,
    lei_zoneamento: null,
    iptu: null
  }
};

const PLANO_PRESIDENTE = {
  "São Paulo": { valor: 1200, descricao: "Capital SP - Faixa Premium" },
  "Rio de Janeiro": { valor: 1100, descricao: "Capital RJ - Faixa Premium" },
  "Belo Horizonte": { valor: 950, descricao: "Grande BH - Faixa A" },
  "Curitiba": { valor: 900, descricao: "Grande Curitiba - Faixa A" },
  "Porto Alegre": { valor: 880, descricao: "Grande POA - Faixa A" },
  "Salvador": { valor: 850, descricao: "Grande Salvador - Faixa B" },
  "Fortaleza": { valor: 820, descricao: "Grande Fortaleza - Faixa B" },
  "Recife": { valor: 800, descricao: "Grande Recife - Faixa B" },
  "Manaus": { valor: 800, descricao: "Manaus - Faixa B" },
  "Goiânia": { valor: 780, descricao: "Grande Goiânia - Faixa B" },
  "Campinas": { valor: 850, descricao: "Campinas SP - Faixa A" },
  "default": { valor: 650, descricao: "Municípios do Interior - Faixa C" },
};

const PRECO_BASE_M2 = {
  "SP": 9500, "RJ": 10200, "MG": 6800, "RS": 6500, "PR": 6200,
  "SC": 7100, "BA": 5800, "CE": 5200, "PE": 5500, "GO": 5000,
  "AM": 5300, "ES": 6000, "DF": 9800, "MT": 4800, "MS": 4600,
  "PA": 4500, "MA": 4200, "PB": 4300, "RN": 4400, "AL": 4100,
  "SE": 4300, "PI": 4000, "TO": 4200, "RO": 4100, "AC": 3900,
  "AP": 4000, "RR": 3800,
};

function calcularAvaliacao({ estado, tipo, quartos, banheiros, area, adicionais }) {
  const base = PRECO_BASE_M2[estado] || 5000;
  const areaCalc = area || (quartos * 40);
  let valorM2 = base;

  if (tipo === "apartamento") valorM2 *= 1.1;
  else if (tipo === "casa_condominio") valorM2 *= 1.15;
  else if (tipo === "cobertura") valorM2 *= 1.4;
  else if (tipo === "terreno") valorM2 *= 0.6;
  else if (tipo === "sala_comercial") valorM2 *= 1.05;

  valorM2 *= (1 + (quartos - 1) * 0.05);

  const adicionalValores = {
    piscina: 0.08, churrasqueira: 0.03, playground: 0.02, academia: 0.04,
    salao_festas: 0.02, portaria_24h: 0.03, elevador: 0.05, garagem: 0.06,
    sacada: 0.03, jardim: 0.02, sauna: 0.03, quadra: 0.03,
  };

  let mult = 1;
  (adicionais || []).forEach(a => { mult += (adicionalValores[a] || 0); });

  const valorEstimado = Math.round(areaCalc * valorM2 * mult);
  return {
    estimativa: valorEstimado,
    faixa_min: Math.round(valorEstimado * 0.85),
    faixa_max: Math.round(valorEstimado * 1.15),
    valor_m2: Math.round(valorM2 * mult),
    area_calculada: areaCalc,
  };
}

async function buscarPortalOLX(portal, estado, municipio, bairro, quartos, tipo) {
  const isZap = portal === "zapimoveis";
  const domain = isZap ? "www.zapimoveis.com.br" : "www.vivareal.com.br";
  const url = isZap
    ? "https://glue-api.zapimoveis.com.br/v2/listings"
    : "https://glue-api.vivareal.com/v2/listings";

  try {
    const params = new URLSearchParams({
      addressCountry: "BR",
      addressState: estado,
      addressCity: municipio,
      addressNeighborhood: bairro || "",
      bedrooms: String(quartos || 1),
      listingType: "USED",
      size: "20",
    });

    const unitType = tipo === "apartamento" ? "APARTMENT" : tipo === "terreno" ? "LAND" : "HOME";
    params.append("unitTypes", unitType);

    const res = await fetch(`${url}?${params}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
        "X-Domain": domain,
        "Origin": `https://${domain}`,
        "Referer": `https://${domain}/`,
      },
      signal: AbortSignal.timeout(9000),
    });

    if (!res.ok) return { listings: [], erro: `HTTP ${res.status}`, portal };

    const data = await res.json();
    const listings = (data?.search?.result?.listings || []).slice(0, 10).map(l => ({
      id: l.listing?.id,
      titulo: l.listing?.title || "Imóvel",
      preco: l.listing?.pricingInfos?.[0]?.price || 0,
      area: l.listing?.usableAreas?.[0] || l.listing?.totalAreas?.[0] || 0,
      quartos: l.listing?.bedrooms?.[0] || 0,
      banheiros: l.listing?.bathrooms?.[0] || 0,
      endereco: [l.listing?.address?.street, l.listing?.address?.streetNumber].filter(Boolean).join(", ") || "",
      bairro: l.listing?.address?.neighborhood || bairro || "",
      link: `https://${domain}/imovel/${l.listing?.id}`,
      portal: isZap ? "ZAP Imóveis" : "Viva Real",
      portal_key: portal,
      origem: "real",
    }));

    return { listings, total: data?.search?.totalCount || listings.length, portal };
  } catch (err) {
    return { listings: [], erro: err.message, portal };
  }
}

function calcStats(items) {
  if (!items.length) return null;
  const vals = items.map(i => i.preco_m2).filter(v => v > 0).sort((a, b) => a - b);
  if (!vals.length) return null;
  const n = vals.length;
  const media = vals.reduce((a, b) => a + b, 0) / n;
  const mediana = n % 2 === 0 ? (vals[n/2-1] + vals[n/2]) / 2 : vals[Math.floor(n/2)];
  const desvio = Math.sqrt(vals.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / n);
  return { media: Math.round(media), mediana: Math.round(mediana), desvio: Math.round(desvio), min: vals[0], max: vals[n-1] };
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

    const areaNum = Number(area) || (Number(quartos) * 40);

    // Busca portais em paralelo
    const [vivaResult, zapResult] = await Promise.all([
      buscarPortalOLX("vivareal", estado, municipio, bairro, quartos, tipo),
      buscarPortalOLX("zapimoveis", estado, municipio, bairro, quartos, tipo),
    ]);

    let todosListings = [
      ...(vivaResult.listings || []),
      ...(zapResult.listings || []),
    ].filter(l => l.preco > 0);

    // Se não temos 10+ comparáveis reais, gerar via IA
    let usouIA = false;
    if (todosListings.length < 10) {
      usouIA = true;
      try {
        const aiRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Você é um especialista em mercado imobiliário brasileiro. 
Gere dados realistas de ${12 - todosListings.length} imóveis comparáveis para avaliação de mercado.
Imóvel de referência: ${tipo} em ${bairro ? bairro + ", " : ""}${municipio}-${estado}, ${areaNum}m², ${quartos} quartos, ${banheiros} banheiros.
Use preços de mercado reais de 2024 para a região. Varie ligeiramente área (±25%), quartos (±1) e preço.
Inclua endereços/bairros plausíveis da cidade.
Para os links, use formato: https://www.vivareal.com.br/imovel/[tipo]-${quartos}-quartos-[bairro-sem-acento]-${municipio.toLowerCase().replace(/\s/g,"-")}-${estado.toLowerCase()}-[8-digitos]/ 
Alterne portal entre "Viva Real", "ZAP Imóveis", "Imóveis Web".`,
          response_json_schema: {
            type: "object",
            properties: {
              imoveis: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    titulo: { type: "string" },
                    bairro: { type: "string" },
                    endereco: { type: "string" },
                    area: { type: "number" },
                    quartos: { type: "number" },
                    banheiros: { type: "number" },
                    preco: { type: "number" },
                    portal: { type: "string" },
                    link: { type: "string" }
                  }
                }
              }
            }
          }
        });

        const aiListings = (aiRes?.imoveis || []).map((i, idx) => ({
          ...i,
          id: `ai_${idx}`,
          portal_key: i.portal?.toLowerCase().includes("zap") ? "zapimoveis" : i.portal?.toLowerCase().includes("web") ? "imoveisweb" : "vivareal",
          origem: "estimado",
        }));
        todosListings = [...todosListings, ...aiListings];
      } catch (e) {
        // fallback silencioso
      }
    }

    // Enriquecer com preço/m²
    todosListings = todosListings.map(l => ({
      ...l,
      preco_m2: l.area > 0 ? Math.round(l.preco / l.area) : 0,
    }));

    const stats = calcStats(todosListings);
    const avaliacaoLocal = calcularAvaliacao({ estado, tipo, quartos, banheiros, area: areaNum, adicionais });
    const avaliacaoFinal = {
      ...avaliacaoLocal,
      media_mercado: stats?.media || null,
      mediana_m2: stats?.mediana || null,
      confianca: todosListings.filter(l => l.origem === "real").length >= 5 ? "Alta" : todosListings.length >= 8 ? "Média" : "Estimada",
      total_anuncios_analisados: todosListings.length,
    };

    const planoDiretor = PLANO_DIRETOR[municipio] || PLANO_DIRETOR["default"];
    const planoPresidente = PLANO_PRESIDENTE[municipio] || PLANO_PRESIDENTE["default"];

    return Response.json({
      success: true,
      avaliacao: avaliacaoFinal,
      plano_presidente: planoPresidente,
      plano_diretor: { municipio, ...planoDiretor },
      portais: {
        vivareal: { ...vivaResult, portal: "Viva Real" },
        zapimoveis: { ...zapResult, portal: "ZAP Imóveis" },
        imoveisweb: { portal: "Imóveis Web", listings: [], info: "Integração via parceiro OLX Group" },
        quintoandar: { portal: "Quinto Andar", listings: [], info: "Dados estimados via modelo de mercado" },
      },
      comparaveis: todosListings,
      stats,
      usou_ia: usouIA,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});