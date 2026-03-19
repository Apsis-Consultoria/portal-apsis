import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DADOS_STATUS = [
  { name: 'Concluído', value: 8, fill: '#22C55E' },
  { name: 'Em andamento', value: 12, fill: '#F47920' },
  { name: 'Em atraso', value: 2, fill: '#EF4444' },
  { name: 'Planejado', value: 5, fill: '#94A3B8' }
];

const DADOS_EVOLUCAO = [
  { mes: 'Jan', projetos: 8, horas_alocadas: 640, horas_planejadas: 600 },
  { mes: 'Fev', projetos: 10, horas_alocadas: 720, horas_planejadas: 650 },
  { mes: 'Mar', projetos: 11, horas_alocadas: 750, horas_planejadas: 700 },
  { mes: 'Abr', projetos: 12, horas_alocadas: 800, horas_planejadas: 750 },
  { mes: 'Mai', projetos: 15, horas_alocadas: 850, horas_planejadas: 800 },
  { mes: 'Jun', projetos: 12, horas_alocadas: 900, horas_planejadas: 850 }
];

export default function ProjetosExecutivo({ filtros }) {
  return (
    <div className="space-y-6">
      {/* KPIs Projetos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-[var(--border)] bg-white">
          <p className="text-xs text-[var(--text-secondary)] mb-1">Ativos</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">12</p>
          <p className="text-xs text-[var(--apsis-orange)] mt-1">em andamento</p>
        </Card>

        <Card className="p-4 border-[var(--border)] bg-white">
          <p className="text-xs text-[var(--text-secondary)] mb-1">Atraso</p>
          <p className="text-2xl font-bold text-red-600">2</p>
          <p className="text-xs text-red-600 mt-1">crítico</p>
        </Card>

        <Card className="p-4 border-[var(--border)] bg-white">
          <p className="text-xs text-[var(--text-secondary)] mb-1">Concluído</p>
          <p className="text-2xl font-bold text-green-600">8</p>
          <p className="text-xs text-green-600 mt-1">100% sucesso</p>
        </Card>

        <Card className="p-4 border-[var(--border)] bg-white">
          <p className="text-xs text-[var(--text-secondary)] mb-1">Taxa Sucesso</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">80%</p>
          <p className="text-xs text-green-600 mt-1">↑ 5%</p>
        </Card>
      </div>

      {/* Gráfico Status */}
      <Card className="p-6 border-[var(--border)] bg-white">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Status dos Projetos</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={DADOS_STATUS}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {DADOS_STATUS.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Gráfico Evolução */}
      <Card className="p-6 border-[var(--border)] bg-white">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Horas Alocadas vs Planejadas</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={DADOS_EVOLUCAO}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="horas_alocadas" fill="var(--apsis-green)" name="Alocadas" />
            <Bar dataKey="horas_planejadas" fill="var(--apsis-orange)" name="Planejadas" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}