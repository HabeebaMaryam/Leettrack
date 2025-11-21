import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { FolderKanban, Plus, Users, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';

export default function Batches() {
  const [, setLocation] = useLocation();

  const { data: batches, isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/batches'],
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Batches</h1>
          <p className="text-muted-foreground">
            Organize students into batches for better tracking
          </p>
        </div>
        <Button onClick={() => setLocation('/admin/batches/create')} data-testid="button-create-batch">
          <Plus className="h-4 w-4 mr-2" />
          Create Batch
        </Button>
      </div>

      {!batches || batches.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No Batches Yet"
          description="Create your first batch to organize students and track their performance."
          action={{
            label: 'Create Batch',
            onClick: () => setLocation('/admin/batches/create'),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <Card key={batch.id} className="hover-elevate">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2" data-testid={`text-batch-name-${batch.id}`}>
                      {batch.batchName}
                    </CardTitle>
                    <Badge variant="secondary">{batch.department}</Badge>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-2/10 text-chart-2">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm" data-testid={`text-student-count-${batch.id}`}>
                    {batch.studentIds?.length || 0} students
                  </span>
                </div>
                {batch.rankStart && batch.rankEnd && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Rank Range: </span>
                    <span className="font-mono font-semibold">
                      #{batch.rankStart} - #{batch.rankEnd}
                    </span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Created {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : 'N/A'}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setLocation(`/admin/batches/${batch.id}`)}
                  data-testid={`button-view-batch-${batch.id}`}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
