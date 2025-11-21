import { useQuery } from '@tanstack/react-query';
import { Users, Trophy, FolderKanban, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  const { data: students, isLoading: studentsLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/students'],
  });

  const { data: batches, isLoading: batchesLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/batches'],
  });

  const totalStudents = students?.length || 0;
  const totalBatches = batches?.length || 0;
  const avgSolved = students?.length
    ? Math.round(students.reduce((sum, s) => sum + (s.totalSolved || 0), 0) / students.length)
    : 0;
  const topPerformer = students?.sort((a, b) => (b.totalSolved || 0) - (a.totalSolved || 0))[0];

  if (studentsLoading || batchesLoading) {
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

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage students, track progress, and create batches
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
          title="Total Batches"
          value={totalBatches}
          icon={FolderKanban}
          iconClassName="bg-chart-2/10 text-chart-2"
        />
        <StatCard
          title="Avg Problems Solved"
          value={avgSolved}
          icon={Trophy}
          iconClassName="bg-chart-3/10 text-chart-3"
        />
        <StatCard
          title="Top Performer"
          value={topPerformer?.username || 'N/A'}
          icon={TrendingUp}
          subtitle={topPerformer ? `${topPerformer.totalSolved} solved` : ''}
          iconClassName="bg-chart-4/10 text-chart-4"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover-elevate cursor-pointer" onClick={() => setLocation('/admin/students')}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-1/10 text-chart-1">
                <Users className="h-5 w-5" />
              </div>
              Manage Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              View and manage all registered students, track their progress, and analyze performance
            </p>
            <Button variant="outline" size="sm" data-testid="button-view-students">
              View Students →
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate cursor-pointer" onClick={() => setLocation('/admin/rankings')}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-3/10 text-chart-3">
                <Trophy className="h-5 w-5" />
              </div>
              View Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              See student leaderboard, compare performance, and identify top performers
            </p>
            <Button variant="outline" size="sm" data-testid="button-view-rankings">
              View Rankings →
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate cursor-pointer" onClick={() => setLocation('/admin/batches')}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-2/10 text-chart-2">
                <FolderKanban className="h-5 w-5" />
              </div>
              Manage Batches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Create and manage student batches, track batch performance, and organize groups
            </p>
            <Button variant="outline" size="sm" data-testid="button-view-batches">
              View Batches →
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
