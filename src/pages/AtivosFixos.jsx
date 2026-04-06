import { Briefcase } from "lucide-react";

export default function AtivosFixos() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#1A4731]/10 flex items-center justify-center mb-4">
        <Briefcase className="text-[#1A4731]" size={32} />
      </div>
      <h2 className="text-2xl font-bold text-[#1A4731] mb-2">Ativos Fixos</h2>
      <p className="text-gray-500">Módulo em desenvolvimento. Em breve novas funcionalidades.</p>
    </div>
  );
}