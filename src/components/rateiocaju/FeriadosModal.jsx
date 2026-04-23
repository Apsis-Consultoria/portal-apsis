import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays } from "lucide-react";

// ─── Lógica de feriados (replicada/consolidada aqui) ───────────────────────

const FERIADOS_NACIONAIS_FIXOS = [
  { mmdd: "01-01", nome: "Confraternização Universal" },
  { mmdd: "04-21", nome: "Tiradentes" },
  { mmdd: "05-01", nome: "Dia do Trabalho" },
  { mmdd: "09-07", nome: "Independência do Brasil" },
  { mmdd: "10-12", nome: "Nossa Senhora Aparecida" },
  { mmdd: "11-02", nome: "Finados" },
  { mmdd: "11-15", nome: "Proclamação da República" },
  { mmdd: "12-25", nome: "Natal" },
];

const FERIADOS_FIXOS_SP_ONLY = [
  { mmdd: "01-25", nome: "Aniversário de São Paulo" },
  { mmdd: "07-09", nome: "Revolução Constitucionalista" },
];

const FERIADOS_FIXOS_RJ_ONLY = [
  { mmdd: "01-20", nome: "São Sebastião (padroeiro do RJ)" },
  { mmdd: "04-23", nome: "São Jorge" },
  { mmdd: "11-20", nome: "Consciência Negra" },
];

function calcularPascoa(ano) {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia);
}

function toMMDD(date) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${m}-${d}`;
}

function toDateStr(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}`;
}

function getFeriadosMoveis(ano) {
  const pascoa = calcularPascoa(ano);
  const carnavalSeg = new Date(pascoa); carnavalSeg.setDate(pascoa.getDate() - 48);
  const carnavalTer = new Date(pascoa); carnavalTer.setDate(pascoa.getDate() - 47);
  const sextaSanta = new Date(pascoa); sextaSanta.setDate(pascoa.getDate() - 2);
  const corpusChristi = new Date(pascoa); corpusChristi.setDate(pascoa.getDate() + 60);

  return [
    { date: carnavalSeg, nome: "Carnaval (segunda-feira)" },
    { date: carnavalTer, nome: "Carnaval (terça-feira)" },
    { date: sextaSanta, nome: "Sexta-Feira Santa" },
    { date: pascoa, nome: "Páscoa" },
    { date: corpusChristi, nome: "Corpus Christi" },
  ];
}

function getFeriadosDoAno(ano) {
  const resultado = [];

  // Nacionais fixos
  for (const f of FERIADOS_NACIONAIS_FIXOS) {
    const [mm, dd] = f.mmdd.split("-").map(Number);
    const date = new Date(ano, mm - 1, dd);
    resultado.push({ date, mmdd: f.mmdd, nome: f.nome, tipo: "Nacional" });
  }

  // SP exclusivo
  for (const f of FERIADOS_FIXOS_SP_ONLY) {
    const [mm, dd] = f.mmdd.split("-").map(Number);
    const date = new Date(ano, mm - 1, dd);
    resultado.push({ date, mmdd: f.mmdd, nome: f.nome, tipo: "SP" });
  }

  // RJ exclusivo
  for (const f of FERIADOS_FIXOS_RJ_ONLY) {
    const [mm, dd] = f.mmdd.split("-").map(Number);
    const date = new Date(ano, mm - 1, dd);
    resultado.push({ date, mmdd: f.mmdd, nome: f.nome, tipo: "RJ" });
  }

  // Móveis (nacionais)
  for (const f of getFeriadosMoveis(ano)) {
    resultado.push({ date: f.date, mmdd: toMMDD(f.date), nome: f.nome, tipo: "Nacional (móvel)" });
  }

  // Ordenar por data
  resultado.sort((a, b) => a.date - b.date);
  return resultado;
}

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const diaSemanaLabel = (date) => ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][date.getDay()];

const TIPO_CONFIG = {
  "Nacional":         { label: "Nacional",      cls: "bg-gray-100 text-gray-700" },
  "Nacional (móvel)": { label: "Nacional (móvel)", cls: "bg-purple-100 text-purple-700" },
  "SP":               { label: "Exclusivo SP",  cls: "bg-blue-100 text-blue-700" },
  "RJ":               { label: "Exclusivo RJ",  cls: "bg-green-100 text-green-700" },
};

export default function FeriadosModal({ open, onClose }) {
  const [anoSel, setAnoSel] = useState(new Date().getFullYear());
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const anos = useMemo(() => Array.from({ length: 2050 - 2024 + 1 }, (_, i) => 2024 + i), []);

  const feriados = useMemo(() => getFeriadosDoAno(anoSel), [anoSel]);

  const filtrados = useMemo(() => {
    if (filtroTipo === "todos") return feriados;
    if (filtroTipo === "sp") return feriados.filter(f => f.tipo === "SP" || f.tipo === "Nacional" || f.tipo === "Nacional (móvel)");
    if (filtroTipo === "rj") return feriados.filter(f => f.tipo === "RJ" || f.tipo === "Nacional" || f.tipo === "Nacional (móvel)");
    if (filtroTipo === "exclusivo-sp") return feriados.filter(f => f.tipo === "SP");
    if (filtroTipo === "exclusivo-rj") return feriados.filter(f => f.tipo === "RJ");
    return feriados;
  }, [feriados, filtroTipo]);

  const diasUteisSP = useMemo(() => {
    const feriadosSPSet = new Set(
      feriados.filter(f => f.tipo !== "RJ").map(f => f.mmdd)
    );
    let count = 0;
    const diasNoMes = new Date(anoSel, 12, 0).getDate(); // total do ano
    for (let m = 1; m <= 12; m++) {
      const dias = new Date(anoSel, m, 0).getDate();
      for (let d = 1; d <= dias; d++) {
        const date = new Date(anoSel, m - 1, d);
        const dow = date.getDay();
        if (dow === 0 || dow === 6) continue;
        const mmdd = toMMDD(date);
        if (!feriadosSPSet.has(mmdd)) count++;
      }
    }
    return count;
  }, [feriados, anoSel]);

  const diasUteisRJ = useMemo(() => {
    const feriadosRJSet = new Set(
      feriados.filter(f => f.tipo !== "SP").map(f => f.mmdd)
    );
    let count = 0;
    for (let m = 1; m <= 12; m++) {
      const dias = new Date(anoSel, m, 0).getDate();
      for (let d = 1; d <= dias; d++) {
        const date = new Date(anoSel, m - 1, d);
        const dow = date.getDay();
        if (dow === 0 || dow === 6) continue;
        const mmdd = toMMDD(date);
        if (!feriadosRJSet.has(mmdd)) count++;
      }
    }
    return count;
  }, [feriados, anoSel]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays size={18} className="text-[#1A4731]" />
            Calendário de Feriados — SP e RJ
          </DialogTitle>
        </DialogHeader>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Ano:</span>
            <Select value={String(anoSel)} onValueChange={v => setAnoSel(Number(v))}>
              <SelectTrigger className="h-8 w-28 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-60">
                {anos.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Exibir:</span>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="h-8 w-48 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os feriados</SelectItem>
                <SelectItem value="sp">Feriados válidos SP</SelectItem>
                <SelectItem value="rj">Feriados válidos RJ</SelectItem>
                <SelectItem value="exclusivo-sp">Exclusivos SP</SelectItem>
                <SelectItem value="exclusivo-rj">Exclusivos RJ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Resumo dias úteis */}
          <div className="ml-auto flex gap-3">
            <div className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium">
              SP: {diasUteisSP} dias úteis no ano
            </div>
            <div className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium">
              RJ: {diasUteisRJ} dias úteis no ano
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(TIPO_CONFIG).map(([key, { label, cls }]) => (
            <span key={key} className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
          ))}
        </div>

        {/* Tabela */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 w-24">Data</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600">Feriado</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 w-28">Dia da Semana</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 w-40">Tipo</th>
                <th className="text-center px-3 py-2.5 text-xs font-semibold text-blue-600 w-14">SP</th>
                <th className="text-center px-3 py-2.5 text-xs font-semibold text-green-600 w-14">RJ</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((f, i) => {
                const aplicaSP = f.tipo !== "RJ";
                const aplicaRJ = f.tipo !== "SP";
                const mes = MESES[f.date.getMonth()];
                const dia = String(f.date.getDate()).padStart(2, "0");
                const dow = diaSemanaLabel(f.date);
                const isWeekend = f.date.getDay() === 0 || f.date.getDay() === 6;
                const { label, cls } = TIPO_CONFIG[f.tipo] || {};
                return (
                  <tr key={i} className={`border-b border-gray-100 ${isWeekend ? "bg-orange-50/40" : "hover:bg-gray-50"}`}>
                    <td className="px-4 py-2.5 font-mono text-sm text-gray-800">{dia}/{mes}</td>
                    <td className="px-4 py-2.5 text-gray-800">
                      {f.nome}
                      {isWeekend && <span className="ml-2 text-xs text-orange-500">(fim de semana)</span>}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{dow}</td>
                    <td className="px-4 py-2.5">
                      <Badge className={`text-xs ${cls}`}>{label}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {aplicaSP ? <span className="text-blue-500 font-bold">✓</span> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {aplicaRJ ? <span className="text-green-500 font-bold">✓</span> : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtrados.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-6">Nenhum feriado para o filtro selecionado.</p>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-2 text-center">
          Feriados calculados automaticamente de 2024 a 2050. Feriados em fins de semana são exibidos mas não impactam dias úteis.
        </p>
      </DialogContent>
    </Dialog>
  );
}