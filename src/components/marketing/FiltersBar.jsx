export default function FiltersBar({ ano, setAno, trimestre, setTrimestre, area, setArea, showTrimestre = true, showArea = true }) {
  const anos = [2024, 2025, 2026];
  const trimestres = [
    { label: "Todos", value: "" },
    { label: "T1", value: 1 },
    { label: "T2", value: 2 },
    { label: "T3", value: 3 },
    { label: "T4", value: 4 },
  ];
  const areas = ["Todas", "Contábil", "Consultoria", "Tributária", "Societária", "M&A", "Outros"];

  const sel = "text-xs border border-[#DDE3DE] rounded-lg px-3 py-1.5 text-[#5C7060] focus:outline-none focus:ring-1 focus:ring-[#F47920] bg-white";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select className={sel} value={ano} onChange={e => setAno(Number(e.target.value))}>
        {anos.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
      {showTrimestre && (
        <select className={sel} value={trimestre} onChange={e => setTrimestre(e.target.value === "" ? "" : Number(e.target.value))}>
          {trimestres.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      )}
      {showArea && (
        <select className={sel} value={area} onChange={e => setArea(e.target.value)}>
          {areas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      )}
    </div>
  );
}