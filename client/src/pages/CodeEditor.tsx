import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Play, Send, ArrowLeft, CheckCircle, XCircle, Clock, Database, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CODE_TEMPLATES = {
  python: `def solution():\n    # Write your code here\n    pass\n\nsolution()`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your code here\n        sc.close();\n    }\n}`,
};

export default function CodeEditor() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [code, setCode] = useState(CODE_TEMPLATES.python);
  const [language, setLanguage] = useState<"python" | "cpp" | "java">("python");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);

  interface QuestionDetail {
    id: string;
    title: string;
    description: string;
    sampleInput: string;
    sampleOutput: string;
    difficulty: string;
  }

  const { data: question, isLoading } = useQuery<QuestionDetail>({
    queryKey: ['/api/questions', id],
    enabled: !!id,
  });

  useEffect(() => {
    setCode(CODE_TEMPLATES[language]);
  }, [language]);

  const runMutation = useMutation({
    mutationFn: (data: { code: string; language: string; input?: string }) =>
      apiRequest('POST', '/api/code/run', data),
    onSuccess: (data) => {
      setOutput({ ...data, type: 'run' });
      setIsRunning(false);
    },
    onError: (error: any) => {
      if (error.service_unavailable) {
        setServiceUnavailable(true);
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
      setIsRunning(false);
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: { code: string; language: string; questionId: string }) =>
      apiRequest('POST', '/api/code/submit', data),
    onSuccess: (data) => {
      setOutput({ ...data, type: 'submit' });
      setIsSubmitting(false);
      
      if (data.status === 'accepted') {
        toast({ 
          title: "Accepted!", 
          description: "All test cases passed! Great job!" 
        });
      } else {
        toast({ 
          title: "Wrong Answer", 
          description: data.message,
          variant: "destructive" 
        });
      }
    },
    onError: (error: any) => {
      if (error.service_unavailable) {
        setServiceUnavailable(true);
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
      setIsSubmitting(false);
    },
  });

  const handleRun = () => {
    setIsRunning(true);
    runMutation.mutate({
      code,
      language,
      input: customInput,
    });
  };

  const handleSubmit = () => {
    if (!id) return;
    setIsSubmitting(true);
    submitMutation.mutate({
      code,
      language,
      questionId: id,
    });
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading question...</div>;
  }

  if (!question) {
    return <div className="p-6 text-center">Question not found</div>;
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/practice")} data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">{question.title}</h1>
            <span className={`px-2 py-1 text-xs rounded ${
              question.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
              question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
              'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}>
              {question.difficulty}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={(val) => setLanguage(val as any)}>
            <SelectTrigger className="w-40" data-testid="select-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="java">Java</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRun} disabled={isRunning || serviceUnavailable} data-testid="button-run">
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? "Running..." : "Run"}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || serviceUnavailable} data-testid="button-submit">
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>

      {serviceUnavailable && (
        <div className="px-4 py-2">
          <Alert variant="destructive" data-testid="alert-service-unavailable">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Code Execution Service Unavailable</AlertTitle>
            <AlertDescription>
              The code execution service is not configured. Please contact your administrator to set up Judge0 API to enable code execution functionality.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex-1 grid grid-cols-2 overflow-hidden">
        <div className="border-r overflow-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle>Problem Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap">{question.description}</p>
              
              <div>
                <h3 className="font-semibold mb-2">Sample Input:</h3>
                <pre className="bg-muted p-3 rounded text-sm overflow-auto">{question.sampleInput}</pre>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Sample Output:</h3>
                <pre className="bg-muted p-3 rounded text-sm overflow-auto">{question.sampleOutput}</pre>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          <div className="h-64 border-t overflow-auto">
            <Tabs defaultValue="input" className="h-full flex flex-col">
              <TabsList className="w-full justify-start rounded-none">
                <TabsTrigger value="input" data-testid="tab-input">Input</TabsTrigger>
                <TabsTrigger value="output" data-testid="tab-output">Output</TabsTrigger>
              </TabsList>
              <TabsContent value="input" className="flex-1 p-4">
                <Textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter custom input for testing (optional)"
                  className="h-full resize-none font-mono text-sm"
                  data-testid="textarea-custom-input"
                />
              </TabsContent>
              <TabsContent value="output" className="flex-1 p-4 overflow-auto">
                {output ? (
                  <div className="space-y-3">
                    {output.type === 'submit' && (
                      <div className={`flex items-center gap-2 font-semibold ${
                        output.status === 'accepted' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {output.status === 'accepted' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                        {output.status === 'accepted' ? 'Accepted' : 'Wrong Answer'}
                      </div>
                    )}
                    
                    {output.message && (
                      <p className="text-sm">{output.message}</p>
                    )}
                    
                    <div className="flex gap-4 text-sm">
                      {output.time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Runtime: {output.time}s
                        </div>
                      )}
                      {output.memory && (
                        <div className="flex items-center gap-1">
                          <Database className="w-4 h-4" />
                          Memory: {output.memory}
                        </div>
                      )}
                    </div>

                    {output.stdout && (
                      <div>
                        <p className="font-semibold mb-1">Output:</p>
                        <pre className="bg-muted p-3 rounded text-sm overflow-auto">{output.stdout}</pre>
                      </div>
                    )}
                    
                    {output.stderr && (
                      <div>
                        <p className="font-semibold mb-1 text-red-600 dark:text-red-400">Error:</p>
                        <pre className="bg-muted p-3 rounded text-sm overflow-auto text-red-600 dark:text-red-400">{output.stderr}</pre>
                      </div>
                    )}
                    
                    {output.compile_output && (
                      <div>
                        <p className="font-semibold mb-1 text-red-600 dark:text-red-400">Compilation Error:</p>
                        <pre className="bg-muted p-3 rounded text-sm overflow-auto text-red-600 dark:text-red-400">{output.compile_output}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Click "Run" to test your code or "Submit" to check against all test cases.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
