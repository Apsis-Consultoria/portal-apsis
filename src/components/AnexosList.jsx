import { FileText, Download, Eye, Lock, File, Image, Sheet, Loader2 } from 'lucide-react';

const typeIcons = {
  documento: FileText,
  planilha: Sheet,
  pdf: FileText,
  imagem: Image,
  outro: File,
};

const typeColors = {
  documento: 'bg-blue-100 text-blue-700',
  planilha: 'bg-green-100 text-green-700',
  pdf: 'bg-red-100 text-red-700',
  imagem: 'bg-purple-100 text-purple-700',
  outro: 'bg-gray-100 text-gray-700',
};

export default function AnexosList({
  anexos = [],
  currentUserType = 'cliente',
  onToggleVisibility = null,
  onDownload = null,
  downloading = {},
}) {
  if (!anexos || anexos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {anexos.map((anexo, idx) => {
        const Icon = typeIcons[anexo.tipo] || File;
        const isVisible = anexo.visibilidade === 'compartilhado';
        const isInternal = anexo.visibilidade === 'interno';

        // Cliente não vê anexos internos
        if (currentUserType === 'cliente' && isInternal) {
          return null;
        }

        return (
          <div
            key={idx}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${
              isInternal
                ? 'bg-amber-50 border-amber-200'
                : 'bg-white border-[var(--border)] hover:border-[var(--apsis-orange)]/50'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Ícone do tipo */}
              <div className={`p-2 rounded flex-shrink-0 ${typeColors[anexo.tipo]}`}>
                <Icon size={16} />
              </div>

              {/* Informações */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{anexo.nome}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 font-medium bg-gray-100 text-gray-700">
                    {anexo.tipo}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <span>{anexo.enviado_por}</span>
                  <span>•</span>
                  <span>
                    {new Date(anexo.enviado_em).toLocaleString('pt-BR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Status de visibilidade */}
                <div className="flex items-center gap-2 mt-1.5">
                  {isVisible && (
                    <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded">
                      <Eye size={12} />
                      Compartilhado
                    </div>
                  )}
                  {isInternal && (
                    <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      <Lock size={12} />
                      Interno APSIS
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
              {/* Botão toggle visibilidade (apenas APSIS) */}
              {currentUserType === 'apsis' && onToggleVisibility && (
                <button
                  onClick={() => onToggleVisibility(idx)}
                  className="p-1.5 hover:bg-[var(--surface-2)] rounded transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  title={isInternal ? 'Compartilhar com cliente' : 'Ocultar do cliente'}
                >
                  {isInternal ? <Lock size={16} /> : <Eye size={16} />}
                </button>
              )}

              {/* Botão download */}
              {onDownload && (
                <button
                  onClick={() => onDownload(anexo)}
                  disabled={downloading[idx]}
                  className="p-1.5 hover:bg-[var(--surface-2)] rounded transition-colors text-[var(--apsis-orange)] disabled:opacity-50"
                  title="Baixar arquivo"
                >
                  {downloading[idx] ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}