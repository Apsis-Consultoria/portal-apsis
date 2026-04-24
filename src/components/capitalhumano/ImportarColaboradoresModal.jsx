import { useState } from 'react';
import { Upload, X, Loader2, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import * as XLSX from 'xlsx';

export default function ImportarColaboradoresModal({ open, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResultado(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Selecione um arquivo');
      return;
    }

    setLoading(true);
    try {
      // Ler o Excel
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const colaboradores = XLSX.utils.sheet_to_json(worksheet);

      // Chamar backend function
      const response = await base44.functions.invoke('importarColaboradoresToSupabase', {
        colaboradores
      });

      setResultado(response.data);
      onSuccess();
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        onClose();
        setFile(null);
        setResultado(null);
      }, 2000);
    } catch (error) {
      console.error('Erro:', error);
      setResultado({ error: error.message || 'Erro ao importar' });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Importar Colaboradores
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-[var(--surface-2)] rounded-lg transition-colors">
            <X size={18} className="text-[var(--text-secondary)]" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {resultado ? (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              resultado.error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {!resultado.error && <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" />}
              <div>
                <p className="font-medium text-sm">
                  {resultado.error ? 'Erro' : 'Sucesso'}
                </p>
                <p className="text-xs mt-1">
                  {resultado.error || resultado.mensagem}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center">
                <Upload size={32} className="text-[var(--text-secondary)] opacity-50 mx-auto mb-3" />
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  Clique para selecionar um arquivo Excel ou arraste aqui
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="w-full"
                />
                {file && (
                  <p className="text-xs text-emerald-600 mt-2 font-medium">
                    ✓ {file.name}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImport}
                  disabled={!file || loading}
                  className="flex-1 px-4 py-2 bg-[#1A4731] text-white rounded-lg text-sm font-medium hover:bg-[#245E40] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? 'Importando...' : 'Importar'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}