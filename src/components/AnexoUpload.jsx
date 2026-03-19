import { useState, useRef } from 'react';
import { Upload, Eye, Lock, X } from 'lucide-react';

const tiposDisponiveis = [
  { valor: 'documento', label: 'Documento' },
  { valor: 'planilha', label: 'Planilha' },
  { valor: 'pdf', label: 'PDF' },
  { valor: 'imagem', label: 'Imagem' },
  { valor: 'outro', label: 'Outro' },
];

export default function AnexoUpload({
  onAnexoAdicionado,
  currentUserType = 'apsis',
  uploading = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [visibilidade, setVisibilidade] = useState('compartilhado');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;

    selectedFiles.forEach((file) => {
      const tipo = inferirTipo(file.type);
      onAnexoAdicionado({
        nome: file.name,
        tipo,
        visibilidade,
        file,
      });
    });

    setSelectedFiles([]);
    setVisibilidade('compartilhado');
    setIsOpen(false);
    fileInputRef.current.value = '';
  };

  const inferirTipo = (mimeType) => {
    if (mimeType.includes('image')) return 'imagem';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('sheet') || mimeType.includes('spreadsheet')) return 'planilha';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'documento';
    return 'outro';
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors text-[var(--text-secondary)]"
        title="Adicionar anexo"
      >
        <Upload size={18} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Adicionar Anexo</h3>
          <button onClick={() => setIsOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X size={20} />
          </button>
        </div>

        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Selecionar Arquivo</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--border)] rounded-lg p-6 text-center cursor-pointer hover:border-[var(--apsis-orange)] transition-colors"
          >
            <Upload size={32} className="mx-auto mb-2 text-[var(--text-secondary)]" />
            <p className="text-sm font-medium text-[var(--text-primary)]">Clique para selecionar</p>
            <p className="text-xs text-[var(--text-secondary)]">ou arraste o arquivo aqui</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="*"
            />
          </div>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Arquivos Selecionados</label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-2 bg-[var(--surface-2)] rounded text-sm">
                  <span className="truncate text-[var(--text-primary)]">{file.name}</span>
                  <button
                    onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tipo de Arquivo */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Tipo de Arquivo</label>
          <select
            value={selectedFiles[0] ? inferirTipo(selectedFiles[0].type) : 'documento'}
            onChange={(e) => setVisibilidade(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--apsis-orange)]/50"
          >
            {tiposDisponiveis.map((tipo) => (
              <option key={tipo.valor} value={tipo.valor}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>

        {/* Visibilidade */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Visibilidade</label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 px-3 py-2 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--surface-2)] transition-colors">
              <input
                type="radio"
                name="visibilidade"
                value="compartilhado"
                checked={visibilidade === 'compartilhado'}
                onChange={(e) => setVisibilidade(e.target.value)}
                className="cursor-pointer"
              />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Compartilhado com cliente</p>
                <p className="text-xs text-[var(--text-secondary)]">Cliente poderá visualizar e baixar</p>
              </div>
            </label>

            <label className="flex items-center gap-3 px-3 py-2 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--surface-2)] transition-colors">
              <input
                type="radio"
                name="visibilidade"
                value="interno"
                checked={visibilidade === 'interno'}
                onChange={(e) => setVisibilidade(e.target.value)}
                className="cursor-pointer"
              />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Interno APSIS</p>
                <p className="text-xs text-[var(--text-secondary)]">Apenas equipe interna pode visualizar</p>
              </div>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => {
              setIsOpen(false);
              setSelectedFiles([]);
              setVisibilidade('compartilhado');
            }}
            className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
            className="flex-1 px-4 py-2 bg-[var(--apsis-orange)] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}