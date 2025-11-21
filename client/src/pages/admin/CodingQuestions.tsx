import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertQuestionSchema, type Question } from "@shared/schema";
import { z } from "zod";
import { Plus, Pencil, Trash2, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CodingQuestions() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ['/api/admin/questions'],
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof insertQuestionSchema>) =>
      apiRequest('POST', '/api/admin/questions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      setDialogOpen(false);
      toast({ title: "Question created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Question> }) =>
      apiRequest('PUT', `/api/admin/questions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      setDialogOpen(false);
      setEditingQuestion(null);
      toast({ title: "Question updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/questions/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      toast({ title: "Question deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const form = useForm<z.infer<typeof insertQuestionSchema>>({
    resolver: zodResolver(insertQuestionSchema.omit({ createdBy: true })),
    defaultValues: {
      title: "",
      description: "",
      sampleInput: "",
      sampleOutput: "",
      difficulty: "easy",
      testCases: [{ input: "", expectedOutput: "" }],
    },
  });

  const handleSubmit = (data: Omit<z.infer<typeof insertQuestionSchema>, "createdBy">) => {
    if (editingQuestion) {
      // When updating, don't send createdBy - keep the original creator
      updateMutation.mutate({ id: editingQuestion.id, data });
    } else {
      // When creating, createdBy will be set by backend to current user
      const fullData = { ...data, createdBy: "" }; // Will be set by backend
      createMutation.mutate(fullData);
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    form.reset({
      title: question.title,
      description: question.description,
      sampleInput: question.sampleInput,
      sampleOutput: question.sampleOutput,
      difficulty: question.difficulty as "easy" | "medium" | "hard",
      testCases: question.testCases,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      deleteMutation.mutate(id);
    }
  };

  const addTestCase = () => {
    const current = form.getValues("testCases");
    form.setValue("testCases", [...current, { input: "", expectedOutput: "" }]);
  };

  const removeTestCase = (index: number) => {
    const current = form.getValues("testCases");
    form.setValue("testCases", current.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Coding Questions</h1>
          <p className="text-muted-foreground">Manage practice questions for students</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingQuestion(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-question">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingQuestion ? "Edit" : "Create"} Question</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Two Sum" data-testid="input-question-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Given an array of integers..." rows={4} data-testid="input-question-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-difficulty">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sampleInput"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sample Input</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="[2, 7, 11, 15]\n9" rows={3} data-testid="input-sample-input" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sampleOutput"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sample Output</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="[0, 1]" rows={3} data-testid="input-sample-output" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>Test Cases (Hidden from students)</FormLabel>
                    <Button type="button" size="sm" onClick={addTestCase} data-testid="button-add-testcase">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Test Case
                    </Button>
                  </div>
                  {form.watch("testCases").map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`testCases.${index}.input`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input {...field} placeholder="Input" data-testid={`input-testcase-${index}-input`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`testCases.${index}.expectedOutput`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input {...field} placeholder="Expected Output" data-testid={`input-testcase-${index}-output`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeTestCase(index)}
                        disabled={form.watch("testCases").length === 1}
                        data-testid={`button-remove-testcase-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button type="submit" data-testid="button-save-question">
                    {editingQuestion ? "Update" : "Create"} Question
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading questions...</div>
      ) : (
        <div className="grid gap-4">
          {questions && questions.length > 0 ? (
            questions.map((question) => (
              <Card key={question.id} data-testid={`card-question-${question.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        <CardTitle>{question.title}</CardTitle>
                        <span className={`px-2 py-1 text-xs rounded ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {question.difficulty}
                        </span>
                      </div>
                      <CardDescription className="mt-2">{question.description.substring(0, 150)}...</CardDescription>
                      <p className="text-sm text-muted-foreground mt-2">Test cases: {question.testCases.length}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(question)} data-testid={`button-edit-${question.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(question.id)} data-testid={`button-delete-${question.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No questions yet. Click "Add Question" to create one.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
