import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DifficultyChartProps {
  easy: number;
  medium: number;
  hard: number;
}

const COLORS = {
  easy: 'hsl(var(--chart-2))',
  medium: 'hsl(var(--chart-3))',
  hard: 'hsl(var(--chart-4))',
};

export function DifficultyChart({ easy, medium, hard }: DifficultyChartProps) {
  const data = [
    { name: 'Easy', value: easy, color: COLORS.easy },
    { name: 'Medium', value: medium, color: COLORS.medium },
    { name: 'Hard', value: hard, color: COLORS.hard },
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Problem Difficulty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>No problems solved yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Problem Difficulty</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
