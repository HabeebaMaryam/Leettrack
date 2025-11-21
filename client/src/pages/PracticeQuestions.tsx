import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, CheckCircle, Circle } from "lucide-react";

interface QuestionWithStatus {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  sampleInput: string;
  sampleOutput: string;
  isSolved: boolean;
}

export default function PracticeQuestions() {
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const { data: questions, isLoading } = useQuery<QuestionWithStatus[]>({
    queryKey: ['/api/questions'],
  });

  const filteredQuestions = questions?.filter(q => 
    difficultyFilter === "all" || q.difficulty === difficultyFilter
  );

  const stats = {
    total: questions?.length || 0,
    solved: questions?.filter(q => q.isSolved).length || 0,
    easy: questions?.filter(q => q.difficulty === 'easy').length || 0,
    medium: questions?.filter(q => q.difficulty === 'medium').length || 0,
    hard: questions?.filter(q => q.difficulty === 'hard').length || 0,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Practice Questions</h1>
        <p className="text-muted-foreground">Solve coding questions to improve your skills</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.solved}/{stats.total}</div>
            <p className="text-sm text-muted-foreground">Questions Solved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.easy}</div>
            <p className="text-sm text-muted-foreground">Easy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.medium}</div>
            <p className="text-sm text-muted-foreground">Medium</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.hard}</div>
            <p className="text-sm text-muted-foreground">Hard</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-48" data-testid="select-difficulty-filter">
            <SelectValue placeholder="Filter by difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading questions...</div>
      ) : (
        <div className="grid gap-4">
          {filteredQuestions && filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => (
              <Card key={question.id} data-testid={`card-question-${question.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {question.isSolved ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" data-testid={`icon-solved-${question.id}`} />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                        <CardTitle className="flex-1">{question.title}</CardTitle>
                        <span className={`px-2 py-1 text-xs rounded ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {question.difficulty}
                        </span>
                      </div>
                      <CardDescription className="mt-2">{question.description.substring(0, 200)}...</CardDescription>
                    </div>
                    <Link href={`/practice/${question.id}`}>
                      <Button data-testid={`button-solve-${question.id}`}>
                        <Code className="w-4 h-4 mr-2" />
                        {question.isSolved ? "Solve Again" : "Solve"}
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No questions available yet. Check back later!
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
