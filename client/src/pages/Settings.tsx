import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateLeetCodeUsernameSchema, type UpdateLeetCodeUsername } from '@shared/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Settings as SettingsIcon, User, Code2 } from 'lucide-react';

export default function Settings() {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UpdateLeetCodeUsername>({
    resolver: zodResolver(updateLeetCodeUsernameSchema),
    defaultValues: {
      leetcodeUsername: user?.leetcodeUsername || '',
    },
  });

  const onSubmit = async (data: UpdateLeetCodeUsername) => {
    setIsLoading(true);
    try {
      const updatedUser = await apiRequest('PUT', '/api/user/update-leetcode', data);
      login(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['/api/stats/me'] });
      
      toast({
        title: 'Settings updated',
        description: 'Your LeetCode username has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Username</label>
              <p className="text-base font-medium mt-1" data-testid="text-username">{user?.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-base font-medium mt-1" data-testid="text-email">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Department</label>
              <p className="text-base font-medium mt-1" data-testid="text-department">{user?.department || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Member Since</label>
              <p className="text-base font-medium mt-1" data-testid="text-joined">
                {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-1/10 text-chart-1">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>LeetCode Integration</CardTitle>
              <CardDescription>Connect your LeetCode account to track progress</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="leetcodeUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LeetCode Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your-leetcode-username"
                        data-testid="input-leetcode-username"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter your LeetCode username to fetch and display your statistics
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} data-testid="button-save-settings">
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
