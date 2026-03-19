import { ExternalLink, Lock, ShieldCheck } from "lucide-react";

export default function AxonIA() {
  const appUrl = "https://apsis.qi140.ai/auth?redirect=%2Fauth%3Fredirect%3D%252F";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A2B1F]">AXON IA</h1>
        <p className="text-sm text-[#5C7060] mt-1">Assistente de Inteligência Artificial Corporativa</p>
      </div>

      <div className="bg-white rounded-xl border border-[#DDE3DE] p-8 space-y-6">
        <div>
          <p className="text-[#1A2B1F] mb-4">
            AXON IA é uma plataforma de Inteligência Artificial Corporativa projetada para responder questionamentos gerais e auxiliar nas atividades do dia a dia. 
          </p>
          <p className="text-[#1A2B1F]">
            Clique no botão abaixo para acessar a plataforma segura e criptografada.
          </p>
        </div>

        {/* Destaques de Segurança */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-[#F4F6F4] rounded-lg">
            <Lock size={20} className="text-[#1A4731] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-[#1A2B1F]">Criptografado</h3>
              <p className="text-sm text-[#5C7060]">Comunicação protegida com encriptação de ponta a ponta</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-[#F4F6F4] rounded-lg">
            <ShieldCheck size={20} className="text-[#1A4731] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-[#1A2B1F]">Seguro</h3>
              <p className="text-sm text-[#5C7060]">Padrões de segurança corporativa de primeira qualidade</p>
            </div>
          </div>
        </div>

        {/* Botão de Acesso */}
        <a
          href={appUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A4731] text-white rounded-lg hover:bg-[#245E40] transition-colors font-medium"
        >
          <span>Acessar AXON IA</span>
          <ExternalLink size={18} />
        </a>
      </div>
    </div>
  );
}