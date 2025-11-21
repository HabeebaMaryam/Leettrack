import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { insertBatchSchema, type InsertBatch } from '@shared/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Other'];

export default function CreateBatch() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const { data: students } = useQuery<any[]>({
    queryKey: ['/api/admin/students'],
  });

  const form = useForm<InsertBatch>({
    resolver: zodResolver(insertBatchSchema),
    defaultValues: {
      batchName: '',
      department: '',
      rankStart: undefined,
      rankEnd: undefined,
      studentIds: [],
    },
  });

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const onSubmit = async (data: InsertBatch) => {
    setIsLoading(true);
    try {
      await apiRequest('POST', '/api/admin/batches', {
        ...data,
        studentIds: selectedStudents,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/batches'] });
      
      toast({
        title: 'Batch created',
        description: 'The batch has been created successfully.',
      });
      
      setLocation('/admin/batches');
    } catch (error: any) {
      toast({
        title: 'Failed to create batch',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
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
          <h1 className="text-4xl font-bold">Create Batch</h1>
          <p className="text-muted-foreground">
            Group students for better organization and tracking
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Batch Information</CardTitle>
              <CardDescription>Basic details about the batch</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="batchName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., CSE Batch 2024" data-testid="input-batch-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="rankStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rank Start (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 1"
                          data-testid="input-rank-start"
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Starting rank for this batch</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rankEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rank End (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 20"
                          data-testid="input-rank-end"
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Ending rank for this batch</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Students ({selectedStudents.length} selected)
              </CardTitle>
              <CardDescription>Choose students to add to this batch</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 rounded-md border p-4">
                <div className="space-y-4">
                  {students?.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover-elevate"
                    >
                      <Checkbox
                        id={student.id}
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={() => toggleStudent(student.id)}
                        data-testid={`checkbox-student-${student.id}`}
                      />
                      <label
                        htmlFor={student.id}
                        className="flex-1 cursor-pointer"
                      >
                        <p className="font-medium">{student.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.department} • {student.totalSolved || 0} solved
                        </p>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/admin/batches')}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} data-testid="button-create">
              {isLoading ? 'Creating...' : 'Create Batch'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
