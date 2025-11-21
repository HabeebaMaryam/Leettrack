import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Code2, UserPlus, Shield, Mail } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Register() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
              <Code2 className="h-6 w-6" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold">Access Request</CardTitle>
            <CardDescription className="text-base">
              LeetTrack is an admin-managed platform
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Registration is Restricted</AlertTitle>
            <AlertDescription>
              Public registration is disabled. Only authorized administrators can add users to this platform.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">How to Get Access</h3>
            <div className="space-y-3">
              <div className="flex gap-4 p-4 rounded-lg border bg-card">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Contact Your Administrator</h4>
                  <p className="text-sm text-muted-foreground">
                    Reach out to your organization's administrator and request access to LeetTrack. 
                    Provide them with your LeetCode username.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-lg border bg-card">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                    <UserPlus className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Admin Creates Your Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Once approved, the administrator will create your account using your LeetCode username 
                    and provide you with login credentials.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-lg border bg-card">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                    <Code2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Start Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    Once your account is created, you can log in and start tracking your LeetCode progress.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Already have an account?
              </p>
              <Link href="/login">
                <Button className="w-full" data-testid="button-login">
                  Go to Login
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
