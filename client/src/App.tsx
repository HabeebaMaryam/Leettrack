import { Switch, Route, Redirect } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProtectedRoute } from '@/components/ProtectedRoute';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import Rankings from '@/pages/Rankings';
import PracticeQuestions from '@/pages/PracticeQuestions';
import CodeEditor from '@/pages/CodeEditor';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import Students from '@/pages/admin/Students';
import StudentDetail from '@/pages/admin/StudentDetail';
import Batches from '@/pages/admin/Batches';
import CreateBatch from '@/pages/admin/CreateBatch';
import BatchDetail from '@/pages/admin/BatchDetail';
import Analytics from '@/pages/admin/Analytics';
import CodingQuestions from '@/pages/admin/CodingQuestions';
import NotFound from '@/pages/not-found';

function AuthRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Login />}
      </Route>
      <Route path="/register">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Register />}
      </Route>

      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>

      <Route path="/rankings">
        <ProtectedRoute>
          <Rankings />
        </ProtectedRoute>
      </Route>

      <Route path="/practice">
        <ProtectedRoute>
          <PracticeQuestions />
        </ProtectedRoute>
      </Route>

      <Route path="/practice/:id">
        <ProtectedRoute>
          <CodeEditor />
        </ProtectedRoute>
      </Route>

      <Route path="/admin">
        <ProtectedRoute requireAdmin>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/students">
        <ProtectedRoute requireAdmin>
          <Students />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/students/:id">
        <ProtectedRoute requireAdmin>
          <StudentDetail />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/rankings">
        <ProtectedRoute requireAdmin>
          <Rankings />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/batches">
        <ProtectedRoute requireAdmin>
          <Batches />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/batches/create">
        <ProtectedRoute requireAdmin>
          <CreateBatch />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/batches/:id">
        <ProtectedRoute requireAdmin>
          <BatchDetail />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/analytics">
        <ProtectedRoute requireAdmin>
          <Analytics />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/questions">
        <ProtectedRoute requireAdmin>
          <CodingQuestions />
        </ProtectedRoute>
      </Route>

      <Route path="/">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthRouter />;
  }

  const style = {
    '--sidebar-width': '16rem',
    '--sidebar-width-icon': '3rem',
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-background sticky top-0 z-10">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <AuthRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
