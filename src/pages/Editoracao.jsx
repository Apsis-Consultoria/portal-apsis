import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Editoracao() {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Preview Area */}
      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-gray-900">Preview do Laudo</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download size={14} />
              Reenviar
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 gap-2">
              <Download size={14} />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center mb-4 opacity-50">
            <FileText size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium mb-2">Laudo não iniciado</p>
          <p className="text-xs text-gray-500 text-center max-w-xs">
            Use o chat ao lado para iniciar o processo de montagem do laudo.
          </p>
        </div>
      </div>
    </div>
  );
}