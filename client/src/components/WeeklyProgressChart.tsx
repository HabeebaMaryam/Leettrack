import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WeeklyProgressChartProps {
  data?: Array<{ day: string; solved: number }>;
}

const defaultData = [
  { day: 'Mon', solved: 0 },
  { day: 'Tue', solved: 0 },
  { day: 'Wed', solved: 0 },
  { day: 'Thu', solved: 0 },
  { day: 'Fri', solved: 0 },
  { day: 'Sat', solved: 0 },
  { day: 'Sun', solved: 0 },
];

export function WeeklyProgressChart({ data = defaultData }: WeeklyProgressChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Weekly Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="day"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
            <Bar dataKey="solved" fill="hsl(var(--chart-1))" name="Problems Solved" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
