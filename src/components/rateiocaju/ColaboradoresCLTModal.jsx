import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Pencil, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ColaboradoresCLTModal({ open, onClose }) {
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [novoForm, setNovoForm] = useState(false);
  const [novoData, setNovoData] = useState({ nome: "", unidade: "SP", valor_vr_diario: "" });

  useEffect(() => {
    if (open) fetchColaboradores();
  }, [open]);

  const fetchColaboradores = async () => {
    setLoading(true);
    const data = await base44.entities.ColaboradorCLT.list();
    setColaboradores(data);
    setLoading(false);
  };

  const handleSaveNovo = async () => {
    if (!novoData.nome || !novoData.unidade || !novoData.valor_vr_diario) return;
    await base44.entities.ColaboradorCLT.create({
      ...novoData,
      valor_vr_diario: parseFloat(novoData.valor_vr_diario),
    });
    setNovoForm(false);
    setNovoData({ nome: "", unidade: "SP", valor_vr_diario: "" });
    fetchColaboradores();
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setEditData({ nome: c.nome, unidade: c.unidade, valor_vr_diario: c.valor_vr_diario });
  };

  const handleSaveEdit = async (id) => {
    await base44.entities.ColaboradorCLT.update(id, {
      ...editData,
      valor_vr_diario: parseFloat(editData.valor_vr_diario),
    });
    setEditingId(null);
    fetchColaboradores();
  };

  const handleDelete = async (id) => {
    await base44.entities.ColaboradorCLT.delete(id);
    fetchColaboradores();
  };

  const colSP = colaboradores.filter(c => c.unidade === "SP");
  const colRJ = colaboradores.filter(c => c.unidade === "RJ");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Colaboradores CLT — Vale Refeição</DialogTitle>
        </DialogHeader>

        <div className="flex justify-end mb-3">
          <Button size="sm" onClick={() => setNovoForm(true)} className="bg-[#1A4731] hover:bg-[#1A4731]/90 gap-2">
            <Plus size={14} /> Novo Colaborador
          </Button>
        </div>

        {novoForm && (
          <div className="flex gap-2 mb-4 p-3 bg-gray-50 rounded-lg items-end">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Nome</label>
              <Input value={novoData.nome} onChange={e => setNovoData({ ...novoData, nome: e.target.value })} placeholder="Nome completo" className="h-8 text-sm" />
            </div>
            <div className="w-24">
              <label className="text-xs text-gray-500 mb-1 block">Unidade</label>
              <Select value={novoData.unidade} onValueChange={v => setNovoData({ ...novoData, unidade: v })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SP">SP</SelectItem>
                  <SelectItem value="RJ">RJ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <label className="text-xs text-gray-500 mb-1 block">VR/dia (R$)</label>
              <Input type="number" value={novoData.valor_vr_diario} onChange={e => setNovoData({ ...novoData, valor_vr_diario: e.target.value })} placeholder="0,00" className="h-8 text-sm" />
            </div>
            <Button size="sm" onClick={handleSaveNovo} className="bg-green-600 hover:bg-green-700 h-8"><Check size={14} /></Button>
            <Button size="sm" variant="outline" onClick={() => setNovoForm(false)} className="h-8"><X size={14} /></Button>
          </div>
        )}

        {["SP", "RJ"].map(unidade => (
          <div key={unidade} className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Badge className={unidade === "SP" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}>{unidade}</Badge>
              {(unidade === "SP" ? colSP : colRJ).length} colaboradores
            </h4>
            <div className="space-y-2">
              {(unidade === "SP" ? colSP : colRJ).map(c => (
                <div key={c.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                  {editingId === c.id ? (
                    <>
                      <Input value={editData.nome} onChange={e => setEditData({ ...editData, nome: e.target.value })} className="h-7 text-sm flex-1" />
                      <Input type="number" value={editData.valor_vr_diario} onChange={e => setEditData({ ...editData, valor_vr_diario: e.target.value })} className="h-7 text-sm w-28" />
                      <Button size="sm" onClick={() => handleSaveEdit(c.id)} className="h-7 bg-green-600 hover:bg-green-700"><Check size={12} /></Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="h-7"><X size={12} /></Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-gray-800">{c.nome}</span>
                      <span className="text-sm text-gray-500 w-28 text-right">R$ {Number(c.valor_vr_diario).toFixed(2)}/dia</span>
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(c)} className="h-7 w-7 p-0"><Pencil size={12} /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id)} className="h-7 w-7 p-0 text-red-500 hover:text-red-700"><Trash2 size={12} /></Button>
                    </>
                  )}
                </div>
              ))}
              {(unidade === "SP" ? colSP : colRJ).length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">Nenhum colaborador cadastrado</p>
              )}
            </div>
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
}