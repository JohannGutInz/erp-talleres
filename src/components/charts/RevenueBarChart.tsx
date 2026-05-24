import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const MOCK_DATA = [
  { month: 'Ene', revenue: 42000 },
  { month: 'Feb', revenue: 38500 },
  { month: 'Mar', revenue: 51200 },
  { month: 'Abr', revenue: 47800 },
  { month: 'May', revenue: 63100 },
  { month: 'Jun', revenue: 58400 },
]

interface RevenueData {
  month: string
  revenue: number
}

interface RevenueBarChartProps {
  data?: RevenueData[]
}

export function RevenueBarChart({ data = MOCK_DATA }: RevenueBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barSize={32}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: '#64748B' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(v) => [`$${Number(v).toLocaleString('es-MX')}`, 'Ingresos']}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
          cursor={{ fill: '#F8FAFC' }}
        />
        <Bar dataKey="revenue" fill="#F97316" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
