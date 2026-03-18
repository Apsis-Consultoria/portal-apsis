import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, Check, Trash2, AlertCircle } from "lucide-react";

const TIPO_ICON = { "Reunião": "🤝", "Email": "✉️", "WhatsApp": "💬", "Ligação": "📞", "Nota interna": "📌", "Alerta": "⚠️" };
const TIPO_COLOR = {
  "Reunião": "bg-blue-100 text-blue-700",
  "Email": "bg-purple-100 text-purple-700",
  "WhatsApp": "bg-green-100 text-green-700",
  "Ligação": "bg-orange-100 text-orange-700",
  "Nota interna": "bg-gray-100 text-gray-600",
  "Alerta": "bg-red-100 text-red-700",
};

export default function ProjetoComunicacao({ osId, projeto }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    tipo: "Nota interna", titulo: "", descricao: "", autor: "",
    data: new Date().toISOString().slice(0, 10), participantes: "",
    visivel_cliente: false, acao_requerida: false, acao_descricao: "", acao_responsavel: "", acao_prazo: ""
  });

  useEffect(() => {
    base44.entities.ComunicacaoProjeto.filter({ os_id: osId }).then(c => {
      setItems(c.sort((a, b) => b.data?.localeCompare(a.data)));
      setLoading(false);
    });
  }, [osId]);

  const salvar = async () => {
    if (!form.titulo || !form.autor) return;
    const novo = await base44.entities.ComunicacaoProjeto.create({ ...form, os_id: osId });
    setItems(prev => [novo, ...prev]);
    setShowForm(false);
    setForm({ tipo: "Nota interna", titulo: "", descricao: "", autor: "", data: new Date().toISOString().slice(0, 10), participantes: "", visivel_cliente: false, acao_requerida: false, acao_descricao: "", acao_responsavel: "", acao_prazo: "" });
  };

  const excluir = async (id) => {
    await base44.entities.ComunicacaoProjeto.delete(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  const acoesAbertas = items.filter(i => i.acao_requerida && i.acao_prazo && new Date(i.acao_prazo + "T00:00:00") >= new Date());

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Ações pendentes */}
      {acoesAbertas.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
          <p className="text-sm font-semibold text-amber-800 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Ações pendentes</p>
          {acoesAbertas.map(a => (
            <div key={a.id} className="text-xs text-amber-700">
              • {a.acao_descricao} — <strong>{a.acao_responsavel}</strong> até {new Date(a.acao_prazo + "T00:00:00").toLocaleDateString("pt-BR")}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)} size="sm" className="gap-2"><Plus className="w-4 h-4" /> Novo Registro</Button>
      </div>

      {showForm && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader><CardTitle className="text-sm">Novo Registro de Comunicação</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><label className="text-xs text-slate-500 mb-1 block">Tipo *</label>
                <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.keys(TIPO_ICON).map(t => <SelectItem key={t} value={t}>{TIPO_ICON[t]} {t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-xs text-slate-500 mb-1 block">Autor *</label><Input value={form.autor} onChange={e => setForm(f => ({ ...f, autor: e.target.value }))} /></div>
              <div><label className="text-xs text-slate-500 mb-1 block">Data</label><Input type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} /></div>
              <div className="md:col-span-3"><label className="text-xs text-slate-500 mb-1 block">Título *</label><Input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Assunto / título da comunicação" /></div>
              <div className="md:col-span-3"><label className="text-xs text-slate-500 mb-1 block">Descrição</label><Input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Detalhes, resumo, pontos discutidos..." /></div>
              <div><label className="text-xs text-slate-500 mb-1 block">Participantes</label><Input value={form.participantes} onChange={e => setForm(f => ({ ...f, participantes: e.target.value }))} /></div>
              <div className="flex items-end gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.visivel_cliente} onChange={e => setForm(f => ({ ...f, visivel_cliente: e.target.checked }))} className="w-4 h-4" />
                  Visível ao cliente
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.acao_requerida} onChange={e => setForm(f => ({ ...f, acao_requerida: e.target.checked }))} className="w-4 h-4" />
                  Ação requerida
                </label>
              </div>
            </div>
            {form.acao_requerida && (
              <div className="grid grid-cols-3 gap-3 bg-amber-50 p-3 rounded-lg">
                <div><label className="text-xs text-slate-500 mb-1 block">Ação a tomar</label><Input value={form.acao_descricao} onChange={e => setForm(f => ({ ...f, acao_descricao: e.target.value }))} /></div>
                <div><label className="text-xs text-slate-500 mb-1 block">Responsável</label><Input value={form.acao_responsavel} onChange={e => setForm(f => ({ ...f, acao_responsavel: e.target.value }))} /></div>
                <div><label className="text-xs text-slate-500 mb-1 block">Prazo</label><Input type="date" value={form.acao_prazo} onChange={e => setForm(f => ({ ...f, acao_prazo: e.target.value }))} /></div>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={salvar} className="gap-1"><Check className="w-4 h-4" /> Salvar</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <div className="space-y-3">
        {items.length === 0 && (
          <Card><CardContent className="py-10 text-center text-slate-400 text-sm">Nenhum registro de comunicação.</CardContent></Card>
        )}
        {items.map(item => (
          <Card key={item.id} className={`border-l-4 ${item.tipo === "Alerta" ? "border-l-red-400" : item.acao_requerida ? "border-l-amber-400" : "border-l-slate-200"}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-base">{TIPO_ICON[item.tipo]}</span>
                    <span className="font-semibold text-slate-800 text-sm">{item.titulo}</span>
                    <Badge className={`text-xs ${TIPO_COLOR[item.tipo] || ""}`}>{item.tipo}</Badge>
                    {item.visivel_cliente && <Badge className="text-xs bg-purple-100 text-purple-700">Para cliente</Badge>}
                    {item.acao_requerida && <Badge className="text-xs bg-amber-100 text-amber-700">Ação necessária</Badge>}
                  </div>
                  {item.descricao && <p className="text-sm text-slate-600 mb-2">{item.descricao}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    <span>{item.data ? new Date(item.data + "T00:00:00").toLocaleDateString("pt-BR") : "—"}</span>
                    <span>Por: {item.autor}</span>
                    {item.participantes && <span>Com: {item.participantes}</span>}
                  </div>
                  {item.acao_requerida && item.acao_descricao && (
                    <div className="mt-2 bg-amber-50 rounded p-2 text-xs text-amber-800">
                      ⚡ <strong>{item.acao_descricao}</strong> — {item.acao_responsavel} até {item.acao_prazo ? new Date(item.acao_prazo + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
                    </div>
                  )}
                </div>
                <button onClick={() => excluir(item.id)} className="text-slate-300 hover:text-red-400 shrink-0"><Trash2 className="w-4 h-4" /></button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}