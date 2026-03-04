export default function DashboardQualidade() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#1A4731] mb-2">Dashboard Qualidade</h2>
        <p className="text-[#5C7060] mb-6">Clique no botão abaixo para acessar o Dashboard de Qualidade em uma nova aba.</p>
        <a
          href="https://qualidade.base44.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#F47920] hover:bg-[#D4640D] text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-md"
        >
          Abrir Dashboard Qualidade
        </a>
      </div>
    </div>
  );
}