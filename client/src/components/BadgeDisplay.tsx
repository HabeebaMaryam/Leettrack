import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgeType } from '@shared/schema';
import { Award, Trophy } from 'lucide-react';

interface BadgeDisplayProps {
  badges?: BadgeType[];
}

export function BadgeDisplay({ badges = [] }: BadgeDisplayProps) {
  const recentBadges = badges.slice(0, 5);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-lg">Badges & Achievements</CardTitle>
        <Trophy className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center" data-testid="empty-badges">
            <Award className="h-12 w-12 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No badges earned yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Keep solving problems to earn badges!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" data-testid="text-badge-count">
                Total Badges: <span className="text-primary">{badges.length}</span>
              </p>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">
                Recent Badges
              </p>
              <div className="space-y-2">
                {recentBadges.map((badge, index) => (
                  <div
                    key={badge.id || index}
                    className="flex items-center gap-3 p-2 rounded-md bg-muted/50 hover-elevate"
                    data-testid={`badge-item-${index}`}
                  >
                    {badge.icon && (
                      <img
                        src={badge.icon}
                        alt={badge.displayName}
                        className="h-8 w-8 rounded"
                        data-testid={`badge-icon-${index}`}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" data-testid={`badge-name-${index}`}>
                        {badge.displayName || badge.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground" data-testid={`badge-category-${index}`}>
                          {badge.category}
                        </span>
                        {badge.creationDate && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground" data-testid={`badge-date-${index}`}>
                              {new Date(badge.creationDate).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {badges.length > 5 && (
                <p className="text-xs text-center text-muted-foreground pt-2">
                  +{badges.length - 5} more badges
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
