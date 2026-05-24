import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  Completada:    '#10B981',
  'En progreso': '#3B82F6',
  Pendiente:     '#F59E0B',
  Cancelada:     '#A78BFA',
}

interface StatusData {
  status: string
  count: number
}

interface OrdersByStatusPieProps {
  data?: StatusData[]
}

const MOCK_DATA: StatusData[] = [
  { status: 'Completada',    count: 42 },
  { status: 'En progreso',   count: 18 },
  { status: 'Pendiente',     count: 25 },
  { status: 'Cancelada',     count: 7  },
]

export function OrdersByStatusPie({ data = MOCK_DATA }: OrdersByStatusPieProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="45%"
          outerRadius={85}
          innerRadius={48}
          paddingAngle={3}
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#94A3B8'} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [value, name]}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
        />
        <Legend
          iconType="square"
          iconSize={10}
          formatter={(value) => <span style={{ fontSize: 12, color: '#64748B' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
