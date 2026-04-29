import { useState, useRef, useCallback } from "react";
import { useMsal } from "@azure/msal-react";
import { uploadToSharePoint } from "@/services/sharePointUpload";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, CheckCircle2, AlertCircle, FolderOpen, ExternalLink, Loader2 } from "lucide-react";

const fmt = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function FileItem({ file, progress, done, error }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
        <FileText size={16} className="text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
        <p className="text-xs text-slate-400">{fmt(file.size)}</p>
        {progress !== undefined && !done && !error && (
          <div className="mt-1.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1A4731] rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
      {done && <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />}
      {error && <AlertCircle size={18} className="text-red-500 flex-shrink-0" />}
      {progress !== undefined && !done && !error && (
        <span className="text-xs text-slate-500 w-9 text-right flex-shrink-0">{progress}%</span>
      )}
    </div>
  );
}

export default function SecureShare() {
  const { instance, accounts } = useMsal();
  const [apos, setApos] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [done, setDone] = useState({});
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const inputRef = useRef();

  const addFiles = useCallback((incoming) => {
    const arr = Array.from(incoming);
    setFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name));
      return [...prev, ...arr.filter(f => !existingNames.has(f.name))];
    });
  }, []);

  const removeFile = (name) => setFiles(prev => prev.filter(f => f.name !== name));

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!apos.trim() || !empresa.trim() || files.length === 0) return;
    setUploading(true);
    setGlobalError(null);
    setProgress({});
    setDone({});
    setErrors({});
    setResult(null);

    try {
      const res = await uploadToSharePoint({
        msalInstance: instance,
        accounts,
        apos: apos.trim(),
        empresa: empresa.trim(),
        files,
        onFileProgress: (name, pct) => {
          setProgress(prev => ({ ...prev, [name]: pct }));
          if (pct === 100) setDone(prev => ({ ...prev, [name]: true }));
        },
      });
      setResult(res);
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setApos("");
    setEmpresa("");
    setFiles([]);
    setProgress({});
    setDone({});
    setErrors({});
    setResult(null);
    setGlobalError(null);
  };

  const canUpload = apos.trim() && empresa.trim() && files.length > 0 && !uploading;

  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Arquivos enviados com sucesso</h2>
          <p className="text-sm text-slate-500 mb-6">
            {files.length} arquivo{files.length !== 1 ? "s" : ""} enviado{files.length !== 1 ? "s" : ""} para a pasta:
          </p>
          <div className="flex items-center gap-2 justify-center bg-slate-50 rounded-xl px-4 py-3 mb-6 border border-slate-200">
            <FolderOpen size={18} className="text-[#1A4731]" />
            <span className="text-sm font-semibold text-slate-800">{result.folderName}</span>
          </div>
          <div className="space-y-2 mb-8 text-left">
            {files.map(f => (
              <FileItem key={f.name} file={f} done progress={100} />
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => window.open(result.folderUrl, '_blank')}
              className="gap-2"
            >
              <ExternalLink size={14} /> Abrir no SharePoint
            </Button>
            <Button onClick={handleReset} className="bg-[#1A4731] hover:bg-[#1A4731]/90 text-white gap-2">
              <Upload size={14} /> Novo Envio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A4731]">Secure Share</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Envie arquivos ao cliente via SharePoint — acesso seguro e rastreável.
        </p>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              AP / OS
            </label>
            <input
              type="text"
              value={apos}
              onChange={e => setApos(e.target.value)}
              placeholder="Ex: AP-2025-042"
              disabled={uploading}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4731] focus:ring-2 focus:ring-[#1A4731]/10 bg-slate-50 disabled:opacity-60"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              Nome da Empresa
            </label>
            <input
              type="text"
              value={empresa}
              onChange={e => setEmpresa(e.target.value)}
              placeholder="Ex: Empresa XYZ Ltda"
              disabled={uploading}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4731] focus:ring-2 focus:ring-[#1A4731]/10 bg-slate-50 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Preview do nome da pasta */}
        {(apos.trim() || empresa.trim()) && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
            <FolderOpen size={13} className="text-[#1A4731]" />
            <span>Pasta: </span>
            <span className="font-semibold text-slate-700">
              {[apos.trim(), empresa.trim()].filter(Boolean).join(" - ")}
            </span>
          </div>
        )}

        {/* Dropzone */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
            Arquivos
          </label>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer ${
              dragging
                ? "border-[#1A4731] bg-[#1A4731]/5"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            } ${uploading ? "pointer-events-none opacity-60" : ""}`}
          >
            <Upload size={24} className="mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-medium text-slate-600">
              Arraste arquivos aqui ou <span className="text-[#1A4731] underline decoration-dotted">clique para selecionar</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Qualquer tipo de arquivo, sem limite de tamanho</p>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={e => addFiles(e.target.files)}
            />
          </div>
        </div>

        {/* Lista de arquivos */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map(f => (
              <div key={f.name} className="relative group">
                <FileItem
                  file={f}
                  progress={progress[f.name]}
                  done={done[f.name]}
                  error={errors[f.name]}
                />
                {!uploading && !done[f.name] && (
                  <button
                    onClick={() => removeFile(f.name)}
                    className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-slate-200 hover:bg-red-100 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Erro global */}
        {globalError && (
          <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{globalError}</span>
          </div>
        )}

        {/* Botão de envio */}
        <Button
          onClick={handleUpload}
          disabled={!canUpload}
          className="w-full bg-[#1A4731] hover:bg-[#1A4731]/90 text-white h-11 gap-2 font-semibold shadow-sm disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Enviando para o SharePoint...
            </>
          ) : (
            <>
              <Upload size={16} />
              Enviar para o SharePoint
            </>
          )}
        </Button>
      </div>
    </div>
  );
}