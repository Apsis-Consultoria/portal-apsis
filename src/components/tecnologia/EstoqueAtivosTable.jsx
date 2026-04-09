import { Edit2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function EstoqueAtivosTable({ ativos, isLoading, refetch }) {
  const handleDelete = async (id) => {
    if (!confirm("Deseja excluir este ativo?")) return;
    await supabase.from("estoque_ativos").delete().eq("id", id);
    refetch();
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "em_estoque":
        return "bg-blue-100 text-blue-700";
      case "em_uso":
        return "bg-green-100 text-green-700";
      case "em_manutencao":
        return "bg-orange-100 text-orange-700";
      case "baixado":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const statusLabel = {
    em_estoque: "Em Estoque",
    em_uso: "Em Uso",
    em_manutencao: "Em Manutenção",
    baixado: "Baixado"
  };

  return (
    <div className="bg-white rounded-xl border border-[#DDE3DE] p-6">
      <h2 className="font-semibold text-[#1A2B1F] mb-4">
        {ativos.length} equipamento{ativos.length !== 1 ? 's' : ''}
      </h2>
      {isLoading ? (
        <div className="text-center py-8 text-[#5C7060]">Carregando...</div>
      ) : ativos.length === 0 ? (
        <div className="text-center py-8 text-[#5C7060]">Nenhum ativo encontrado</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#DDE3DE]">
                <th className="text-left px-4 py-3 font-semibold text-[#1A2B1F]">Tipo</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1A2B1F]">Marca/Modelo</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1A2B1F]">Nº Série</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1A2B1F]">Patrimônio</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1A2B1F]">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1A2B1F]">Data Aquisição</th>
                <th className="text-center px-4 py-3 font-semibold text-[#1A2B1F]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {ativos.map((ativo) => (
                <tr key={ativo.id} className="border-b border-[#DDE3DE] hover:bg-[#F4F6F4] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1A2B1F] capitalize">{ativo.tipo}</td>
                  <td className="px-4 py-3 text-[#5C7060]">
                    {ativo.marca} {ativo.modelo}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#1A2B1F]">{ativo.numero_serie}</td>
                  <td className="px-4 py-3 text-[#5C7060]">{ativo.numero_patrimonio || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(ativo.status)}`}>
                      {statusLabel[ativo.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#5C7060]">
                    {ativo.data_aquisicao
                      ? new Date(ativo.data_aquisicao).toLocaleDateString("pt-BR")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 flex gap-2 justify-center">
                    <button className="p-1 hover:bg-[#DDE3DE] rounded text-[#5C7060]">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(ativo.id)} className="p-1 hover:bg-red-100 rounded text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}