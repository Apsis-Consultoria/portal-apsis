import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays } from "lucide-react";
import { calcularDiasUteis } from "./feriadosUtils";

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

export default function FeriadosModal({ open, onClose }) {
  const [anoSel, setAnoSel] = useState(new Date().getFullYear());

  const anos = useMemo(() => Array.from({ length: 2050 - 2024 + 1 }, (_, i) => 2024 + i), []);

  // Gera a tabela: para cada mês, dias úteis SP e RJ
  const tabela = useMemo(() => {
    return MESES.map((nome, idx) => {
      const mes = idx + 1;
      const sp = calcularDiasUteis(anoSel, mes, "SP");
      const rj = calcularDiasUteis(anoSel, mes, "RJ");
      return { mes, nome, sp, rj, diferente: sp !== rj };
    });
  }, [anoSel]);

  const totalSP = useMemo(() => tabela.reduce((acc, r) => acc + r.sp, 0), [tabela]);
  const totalRJ = useMemo(() => tabela.reduce((acc, r) => acc + r.rj, 0), [tabela]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays size={17} className="text-[#1A4731]" />
            Dias Úteis por Mês — SP e RJ
          </DialogTitle>
        </DialogHeader>

        {/* Seletor de ano */}
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xs text-gray-500 font-medium">Ano de referência:</span>
          <Select value={String(anoSel)} onValueChange={v => setAnoSel(Number(v))}>
            <SelectTrigger className="h-8 w-28 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-60">
              {anos.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Nota explicativa */}
        <p className="text-xs text-gray-400 mb-3">
          Dias úteis calculados automaticamente (seg–sex), descontando feriados nacionais e estaduais. Meses com diferença entre SP e RJ são destacados.
        </p>

        {/* Tabela */}
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
              {tabela.map((row) => (
                <tr
                  key={row.mes}
                  className={`border-b border-gray-100 ${row.diferente ? "bg-amber-50" : "hover:bg-gray-50"}`}
                >
                  <td className="px-4 py-2.5 font-medium text-gray-800">{row.nome}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="inline-block bg-blue-100 text-blue-800 font-bold rounded-lg px-3 py-0.5 text-sm">
                      {row.sp}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="inline-block bg-green-100 text-green-800 font-bold rounded-lg px-3 py-0.5 text-sm">
                      {row.rj}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {row.diferente ? (
                      <span className="text-amber-600 font-semibold text-xs">
                        {row.sp > row.rj ? `SP +${row.sp - row.rj}` : `RJ +${row.rj - row.sp}`}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td className="px-4 py-3 text-xs font-semibold text-gray-700">Total do Ano</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block bg-blue-200 text-blue-900 font-bold rounded-lg px-3 py-0.5 text-sm">
                    {totalSP}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block bg-green-200 text-green-900 font-bold rounded-lg px-3 py-0.5 text-sm">
                    {totalRJ}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-xs text-gray-500">
                  {totalSP !== totalRJ
                    ? (totalSP > totalRJ ? `SP +${totalSP - totalRJ}` : `RJ +${totalRJ - totalSP}`)
                    : "—"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="text-xs text-amber-600 mt-1">
          ⚠ Linhas em amarelo indicam meses com quantidade diferente de dias úteis entre SP e RJ.
        </p>
      </DialogContent>
    </Dialog>
  );
}