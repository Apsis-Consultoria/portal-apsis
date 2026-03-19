import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import EstoqueAtivosTable from "@/components/tecnologia/EstoqueAtivosTable";
import NovoAtivoModal from "@/components/tecnologia/NovoAtivoModal";
import UploadAtivoPlanilha from "@/components/tecnologia/UploadAtivoPlanilha.jsx";

export default function EstoqueAtivos() {
  const [aba, setAba] = useState("ativos");
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["ativos-ti"],
    queryFn: async () => {
      const ativos = await base44.entities.AtivoTI.list("-created_date", 200);
      return ativos || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const ativos = data || [];

  const ativos_filtrados = ativos.filter((a) => {
    const matchBusca = !busca || a.numero_serie?.toLowerCase().includes(busca.toLowerCase()) || 
                       a.marca?.toLowerCase().includes(busca.toLowerCase()) ||
                       a.modelo?.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = !filtroTipo || a.tipo === filtroTipo;
    const matchStatus = !filtroStatus || a.status === filtroStatus;
    return matchBusca && matchTipo && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A2B1F]">Estoque de Ativos</h1>
        <p className="text-sm text-[#5C7060] mt-1">Controle de equipamentos e movimentações</p>
      </div>

      {/* Abas */}
      <div className="border-b border-[#DDE3DE] flex gap-0">
        <button
          onClick={() => setAba("ativos")}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            aba === "ativos"
              ? "border-[#F47920] text-[#1A2B1F]"
              : "border-transparent text-[#5C7060] hover:text-[#1A2B1F]"
          }`}
        >
          Cadastro de Ativos
        </button>
        <button
          onClick={() => setAba("upload")}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            aba === "upload"
              ? "border-[#F47920] text-[#1A2B1F]"
              : "border-transparent text-[#5C7060] hover:text-[#1A2B1F]"
          }`}
        >
          Upload de Carga
        </button>
      </div>

      {/* Conteúdo das abas */}
      <div className="space-y-6">
        {aba === "ativos" && (
          <>
            <div className="flex items-center justify-end">
              <button
                onClick={() => setMostrarModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1A4731] text-white rounded-lg hover:bg-[#245E40] transition-colors"
              >
                <Plus size={18} />
                Novo Ativo
              </button>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-xl border border-[#DDE3DE] p-4 space-y-3">
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-64 flex items-center gap-2 bg-[#F4F6F4] px-3 py-2 rounded-lg">
                  <Search size={16} className="text-[#5C7060]" />
                  <input
                    type="text"
                    placeholder="Buscar por série, marca ou modelo..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                </div>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="px-3 py-2 border border-[#DDE3DE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
                >
                  <option value="">Todos os tipos</option>
                  <option value="notebook">Notebook</option>
                  <option value="desktop">Desktop</option>
                  <option value="monitor">Monitor</option>
                  <option value="teclado">Teclado</option>
                  <option value="mouse">Mouse</option>
                  <option value="headset">Headset</option>
                  <option value="outro">Outro</option>
                </select>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="px-3 py-2 border border-[#DDE3DE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
                >
                  <option value="">Todos os status</option>
                  <option value="em_estoque">Em Estoque</option>
                  <option value="em_uso">Em Uso</option>
                  <option value="em_manutencao">Em Manutenção</option>
                  <option value="baixado">Baixado</option>
                </select>
              </div>
            </div>

            {/* Tabela */}
            <EstoqueAtivosTable ativos={ativos_filtrados} isLoading={isLoading} refetch={refetch} />
          </>
        )}
        {aba === "upload" && <UploadAtivoPlanilha onSuccess={() => { setAba("ativos"); refetch(); }} />}
      </div>

      {/* Modal */}
      {mostrarModal && (
        <NovoAtivoModal onClose={() => setMostrarModal(false)} onSuccess={refetch} />
      )}
    </div>
  );
}