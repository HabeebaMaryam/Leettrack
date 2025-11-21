import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { ArrowLeft, Code2, Trophy, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/StatCard';
import { DifficultyChart } from '@/components/DifficultyChart';
import { WeeklyProgressChart } from '@/components/WeeklyProgressChart';
import { Separator } from '@/components/ui/separator';

export default function StudentDetail() {
  const [, params] = useRoute('/admin/students/:id');
  const [, setLocation] = useLocation();
  const studentId = params?.id;

  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ['/api/admin/student', studentId],
    enabled: !!studentId,
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (studentLoading) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6 md:p-8">
        <p>Student not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/admin/students')}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold">Student Details</h1>
          <p className="text-muted-foreground">
            Comprehensive performance analytics
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getInitials(student.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-1" data-testid="text-student-name">
                  {student.username}
                </h2>
                <p className="text-muted-foreground">{student.email}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <Badge variant="secondary" className="mt-1">
                    {student.department || 'Not specified'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">LeetCode Username</p>
                  <p className="font-mono mt-1" data-testid="text-leetcode-username">
                    {student.leetcodeUsername || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="mt-1">
                    {student.joinedAt ? new Date(student.joinedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h3 className="text-2xl font-semibold mb-6">Performance Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Solved"
            value={student.totalSolved || 0}
            icon={Code2}
            iconClassName="bg-chart-1/10 text-chart-1"
          />
          <StatCard
            title="Easy"
            value={student.easySolved || 0}
            icon={Target}
            iconClassName="bg-chart-2/10 text-chart-2"
          />
          <StatCard
            title="Medium"
            value={student.mediumSolved || 0}
            icon={TrendingUp}
            iconClassName="bg-chart-3/10 text-chart-3"
          />
          <StatCard
            title="Hard"
            value={student.hardSolved || 0}
            icon={Trophy}
            iconClassName="bg-chart-4/10 text-chart-4"
          />
        </div>
      </div>

      {(student.contestRating || student.ranking || student.acceptanceRate) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {student.contestRating > 0 && (
            <StatCard
              title="Contest Rating"
              value={student.contestRating}
              icon={Trophy}
              iconClassName="bg-primary/10 text-primary"
            />
          )}
          {student.acceptanceRate && (
            <StatCard
              title="Acceptance Rate"
              value={student.acceptanceRate}
              icon={Target}
              iconClassName="bg-chart-2/10 text-chart-2"
            />
          )}
          {student.ranking && (
            <StatCard
              title="Global Ranking"
              value={`#${student.ranking.toLocaleString()}`}
              icon={Trophy}
              iconClassName="bg-chart-3/10 text-chart-3"
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyProgressChart />
        <DifficultyChart
          easy={student.easySolved || 0}
          medium={student.mediumSolved || 0}
          hard={student.hardSolved || 0}
        />
      </div>
    </div>
  );
}
