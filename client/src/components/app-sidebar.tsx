import { Home, BarChart3, Trophy, Users, FolderKanban, Settings, LogOut, Code } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const studentItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Practice',
    url: '/practice',
    icon: Code,
  },
  {
    title: 'Rankings',
    url: '/rankings',
    icon: Trophy,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

const adminItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: Home,
  },
  {
    title: 'Students',
    url: '/admin/students',
    icon: Users,
  },
  {
    title: 'Questions',
    url: '/admin/questions',
    icon: Code,
  },
  {
    title: 'Rankings',
    url: '/admin/rankings',
    icon: Trophy,
  },
  {
    title: 'Batches',
    url: '/admin/batches',
    icon: FolderKanban,
  },
  {
    title: 'Analytics',
    url: '/admin/analytics',
    icon: BarChart3,
  },
];

export function AppSidebar() {
  const { user, isAdmin, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const items = isAdmin ? adminItems : studentItems;

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      logout();
      queryClient.clear();
      setLocation('/login');
      toast({
        title: 'Logged out successfully',
      });
    } catch (error) {
      toast({
        title: 'Logout failed',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            LT
          </div>
          <div>
            <h2 className="text-lg font-bold">LeetTrack</h2>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? 'Admin Panel' : 'Student Portal'}
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-2 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user ? getInitials(user.username) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full"
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
