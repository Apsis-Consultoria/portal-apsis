import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarDays, RotateCcw } from "lucide-react";
import { calcularDiasUteis } from "./feriadosUtils";

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

const STORAGE_KEY = "rateio_dias_uteis_overrides";

function loadOverrides() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveOverrides(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getDiasUteisParaMes(ano, mes, estado) {
  const overrides = loadOverrides();
  const key = `${ano}-${String(mes).padStart(2,"0")}-${estado}`;
  if (overrides[key] !== undefined) return overrides[key];
  return calcularDiasUteis(ano, mes, estado);
}

export default function FeriadosModal({ open, onClose }) {
  const [anoSel, setAnoSel] = useState(new Date().getFullYear());
  const [overrides, setOverrides] = useState(loadOverrides);

  const anos = useMemo(() => Array.from({ length: 2050 - 2024 + 1 }, (_, i) => 2024 + i), []);

  // Recalcula valores base quando muda o ano
  const tabela = useMemo(() => {
    return MESES.map((nome, idx) => {
      const mes = idx + 1;
      const keySP = `${anoSel}-${String(mes).padStart(2,"0")}-SP`;
      const keyRJ = `${anoSel}-${String(mes).padStart(2,"0")}-RJ`;
      const spBase = calcularDiasUteis(anoSel, mes, "SP");
      const rjBase = calcularDiasUteis(anoSel, mes, "RJ");
      const sp = overrides[keySP] !== undefined ? overrides[keySP] : spBase;
      const rj = overrides[keyRJ] !== undefined ? overrides[keyRJ] : rjBase;
      return { mes, nome, sp, rj, spBase, rjBase, keySP, keyRJ,
        spEditado: overrides[keySP] !== undefined,
        rjEditado: overrides[keyRJ] !== undefined,
      };
    });
  }, [anoSel, overrides]);

  const totalSP = tabela.reduce((acc, r) => acc + r.sp, 0);
  const totalRJ = tabela.reduce((acc, r) => acc + r.rj, 0);

  const handleChange = (key, value) => {
    const num = parseInt(value);
    const newOverrides = { ...overrides };
    if (isNaN(num) || num < 0) {
      delete newOverrides[key];
    } else {
      newOverrides[key] = num;
    }
    setOverrides(newOverrides);
    saveOverrides(newOverrides);
  };

  const handleReset = (key, baseValue) => {
    const newOverrides = { ...overrides };
    delete newOverrides[key];
    setOverrides(newOverrides);
    saveOverrides(newOverrides);
  };

  const handleResetAll = () => {
    // Remove apenas os overrides do ano selecionado
    const newOverrides = { ...overrides };
    MESES.forEach((_, idx) => {
      const mes = idx + 1;
      const keySP = `${anoSel}-${String(mes).padStart(2,"0")}-SP`;
      const keyRJ = `${anoSel}-${String(mes).padStart(2,"0")}-RJ`;
      delete newOverrides[keySP];
      delete newOverrides[keyRJ];
    });
    setOverrides(newOverrides);
    saveOverrides(newOverrides);
  };

  const temEdicoes = tabela.some(r => r.spEditado || r.rjEditado);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays size={17} className="text-[#1A4731]" />
            Dias Úteis por Mês — SP e RJ
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-medium">Ano de referência:</span>
            <Select value={String(anoSel)} onValueChange={v => setAnoSel(Number(v))}>
              <SelectTrigger className="h-8 w-28 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-60">
                {anos.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {temEdicoes && (
            <Button variant="ghost" size="sm" onClick={handleResetAll} className="text-xs text-gray-400 gap-1 h-7">
              <RotateCcw size={12} />
              Restaurar padrão
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-400 mb-3">
          Valores calculados automaticamente. Clique nos números para editar caso a caso.
        </p>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600">Mês</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-blue-600">Dias Úteis SP</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-green-600">Dias Úteis RJ</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-400">Diferença</th>
              </tr>
            </thead>
            <tbody>
              {tabela.map((row) => {
                const diferente = row.sp !== row.rj;
                return (
                  <tr key={row.mes} className={`border-b border-gray-100 ${diferente ? "bg-amber-50" : "hover:bg-gray-50"}`}>
                    <td className="px-4 py-2 font-medium text-gray-800">{row.nome}</td>

                    {/* SP editável */}
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={31}
                          value={row.sp}
                          onChange={e => handleChange(row.keySP, e.target.value)}
                          className={`w-14 text-center font-bold rounded-lg px-2 py-0.5 text-sm border focus:outline-none focus:ring-1
                            ${row.spEditado
                              ? "bg-blue-50 border-blue-400 text-blue-900 focus:ring-blue-400"
                              : "bg-blue-100 border-blue-100 text-blue-800 focus:ring-blue-300"}`}
                        />
                        {row.spEditado && (
                          <button onClick={() => handleReset(row.keySP)} title={`Restaurar (${row.spBase})`} className="text-gray-300 hover:text-gray-500">
                            <RotateCcw size={11} />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* RJ editável */}
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={31}
                          value={row.rj}
                          onChange={e => handleChange(row.keyRJ, e.target.value)}
                          className={`w-14 text-center font-bold rounded-lg px-2 py-0.5 text-sm border focus:outline-none focus:ring-1
                            ${row.rjEditado
                              ? "bg-green-50 border-green-400 text-green-900 focus:ring-green-400"
                              : "bg-green-100 border-green-100 text-green-800 focus:ring-green-300"}`}
                        />
                        {row.rjEditado && (
                          <button onClick={() => handleReset(row.keyRJ)} title={`Restaurar (${row.rjBase})`} className="text-gray-300 hover:text-gray-500">
                            <RotateCcw size={11} />
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-2 text-center">
                      {diferente ? (
                        <span className="text-amber-600 font-semibold text-xs">
                          {row.sp > row.rj ? `SP +${row.sp - row.rj}` : `RJ +${row.rj - row.sp}`}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td className="px-4 py-3 text-xs font-semibold text-gray-700">Total do Ano</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block bg-blue-200 text-blue-900 font-bold rounded-lg px-3 py-0.5 text-sm">{totalSP}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block bg-green-200 text-green-900 font-bold rounded-lg px-3 py-0.5 text-sm">{totalRJ}</span>
                </td>
                <td className="px-4 py-3 text-center text-xs text-gray-500">
                  {totalSP !== totalRJ ? (totalSP > totalRJ ? `SP +${totalSP - totalRJ}` : `RJ +${totalRJ - totalSP}`) : "—"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="text-xs text-amber-600 mt-1">
          ⚠ Linhas em amarelo indicam meses com quantidade diferente. Valores editados ficam com borda colorida.
        </p>
      </DialogContent>
    </Dialog>
  );
}