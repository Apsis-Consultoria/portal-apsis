import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { FileText, Download } from "lucide-react";

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v || 0);
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export default function Relatorios() {
  const [propostas, setPropostas] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [oss, setOss] = useState([]);
  const [ano, setAno] = useState(new Date().getFullYear());

  useEffect(() => {
    Promise.all([
      base44.entities.Proposta.list(),
      base44.entities.Parcela.list(),
      base44.entities.OrdemServico.list(),
    ]).then(([p, pa, os]) => { setPropostas(p); setParcelas(pa); setOss(os); });
  }, []);

  // Receita por mês
  const receitaMes = MESES.map((mes, i) => {
    const m = i + 1;
    const rec = parcelas.filter(p => {
      const d = p.data_recebimento ? new Date(p.data_recebimento) : null;
      return d && d.getFullYear() === ano && d.getMonth() + 1 === m && p.status === "Recebida";
    }).reduce((s, p) => s + (p.valor || 0), 0);
    return { mes, receita: rec };
  });

  // Receita por cliente
  const recCliente = {};
  parcelas.filter(p => p.status === "Recebida").forEach(p => {
    recCliente[p.cliente_nome || "—"] = (recCliente[p.cliente_nome || "—"] || 0) + (p.valor || 0);
  });
  const recClienteData = Object.entries(recCliente).sort((a,b) => b[1]-a[1]).slice(0,8).map(([name, value]) => ({ name, value }));

  // Receita por colaborador (OS ativa)
  const recColab = {};
  oss.forEach(os => {
    const resp = os.responsavel_tecnico || "—";
    recColab[resp] = (recColab[resp] || 0) + (os.valor_proporcional || 0);
  });
  const recColabData = Object.entries(recColab).sort((a,b) => b[1]-a[1]).map(([name, value]) => ({ name, value }));

  // Taxa de conversão
  const total = propostas.length;
  const ganhas = propostas.filter(p => p.status === "Ganha").length;
  const perdidas = propostas.filter(p => p.status === "Perdida").length;
  const txConversao = total > 0 ? ((ganhas / total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-5">
      {/* Filtro */}
      <div className="flex items-center gap-3">
        <select className="border border-[#E8ECF0] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
          value={ano} onChange={e => setAno(Number(e.target.value))}>
          {[2023,2024,2025,2026].map(a => <option key={a}>{a}</option>)}
        </select>
        <p className="text-xs text-[#6B7A99]">Exibindo dados de {ano}</p>
      </div>

      {/* Métricas resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Propostas", value: total },
          { label: "Propostas Ganhas", value: ganhas },
          { label: "Propostas Perdidas", value: perdidas },
          { label: "Taxa de Conversão", value: `${txConversao}%` },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-2xl border border-[#E8ECF0] p-5">
            <p className="text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-2">{m.label}</p>
            <p className="text-2xl font-bold text-[#0F1B35]">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Receita por mês */}
      <div className="bg-white rounded-2xl border border-[#E8ECF0] p-6">
        <h2 className="font-semibold text-[#0F1B35] mb-1">Evolução da Receita Mensal</h2>
        <p className="text-xs text-[#6B7A99] mb-5">Valores recebidos em {ano}</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={receitaMes}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F2F5" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#6B7A99" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#6B7A99" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 10, border: "1px solid #E8ECF0", fontSize: 12 }} />
            <Line type="monotone" dataKey="receita" name="Receita" stroke="#C9A84C" strokeWidth={2.5} dot={{ r: 3, fill: "#C9A84C" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Receita por cliente e colaborador */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#E8ECF0] p-6">
          <h2 className="font-semibold text-[#0F1B35] mb-1">Top Clientes</h2>
          <p className="text-xs text-[#6B7A99] mb-5">Receita total por cliente</p>
          {recClienteData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={recClienteData} layout="vertical" barSize={12}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0F2F5" />
                <XAxis type="number" tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#6B7A99" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#6B7A99" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="value" name="Receita" fill="#0F1B35" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-[#6B7A99] text-center py-10">Sem dados</p>}
        </div>

        <div className="bg-white rounded-2xl border border-[#E8ECF0] p-6">
          <h2 className="font-semibold text-[#0F1B35] mb-1">Receita por Colaborador</h2>
          <p className="text-xs text-[#6B7A99] mb-5">Valor total em projetos ativos</p>
          {recColabData.length > 0 ? (
            <div className="space-y-3">
              {recColabData.slice(0,6).map((item, i) => {
                const max = Math.max(...recColabData.map(d => d.value));
                const pct = max > 0 ? (item.value / max) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#0F1B35] font-medium">{item.name}</span>
                      <span className="text-[#6B7A99]">{fmt(item.value)}</span>
                    </div>
                    <div className="w-full bg-[#F7F8FA] rounded-full h-2">
                      <div className="h-2 bg-[#C9A84C] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-[#6B7A99] text-center py-10">Sem dados</p>}
        </div>
      </div>
    </div>
  );
}