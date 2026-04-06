export default function BVResumoCards({ consultores }) {
  const totalConsultores = consultores.length;
  const totalProjetos = new Set(consultores.flatMap(c => c.projetos.map(p => p.os))).size;
  const totalBrutas = consultores.reduce((s, c) => s + c.horasBrutas, 0);
  const totalAjustadas = consultores.reduce((s, c) => s + c.horasAjustadas, 0);

  const cards = [
    { label: "Consultores", value: totalConsultores, color: "#1F3864" },
    { label: "Projetos Ativos", value: totalProjetos, color: "#1F3864" },
    { label: "Horas Brutas", value: totalBrutas.toFixed(1) + "h", color: "#1F3864" },
    { label: "Horas Ajustadas", value: totalAjustadas.toFixed(1) + "h", color: "#1F3864" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map(c => (
        <div key={c.label} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">{c.label}</p>
          <p className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}