import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { processarDados, exportarXlsx } from "../components/bv/bvUtils";
import BVResumoCards from "../components/bv/BVResumoCards";
import BVFiltros from "../components/bv/BVFiltros";
import BVVisaoIndividual from "../components/bv/BVVisaoIndividual";
import BVVisaoGerentes from "../components/bv/BVVisaoGerentes";
import BVVisaoGeral from "../components/bv/BVVisaoGeral";

const ABAS = ["Visão Individual", "Reunião Gerentes", "Visão Geral"];

export default function BusinessValuation() {
  const [uploadInfo, setUploadInfo] = useState(null);
  const [consultores, setConsultores] = useState([]);
  const [allStatuses, setAllStatuses] = useState([]);
  const [allCargos, setAllCargos] = useState([]);
  const [filtros, setFiltros] = useState({ nome: "", cargos: [], statuses: [], soPendencias: false });
  const [excluirTerceiro, setExcluirTerceiro] = useState(false);
  const [comentarios, setComentarios] = useState({});
  const [abaAtiva, setAbaAtiva] = useState("Visão Individual");
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
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const { consultores: cons, allStatuses: statuses, allCargos: cargos } = processarDados(rows);
      setConsultores(cons);
      setAllStatuses(statuses);
      setAllCargos(cargos);
      setUploadInfo({ nome: file.name, data: new Date().toLocaleString("pt-BR"), qtd: cons.length });
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  // Filtros aplicados
  const consultoresFiltrados = consultores.filter(c => {
    if (excluirTerceiro && c.tipoContratacao !== "CLT") return false;
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
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-[#F47920]" />
          <div>
            <h1 className="text-xl font-bold text-[#1A4731]">Controle de Alocação de Horas</h1>
            <p className="text-sm text-gray-500">Painel de gestão de horas por consultor · Sistema SAN</p>
          </div>
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ background: "#1A4731" }}
          >
            <Upload size={15} /> Importar Planilha SAN (.xlsx)
          </button>
          {consultores.length > 0 && (
            <button
              onClick={() => exportarXlsx(consultoresFiltrados, comentarios)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-[#1A4731] text-[#1A4731] bg-white hover:bg-green-50 transition-colors"
            >
              <Download size={15} /> Exportar (.xlsx)
            </button>
          )}
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
        </div>
      </div>

      {/* Abas */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-0">
          {ABAS.map(aba => (
            <button
              key={aba}
              onClick={() => setAbaAtiva(aba)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                abaAtiva === aba
                  ? "border-[#F47920] text-[#1A4731] font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {aba}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6">
        <BVResumoCards consultores={consultoresFiltrados} />
        <BVFiltros
          filtros={filtros}
          setFiltros={setFiltros}
          allStatuses={allStatuses}
          allCargos={allCargos}
          excluirTerceiro={excluirTerceiro}
          setExcluirTerceiro={setExcluirTerceiro}
        />

        {abaAtiva === "Visão Individual" && (
          <BVVisaoIndividual
            consultores={consultoresFiltrados}
            comentarios={comentarios}
            setComentario={setComentario}
          />
        )}
        {abaAtiva === "Reunião Gerentes" && (
          <BVVisaoGerentes consultores={consultoresFiltrados} comentarios={comentarios} setComentario={setComentario} />
        )}
        {abaAtiva === "Visão Geral" && (
          <BVVisaoGeral consultores={consultoresFiltrados} />
        )}
      </div>
    </div>
  );
}