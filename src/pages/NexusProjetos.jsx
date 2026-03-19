export default function NexusProjetos() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[var(--border)] rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Seus Projetos</h2>
        <p className="text-[var(--text-secondary)] mb-6">
          Acompanhe o progresso, status e atualizações dos seus projetos em tempo real.
        </p>
        
        <div className="bg-[var(--surface-2)] rounded-lg p-6 text-center">
          <p className="text-[var(--text-secondary)]">Módulo em desenvolvimento</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">Visualização simplificada do status de projetos e entregas</p>
        </div>
      </div>
    </div>
  );
}