/**
 * PageHeader — Cabeçalho padrão premium para cada aba do projeto.
 * Exibe título, subtítulo, ações opcionais e indicador de fullscreen.
 */
export default function PageHeader({ title, subtitle, actions, icon: Icon, iconColor = "text-[#1A4731]" }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-[#1A4731]/8 flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "rgba(26,71,49,0.07)" }}>
            <Icon size={18} className={iconColor} />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400 mt-0.5 font-normal">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}