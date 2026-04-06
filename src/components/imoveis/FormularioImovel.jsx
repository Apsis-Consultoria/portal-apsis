import { useState, useEffect } from "react";
import { Search, MapPin, Home, BedDouble, Bath, Maximize, Plus } from "lucide-react";

const TIPOS_IMOVEL = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "casa_condominio", label: "Casa em Condomínio" },
  { value: "cobertura", label: "Cobertura" },
  { value: "terreno", label: "Terreno" },
  { value: "sala_comercial", label: "Sala Comercial" },
];

const ADICIONAIS = [
  { value: "piscina", label: "Piscina", emoji: "🏊" },
  { value: "churrasqueira", label: "Churrasqueira", emoji: "🔥" },
  { value: "playground", label: "Playground", emoji: "🎠" },
  { value: "academia", label: "Academia", emoji: "💪" },
  { value: "salao_festas", label: "Salão de Festas", emoji: "🎉" },
  { value: "portaria_24h", label: "Portaria 24h", emoji: "🔒" },
  { value: "elevador", label: "Elevador", emoji: "🛗" },
  { value: "garagem", label: "Garagem", emoji: "🚗" },
  { value: "sacada", label: "Sacada/Varanda", emoji: "🌅" },
  { value: "jardim", label: "Jardim", emoji: "🌿" },
  { value: "sauna", label: "Sauna", emoji: "♨️" },
  { value: "quadra", label: "Quadra Esportiva", emoji: "⚽" },
];

export default function FormularioImovel({ onAvaliar, loading }) {
  const [estados, setEstados] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [bairros, setBairros] = useState([]);
  const [loadingEstados, setLoadingEstados] = useState(true);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  const [form, setForm] = useState({
    estado: "",
    municipio: "",
    bairro: "",
    tipo: "apartamento",
    quartos: 2,
    banheiros: 1,
    area: "",
    adicionais: [],
  });

  // Busca estados do IBGE
  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then(r => r.json())
      .then(data => {
        setEstados(data.map(e => ({ sigla: e.sigla, nome: e.nome })));
        setLoadingEstados(false);
      })
      .catch(() => setLoadingEstados(false));
  }, []);

  // Busca municípios quando estado muda
  useEffect(() => {
    if (!form.estado) { setMunicipios([]); return; }
    setLoadingMunicipios(true);
    setBairros([]);
    setForm(f => ({ ...f, municipio: "", bairro: "" }));
    const estadoSigla = form.estado;
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSigla}/municipios?orderBy=nome`)
      .then(r => r.json())
      .then(data => {
        setMunicipios(data.map(m => ({ id: m.id, nome: m.nome })));
        setLoadingMunicipios(false);
      })
      .catch(() => setLoadingMunicipios(false));
  }, [form.estado]);

  // Busca bairros quando município muda (via IBGE subdistritos)
  useEffect(() => {
    if (!form.municipio) { setBairros([]); return; }
    const mun = municipios.find(m => m.nome === form.municipio);
    if (!mun) return;
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${mun.id}/subdistritos`)
      .then(r => r.json())
      .then(data => {
        if (data && data.length > 0) {
          setBairros(data.map(s => s.nome));
        } else {
          setBairros([]);
        }
      })
      .catch(() => setBairros([]));
  }, [form.municipio]);

  const toggleAdicional = (val) => {
    setForm(f => ({
      ...f,
      adicionais: f.adicionais.includes(val)
        ? f.adicionais.filter(a => a !== val)
        : [...f.adicionais, val],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAvaliar(form);
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4731]/30 focus:border-[#1A4731]";
  const selectClass = inputClass + " bg-white";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <Home size={16} className="text-[#1A4731]" />
        <h2 className="font-semibold text-gray-800 text-sm">Dados do Imóvel</h2>
      </div>

      {/* Tipo */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Tipo de Imóvel *</label>
        <select className={selectClass} value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
          {TIPOS_IMOVEL.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Localização */}
      <div className="flex items-center gap-2 pt-1 pb-1">
        <MapPin size={14} className="text-[#F47920]" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Localização</span>
      </div>

      {/* Estado */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Estado *</label>
        <select className={selectClass} value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} required>
          <option value="">{loadingEstados ? "Carregando..." : "Selecione o estado"}</option>
          {estados.map(e => <option key={e.sigla} value={e.sigla}>{e.nome} ({e.sigla})</option>)}
        </select>
      </div>

      {/* Município */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Município *</label>
        <select className={selectClass} value={form.municipio} onChange={e => setForm(f => ({ ...f, municipio: e.target.value }))} required disabled={!form.estado}>
          <option value="">{loadingMunicipios ? "Carregando municípios..." : form.estado ? "Selecione o município" : "Selecione o estado primeiro"}</option>
          {municipios.map(m => <option key={m.id} value={m.nome}>{m.nome}</option>)}
        </select>
      </div>

      {/* Bairro */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Bairro</label>
        {bairros.length > 0 ? (
          <select className={selectClass} value={form.bairro} onChange={e => setForm(f => ({ ...f, bairro: e.target.value }))}>
            <option value="">Selecione o bairro</option>
            {bairros.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        ) : (
          <input className={inputClass} placeholder="Digite o bairro" value={form.bairro} onChange={e => setForm(f => ({ ...f, bairro: e.target.value }))} />
        )}
      </div>

      {/* Características */}
      <div className="flex items-center gap-2 pt-1 pb-1">
        <BedDouble size={14} className="text-[#F47920]" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Características</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Quartos</label>
          <select className={selectClass} value={form.quartos} onChange={e => setForm(f => ({ ...f, quartos: Number(e.target.value) }))}>
            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}{n === 6 ? "+" : ""}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Banheiros</label>
          <select className={selectClass} value={form.banheiros} onChange={e => setForm(f => ({ ...f, banheiros: Number(e.target.value) }))}>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}{n === 5 ? "+" : ""}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Área (m²)</label>
          <input className={inputClass} type="number" placeholder="Ex: 80" value={form.area} onChange={e => setForm(f => ({ ...f, area: Number(e.target.value) }))} min={10} />
        </div>
      </div>

      {/* Adicionais */}
      <div className="flex items-center gap-2 pt-1 pb-1">
        <Plus size={14} className="text-[#F47920]" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Adicionais / Diferenciais</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ADICIONAIS.map(a => (
          <button
            key={a.value}
            type="button"
            onClick={() => toggleAdicional(a.value)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
              form.adicionais.includes(a.value)
                ? "bg-[#1A4731] text-white border-[#1A4731]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#1A4731] hover:text-[#1A4731]"
            }`}
          >
            <span>{a.emoji}</span>
            <span>{a.label}</span>
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading || !form.estado || !form.municipio}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50 mt-2"
        style={{ background: "#1A4731" }}
      >
        <Search size={15} />
        {loading ? "Avaliando..." : "Avaliar Imóvel"}
      </button>
    </form>
  );
}