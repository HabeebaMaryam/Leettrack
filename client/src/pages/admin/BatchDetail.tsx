import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { ArrowLeft, FolderKanban, Users, Trophy, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatCard } from '@/components/StatCard';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function BatchDetail() {
  const [, params] = useRoute('/admin/batches/:id');
  const [, setLocation] = useLocation();
  const batchId = params?.id;

  const { data: batch, isLoading: batchLoading } = useQuery({
    queryKey: ['/api/admin/batch', batchId],
    enabled: !!batchId,
  });

  const { data: students } = useQuery<any[]>({
    queryKey: ['/api/admin/students'],
  });

  const batchStudents = students?.filter(s => batch?.studentIds?.includes(s.id)) || [];
  
  const avgSolved = batchStudents.length
    ? Math.round(batchStudents.reduce((sum, s) => sum + (s.totalSolved || 0), 0) / batchStudents.length)
    : 0;
  
  const topPerformer = batchStudents.sort((a, b) => (b.totalSolved || 0) - (a.totalSolved || 0))[0];
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (batchLoading) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="p-6 md:p-8">
        <p>Batch not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/admin/batches')}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold">Batch Details</h1>
          <p className="text-muted-foreground">
            Performance analytics and student list
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-chart-2/10 text-chart-2">
              <FolderKanban className="h-8 w-8" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-1" data-testid="text-batch-name">
                  {batch.batchName}
                </h2>
                <div className="flex flex-wrap gap-4 items-center">
                  <Badge variant="secondary">{batch.department}</Badge>
                  {batch.rankStart && batch.rankEnd && (
                    <span className="text-sm text-muted-foreground">
                      Rank Range: <span className="font-mono font-semibold">#{batch.rankStart} - #{batch.rankEnd}</span>
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Created {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h3 className="text-2xl font-semibold mb-6">Batch Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Students"
            value={batchStudents.length}
            icon={Users}
            iconClassName="bg-chart-1/10 text-chart-1"
          />
          <StatCard
            title="Average Solved"
            value={avgSolved}
            icon={TrendingUp}
            iconClassName="bg-chart-3/10 text-chart-3"
          />
          <StatCard
            title="Top Performer"
            value={topPerformer?.username || 'N/A'}
            icon={Trophy}
            subtitle={topPerformer ? `${topPerformer.totalSolved} solved` : ''}
            iconClassName="bg-chart-4/10 text-chart-4"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Students in Batch</CardTitle>
        </CardHeader>
        <CardContent>
          {batchStudents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No students in this batch yet
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>LeetCode</TableHead>
                    <TableHead className="text-right">Total Solved</TableHead>
                    <TableHead className="text-right">Easy</TableHead>
                    <TableHead className="text-right">Medium</TableHead>
                    <TableHead className="text-right">Hard</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchStudents.map((student) => (
                    <TableRow key={student.id} className="hover-elevate cursor-pointer" onClick={() => setLocation(`/admin/students/${student.id}`)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                              {getInitials(student.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.username}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {student.leetcodeUsername || <span className="text-muted-foreground">Not set</span>}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono font-semibold">{student.totalSolved || 0}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono">{student.easySolved || 0}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono">{student.mediumSolved || 0}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono">{student.hardSolved || 0}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
