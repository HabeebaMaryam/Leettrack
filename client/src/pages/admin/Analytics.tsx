import { useQuery } from '@tanstack/react-query';
import { Users, Trophy, TrendingUp, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

export default function Analytics() {
  const { data: students, isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/students'],
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const totalStudents = students?.length || 0;
  const activeStudents = students?.filter(s => s.leetcodeUsername).length || 0;
  const avgSolved = students?.length
    ? Math.round(students.reduce((sum, s) => sum + (s.totalSolved || 0), 0) / students.length)
    : 0;
  const totalProblems = students?.reduce((sum, s) => sum + (s.totalSolved || 0), 0) || 0;

  const departmentData = students?.reduce((acc: any, student) => {
    const dept = student.department || 'Unknown';
    if (!acc[dept]) {
      acc[dept] = { department: dept, students: 0, avgSolved: 0, totalSolved: 0 };
    }
    acc[dept].students += 1;
    acc[dept].totalSolved += student.totalSolved || 0;
    return acc;
  }, {});

  const chartData = Object.values(departmentData || {}).map((d: any) => ({
    ...d,
    avgSolved: Math.round(d.totalSolved / d.students),
  }));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive platform-wide statistics and insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          iconClassName="bg-chart-1/10 text-chart-1"
        />
        <StatCard
          title="Active Students"
          value={activeStudents}
          icon={Target}
          subtitle={`${totalStudents ? Math.round((activeStudents / totalStudents) * 100) : 0}% of total`}
          iconClassName="bg-chart-2/10 text-chart-2"
        />
        <StatCard
          title="Avg Problems Solved"
          value={avgSolved}
          icon={TrendingUp}
          iconClassName="bg-chart-3/10 text-chart-3"
        />
        <StatCard
          title="Total Problems Solved"
          value={totalProblems}
          icon={Trophy}
          iconClassName="bg-chart-4/10 text-chart-4"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Students by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="department"
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
                <Bar dataKey="students" fill="hsl(var(--chart-1))" name="Students" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Performance by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="department"
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
                <Line
                  type="monotone"
                  dataKey="avgSolved"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  name="Avg Problems Solved"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
