// Judge0 Code Execution Service
// This service handles code execution using Judge0 API

interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
}

interface Judge0Result {
  stdout: string | null;
  stderr: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
  compile_output: string | null;
}

// Language IDs for Judge0
export const LANGUAGE_IDS = {
  python: 71,  // Python 3
  cpp: 54,     // C++ (G++ 9.2.0)
  java: 62,    // Java (OpenJDK 13.0.1)
};

export class Judge0Service {
  private readonly JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
  private readonly JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
  private readonly JUDGE0_HOST = process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com';

  async executeCode(
    code: string,
    languageId: number,
    input?: string,
    expectedOutput?: string
  ): Promise<Judge0Result> {
    try {
      // Require Judge0 API configuration for security
      if (!this.JUDGE0_API_KEY) {
        throw new Error('Code execution service not configured. Please contact administrator to set up Judge0 API.');
      }

      // Create submission
      const submission: Judge0Submission = {
        source_code: Buffer.from(code).toString('base64'),
        language_id: languageId,
        stdin: input ? Buffer.from(input).toString('base64') : undefined,
        expected_output: expectedOutput ? Buffer.from(expectedOutput).toString('base64') : undefined,
      };

      const createResponse = await fetch(`${this.JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': this.JUDGE0_API_KEY,
          'X-RapidAPI-Host': this.JUDGE0_HOST,
        },
        body: JSON.stringify(submission),
      });

      if (!createResponse.ok) {
        throw new Error(`Judge0 API error: ${createResponse.statusText}`);
      }

      const result = await createResponse.json();

      return {
        stdout: result.stdout ? Buffer.from(result.stdout, 'base64').toString() : null,
        stderr: result.stderr ? Buffer.from(result.stderr, 'base64').toString() : null,
        status: result.status,
        time: result.time,
        memory: result.memory,
        compile_output: result.compile_output ? Buffer.from(result.compile_output, 'base64').toString() : null,
      };
    } catch (error) {
      console.error('Judge0 execution error:', error);
      throw error;
    }
  }

  mapStatusToSubmissionStatus(statusId: number): string {
    // Judge0 status IDs
    // 3 = Accepted
    // 4 = Wrong Answer
    // 5 = Time Limit Exceeded
    // 6 = Compilation Error
    // 7-12 = Runtime Errors
    // 13 = Internal Error
    
    if (statusId === 3) return 'accepted';
    if (statusId === 4) return 'wrong_answer';
    if (statusId === 5) return 'time_limit_exceeded';
    if (statusId === 6) return 'compilation_error';
    return 'runtime_error';
  }
}

export const judge0Service = new Judge0Service();
