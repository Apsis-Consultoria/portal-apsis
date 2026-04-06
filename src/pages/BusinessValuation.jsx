import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { processarDados, exportarXlsx, CARGO_ORDER } from "../components/bv/bvUtils";
import BVResumoCards from "../components/bv/BVResumoCards";
import BVFiltros from "../components/bv/BVFiltros";
import BVConsultorRow from "../components/bv/BVConsultorRow";

const TABLE_HEADERS = ["Consultor", "Cargo", "Projetos", "H. Brutas", "H. Ajustadas", "Pendências", "Status Carga"];
const PROJ_HEADERS = ["Código AP", "Cliente", "Tipo Serviço", "Status SAN", "H. Alocadas", "H. Ajustadas", "Data Minuta", "Comentário"];

export default function BusinessValuation() {
  const [uploadInfo, setUploadInfo] = useState(null);
  const [consultoresBrutos, setConsultoresBrutos] = useState([]);
  const [allStatuses, setAllStatuses] = useState([]);
  const [excluirTerceiro, setExcluirTerceiro] = useState(false);
  const [filtros, setFiltros] = useState({ nome: "", cargos: [], statuses: [], soPendencias: false });
  const [comentarios, setComentarios] = useState({});
  const fileRef = useRef();

  const setComentario = useCallback((os, val) => {
    setComentarios(prev => ({ ...prev, [os]: val }));
  }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "array", cellDates: false });
      // Tentar encontrar aba "BaseBruta" ou usar a primeira
      const sheetName = wb.SheetNames.find(n => n.toLowerCase().includes("base")) || wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      const { consultores, allStatuses } = processarDados(rows, excluirTerceiro);
      setConsultoresBrutos(consultores);
      setAllStatuses(allStatuses);
      setUploadInfo({ nome: file.name, data: new Date().toLocaleString("pt-BR"), qtd: consultores.length });
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  // Re-processar quando excluirTerceiro muda — não temos os rows originais, então guardamos
  // (simplificado: a re-exclusão de terceiros requer novo upload — avisar usuário)

  const consultoresFiltrados = consultoresBrutos.filter(c => {
    if (filtros.nome && !c.nome.toLowerCase().includes(filtros.nome.toLowerCase())) return false;
    if (filtros.cargos.length > 0 && !filtros.cargos.some(cargo => c.cargo.toLowerCase().includes(cargo.toLowerCase()))) return false;
    if (filtros.statuses.length > 0 && !c.projetos.some(p => filtros.statuses.includes(p.status))) return false;
    if (filtros.soPendencias && c.pendencias === 0) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#1F3864" }}>Controle de Alocação de Horas</h1>
          <p className="text-sm text-gray-500">Painel de gestão de horas por consultor · Sistema SAN</p>
        </div>
        <div className="flex items-center gap-3">
          {uploadInfo && (
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded flex items-center gap-2">
              <FileSpreadsheet size={14} className="text-green-600" />
              <span>{uploadInfo.nome}</span>
              <span>·</span>
              <span>{uploadInfo.qtd} consultores</span>
              <span>·</span>
              <span>{uploadInfo.data}</span>
            </div>
          )}
          <button
            onClick={() => fileRef.current.click()}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium text-white"
            style={{ background: "#1F3864" }}
          >
            <Upload size={15} /> Importar Relatório SAN (.xlsx)
          </button>
          {consultoresBrutos.length > 0 && (
            <button
              onClick={() => exportarXlsx(consultoresFiltrados, comentarios)}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              <Download size={15} /> Exportar (.xlsx)
            </button>
          )}
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
        </div>
      </div>

      <div className="px-6 py-6">
        {consultoresBrutos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <FileSpreadsheet size={48} className="text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-500">Nenhum dado carregado</p>
            <p className="text-sm text-gray-400 mt-1">Importe o relatório de alocação exportado do SAN para começar.</p>
            <button
              onClick={() => fileRef.current.click()}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded text-sm font-medium text-white"
              style={{ background: "#1F3864" }}
            >
              <Upload size={15} /> Importar Relatório SAN (.xlsx)
            </button>
          </div>
        ) : (
          <>
            <BVResumoCards consultores={consultoresFiltrados} />

            <BVFiltros
              filtros={filtros}
              setFiltros={setFiltros}
              allStatuses={allStatuses}
              excluirTerceiro={excluirTerceiro}
              setExcluirTerceiro={setExcluirTerceiro}
            />

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ background: "#1F3864" }}>
                    {TABLE_HEADERS.map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-white uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {consultoresFiltrados.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">Nenhum consultor encontrado com os filtros aplicados.</td></tr>
                  ) : (
                    consultoresFiltrados.map((c, i) => (
                      <BVConsultorRow
                        key={c.nome}
                        consultor={c}
                        index={i}
                        comentarios={comentarios}
                        setComentario={setComentario}
                      />
                    ))
                  )}
                </tbody>
              </table>

              {/* Subtabela header (visível apenas quando há expandidos) */}
            </div>

            <p className="text-xs text-gray-400 mt-3">
              * As horas ajustadas são calculadas com base no % de consumo estimado por etapa do projeto. Projetos Cancelados e Pausados são excluídos automaticamente.
            </p>
          </>
        )}
      </div>
    </div>
  );
}