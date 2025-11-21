import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Award, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';

export default function Rankings() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const { data: rankings, isLoading } = useQuery<any[]>({
    queryKey: ['/api/rankings'],
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const filteredRankings = rankings?.filter(item => {
    const matchesSearch = item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || item.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  }) || [];

  const departments = Array.from(new Set(rankings?.map(r => r.department).filter(Boolean))) as string[];

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Rankings</h1>
        <p className="text-muted-foreground">
          Compare your progress with other students
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-rankings"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger data-testid="select-department-filter">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredRankings.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No Rankings Found"
          description="No students match your search criteria."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredRankings.map((item, index) => {
                const rank = index + 1;
                const isCurrentUser = item.userId === user?.id;
                const isTopThree = rank <= 3;

                return (
                  <div
                    key={item.userId}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      isCurrentUser
                        ? 'bg-primary/5 border-primary'
                        : isTopThree
                        ? 'bg-muted/50'
                        : 'hover-elevate'
                    }`}
                    data-testid={`ranking-row-${rank}`}
                  >
                    <div className="flex items-center justify-center w-12 font-mono font-bold text-lg">
                      {getRankIcon(rank) || `#${rank}`}
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(item.username)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate" data-testid={`text-username-${rank}`}>
                          {item.username}
                        </p>
                        {isCurrentUser && (
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{item.department}</p>
                    </div>

                    <div className="hidden sm:flex gap-4">
                      <div className="text-right">
                        <p className="font-mono font-semibold text-sm" data-testid={`text-leetcode-solved-${rank}`}>
                          {item.totalSolved}
                        </p>
                        <p className="text-xs text-muted-foreground">LeetCode</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold text-sm text-primary" data-testid={`text-platform-solved-${rank}`}>
                          {item.platformSolved}
                        </p>
                        <p className="text-xs text-muted-foreground">Platform</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-mono font-bold text-lg" data-testid={`text-combined-total-${rank}`}>
                        {item.combinedTotal}
                      </p>
                      <p className="text-xs text-muted-foreground">total</p>
                    </div>

                    {item.contestRating > 0 && (
                      <div className="hidden md:block text-right">
                        <p className="font-mono font-semibold">{item.contestRating}</p>
                        <p className="text-xs text-muted-foreground">rating</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
