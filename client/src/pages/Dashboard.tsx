import { useQuery } from '@tanstack/react-query';
import { Code2, Trophy, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { DifficultyChart } from '@/components/DifficultyChart';
import { WeeklyProgressChart } from '@/components/WeeklyProgressChart';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Stats } from '@shared/schema';

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading, error, refetch } = useQuery<Stats>({
    queryKey: ['/api/stats/me'],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!user?.leetcodeUsername) {
    return (
      <div className="p-6 md:p-8">
        <EmptyState
          icon={Code2}
          title="LeetCode Username Not Set"
          description="Please add your LeetCode username in settings to start tracking your progress and view analytics."
          action={{
            label: 'Go to Settings',
            onClick: () => setLocation('/settings'),
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load statistics. Please try again.
            <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-4">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalSolved = stats?.totalSolved || 0;
  const easySolved = stats?.easySolved || 0;
  const mediumSolved = stats?.mediumSolved || 0;
  const hardSolved = stats?.hardSolved || 0;
  const contestRating = stats?.contestRating || 0;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username}!</h1>
        <p className="text-muted-foreground">
          Here's your LeetCode progress overview
        </p>
      </div>

      {totalSolved === 0 ? (
        <EmptyState
          icon={Code2}
          title="No Problems Solved Yet"
          description="Start solving problems on LeetCode to see your statistics and progress here."
          action={{
            label: 'Refresh Stats',
            onClick: () => refetch(),
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Solved"
              value={totalSolved}
              icon={Code2}
              iconClassName="bg-chart-1/10 text-chart-1"
            />
            <StatCard
              title="Easy"
              value={easySolved}
              icon={Target}
              iconClassName="bg-chart-2/10 text-chart-2"
            />
            <StatCard
              title="Medium"
              value={mediumSolved}
              icon={TrendingUp}
              iconClassName="bg-chart-3/10 text-chart-3"
            />
            <StatCard
              title="Hard"
              value={hardSolved}
              icon={Trophy}
              iconClassName="bg-chart-4/10 text-chart-4"
            />
          </div>

          {contestRating > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Contest Rating"
                value={contestRating}
                icon={Trophy}
                iconClassName="bg-primary/10 text-primary"
              />
              <StatCard
                title="Acceptance Rate"
                value={stats?.acceptanceRate || 'N/A'}
                icon={Target}
                iconClassName="bg-chart-2/10 text-chart-2"
              />
              <StatCard
                title="Ranking"
                value={stats?.ranking ? `#${stats.ranking.toLocaleString()}` : 'N/A'}
                icon={Trophy}
                iconClassName="bg-chart-3/10 text-chart-3"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DifficultyChart easy={easySolved} medium={mediumSolved} hard={hardSolved} />
            <BadgeDisplay badges={stats?.badges || []} />
          </div>

          <WeeklyProgressChart />
        </>
      )}
    </div>
  );
}
