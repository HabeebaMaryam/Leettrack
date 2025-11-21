import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";
import { requireAuth, requireAdmin } from "./middleware";
import { fetchLeetCodeStats } from "./leetcode";
import { insertUserSchema, loginSchema, updateLeetCodeUsernameSchema, insertBatchSchema, adminCreateUserSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { generateToken } from "./auth";

const SALT_ROUNDS = 10;
const PgSession = pgSession(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware with PostgreSQL store
  app.use(
    session({
      store: new PgSession({
        pool: pool as any,
        tableName: 'session',
      }),
      secret: process.env.SESSION_SECRET || 'leettrack-secret-key-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: true, // Required for sameSite: 'none' - Replit uses HTTPS
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'none', // Required for iframe/cross-site contexts like Replit
      },
    })
  );

  // Note: User authentication now handled by JWT tokens in middleware
  // Session middleware kept for future use (refresh tokens, etc.)

  // ============ AUTH ROUTES ============

  // Register - DISABLED (admin-only user creation)
  app.post('/api/auth/register', async (req, res) => {
    res.status(403).json({ 
      message: 'Public registration is disabled. Please contact your administrator to create an account.' 
    });
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);

      // Find user
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ 
          message: 'Account not found. Please contact your administrator to be added to the platform.' 
        });
      }

      // Verify password
      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role as 'admin' | 'student'
      });

      // Don't send password back
      const { password, ...userWithoutPassword } = user;
      
      // Return user data with token
      res.json({ 
        ...userWithoutPassword, 
        token 
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(400).json({ message: error.message || 'Login failed' });
    }
  });

  // Logout (JWT-based - token is cleared on frontend)
  app.post('/api/auth/logout', (req, res) => {
    // For JWT authentication, logout is handled client-side by removing the token
    // Backend just confirms the logout request
    res.json({ message: 'Logged out successfully' });
  });

  // Get current user
  app.get('/api/auth/me', requireAuth, (req, res) => {
    const { password, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  });

  // ============ USER ROUTES ============

  // Update LeetCode username
  app.put('/api/user/update-leetcode', requireAuth, async (req, res) => {
    try {
      const data = updateLeetCodeUsernameSchema.parse(req.body);

      const updatedUser = await storage.updateUser(req.user!.id, {
        leetcodeUsername: data.leetcodeUsername,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error('Update LeetCode username error:', error);
      res.status(400).json({ message: error.message || 'Update failed' });
    }
  });

  // ============ STATS ROUTES ============

  // Get current user's stats
  app.get('/api/stats/me', requireAuth, async (req, res) => {
    try {
      if (!req.user!.leetcodeUsername) {
        return res.status(400).json({ message: 'LeetCode username not set' });
      }

      // Try to get cached stats
      let stats = await storage.getStatsByUserId(req.user!.id);

      // If no stats or older than 24 hours, fetch new ones
      const shouldRefresh = !stats || 
        (new Date().getTime() - new Date(stats.lastUpdated).getTime()) > 24 * 60 * 60 * 1000;

      if (shouldRefresh) {
        try {
          const leetcodeStats = await fetchLeetCodeStats(req.user!.leetcodeUsername);

          stats = await storage.upsertStats({
            userId: req.user!.id,
            totalSolved: leetcodeStats.totalSolved,
            easySolved: leetcodeStats.easySolved,
            mediumSolved: leetcodeStats.mediumSolved,
            hardSolved: leetcodeStats.hardSolved,
            acceptanceRate: leetcodeStats.acceptanceRate,
            ranking: leetcodeStats.ranking,
            contestRating: leetcodeStats.contestRating,
            recentSubmissions: leetcodeStats.recentSubmissions,
            badges: leetcodeStats.badges,
          });
        } catch (error) {
          console.error('Error fetching LeetCode stats:', error);
          // If we have cached stats, return them
          if (stats) {
            return res.json(stats);
          }
          throw error;
        }
      }

      res.json(stats);
    } catch (error: any) {
      console.error('Get stats error:', error);
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  // ============ RANKINGS ROUTE ============

  app.get('/api/rankings', requireAuth, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allStats = await storage.getAllStats();

      // Create a map of userId -> stats
      const statsMap = new Map(allStats.map(s => [s.userId, s]));

      // Get platform questions solved for each user
      const platformSolvedPromises = allUsers.map(async user => {
        const solvedQuestions = await storage.getUserSolvedQuestions(user.id);
        return { userId: user.id, platformSolved: solvedQuestions.length };
      });
      const platformSolvedData = await Promise.all(platformSolvedPromises);
      const platformSolvedMap = new Map(platformSolvedData.map(d => [d.userId, d.platformSolved]));

      // Combine users with their stats and platform solved count
      const rankings = allUsers
        .map(user => {
          const userStats = statsMap.get(user.id);
          const platformSolved = platformSolvedMap.get(user.id) || 0;
          const totalSolved = (userStats?.totalSolved || 0);
          
          return {
            userId: user.id,
            username: user.username,
            email: user.email,
            department: user.department,
            leetcodeUsername: user.leetcodeUsername,
            totalSolved,
            platformSolved,
            combinedTotal: totalSolved + platformSolved,
            easySolved: userStats?.easySolved || 0,
            mediumSolved: userStats?.mediumSolved || 0,
            hardSolved: userStats?.hardSolved || 0,
            contestRating: userStats?.contestRating || 0,
            ranking: userStats?.ranking || 0,
          };
        })
        .sort((a, b) => {
          // Sort by combined total (LeetCode + Platform) (descending)
          if (b.combinedTotal !== a.combinedTotal) {
            return b.combinedTotal - a.combinedTotal;
          }
          // Tiebreaker: contest rating
          return b.contestRating - a.contestRating;
        });

      res.json(rankings);
    } catch (error: any) {
      console.error('Get rankings error:', error);
      res.status(500).json({ message: 'Failed to fetch rankings' });
    }
  });

  // ============ ADMIN ROUTES ============

  // Get all students with their stats
  app.get('/api/admin/students', requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allStats = await storage.getAllStats();

      const statsMap = new Map(allStats.map(s => [s.userId, s]));

      const students = allUsers.map(user => {
        const userStats = statsMap.get(user.id);
        const { password, ...userWithoutPassword } = user;
        return {
          ...userWithoutPassword,
          totalSolved: userStats?.totalSolved || 0,
          easySolved: userStats?.easySolved || 0,
          mediumSolved: userStats?.mediumSolved || 0,
          hardSolved: userStats?.hardSolved || 0,
          contestRating: userStats?.contestRating || 0,
          ranking: userStats?.ranking || 0,
          acceptanceRate: userStats?.acceptanceRate || 'N/A',
        };
      });

      res.json(students);
    } catch (error: any) {
      console.error('Get students error:', error);
      res.status(500).json({ message: 'Failed to fetch students' });
    }
  });

  // Get individual student with stats
  app.get('/api/admin/student/:id', requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const userStats = await storage.getStatsByUserId(user.id);
      
      const { password, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        totalSolved: userStats?.totalSolved || 0,
        easySolved: userStats?.easySolved || 0,
        mediumSolved: userStats?.mediumSolved || 0,
        hardSolved: userStats?.hardSolved || 0,
        contestRating: userStats?.contestRating || 0,
        ranking: userStats?.ranking || 0,
        acceptanceRate: userStats?.acceptanceRate || 'N/A',
        recentSubmissions: userStats?.recentSubmissions || [],
      });
    } catch (error: any) {
      console.error('Get student error:', error);
      res.status(500).json({ message: 'Failed to fetch student' });
    }
  });

  // Get all batches
  app.get('/api/admin/batches', requireAdmin, async (req, res) => {
    try {
      const batches = await storage.getAllBatches();
      res.json(batches);
    } catch (error: any) {
      console.error('Get batches error:', error);
      res.status(500).json({ message: 'Failed to fetch batches' });
    }
  });

  // Get single batch
  app.get('/api/admin/batch/:id', requireAdmin, async (req, res) => {
    try {
      const batch = await storage.getBatch(req.params.id);
      if (!batch) {
        return res.status(404).json({ message: 'Batch not found' });
      }
      res.json(batch);
    } catch (error: any) {
      console.error('Get batch error:', error);
      res.status(500).json({ message: 'Failed to fetch batch' });
    }
  });

  // Create batch
  app.post('/api/admin/batches', requireAdmin, async (req, res) => {
    try {
      const data = insertBatchSchema.parse(req.body);
      const batch = await storage.createBatch(data);
      res.json(batch);
    } catch (error: any) {
      console.error('Create batch error:', error);
      res.status(400).json({ message: error.message || 'Failed to create batch' });
    }
  });

  // Update batch
  app.put('/api/admin/batch/:id', requireAdmin, async (req, res) => {
    try {
      const batch = await storage.updateBatch(req.params.id, req.body);
      if (!batch) {
        return res.status(404).json({ message: 'Batch not found' });
      }
      res.json(batch);
    } catch (error: any) {
      console.error('Update batch error:', error);
      res.status(400).json({ message: error.message || 'Failed to update batch' });
    }
  });

  // Delete batch
  app.delete('/api/admin/batch/:id', requireAdmin, async (req, res) => {
    try {
      await storage.deleteBatch(req.params.id);
      res.json({ message: 'Batch deleted successfully' });
    } catch (error: any) {
      console.error('Delete batch error:', error);
      res.status(500).json({ message: 'Failed to delete batch' });
    }
  });

  // Admin create user
  app.post('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const data = adminCreateUserSchema.parse(req.body);

      // Check if user already exists
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      const existingLeetCode = await storage.getUserByLeetCodeUsername(data.leetcodeUsername);
      if (existingLeetCode) {
        return res.status(400).json({ message: 'LeetCode username already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

      // Create user
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error('Admin create user error:', error);
      res.status(400).json({ message: error.message || 'Failed to create user' });
    }
  });

  // Admin delete user
  app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Prevent admin from deleting themselves
      if (userId === req.user!.id) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await storage.deleteUser(userId);
      res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      console.error('Admin delete user error:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // ============ CODING QUESTIONS ROUTES ============

  // Get all questions (for students)
  app.get('/api/questions', requireAuth, async (req, res) => {
    try {
      const questions = await storage.getAllQuestions();
      const userId = req.user!.id;
      const solvedQuestionIds = await storage.getUserSolvedQuestions(userId);
      
      // Add solved status to each question
      const questionsWithStatus = questions.map(q => ({
        ...q,
        isSolved: solvedQuestionIds.includes(q.id),
        testCases: undefined, // Hide test cases from students
      }));
      
      res.json(questionsWithStatus);
    } catch (error: any) {
      console.error('Get questions error:', error);
      res.status(500).json({ message: 'Failed to fetch questions' });
    }
  });

  // Get single question details
  app.get('/api/questions/:id', requireAuth, async (req, res) => {
    try {
      const question = await storage.getQuestion(req.params.id);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
      
      // Hide test cases from students, show only sample input/output
      const { testCases, ...questionForStudent } = question;
      res.json(questionForStudent);
    } catch (error: any) {
      console.error('Get question error:', error);
      res.status(500).json({ message: 'Failed to fetch question' });
    }
  });

  // Get user's solved questions
  app.get('/api/student/solved-questions', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const solvedQuestionIds = await storage.getUserSolvedQuestions(userId);
      res.json(solvedQuestionIds);
    } catch (error: any) {
      console.error('Get solved questions error:', error);
      res.status(500).json({ message: 'Failed to fetch solved questions' });
    }
  });

  // Run code (without submitting)
  app.post('/api/code/run', requireAuth, async (req, res) => {
    try {
      const { code, language, input } = req.body;
      
      if (!code || !language) {
        return res.status(400).json({ message: 'Code and language are required' });
      }

      // Check if Judge0 is configured
      if (!process.env.JUDGE0_API_KEY) {
        return res.status(503).json({ 
          message: 'Code execution service is not configured. Please contact your administrator to set up Judge0 API.',
          service_unavailable: true
        });
      }

      const { judge0Service, LANGUAGE_IDS } = await import('./judge0Service');
      const languageId = LANGUAGE_IDS[language as keyof typeof LANGUAGE_IDS];
      
      if (!languageId) {
        return res.status(400).json({ message: 'Unsupported language' });
      }

      const result = await judge0Service.executeCode(code, languageId, input);
      
      res.json({
        stdout: result.stdout,
        stderr: result.stderr,
        status: result.status.description,
        time: result.time,
        memory: result.memory,
        compile_output: result.compile_output,
      });
    } catch (error: any) {
      console.error('Run code error:', error);
      res.status(500).json({ message: error.message || 'Failed to execute code' });
    }
  });

  // Submit code (run against test cases)
  app.post('/api/code/submit', requireAuth, async (req, res) => {
    try {
      const { code, language, questionId } = req.body;
      
      if (!code || !language || !questionId) {
        return res.status(400).json({ message: 'Code, language, and questionId are required' });
      }

      // Check if Judge0 is configured
      if (!process.env.JUDGE0_API_KEY) {
        return res.status(503).json({ 
          message: 'Code execution service is not configured. Please contact your administrator to set up Judge0 API.',
          service_unavailable: true
        });
      }

      const question = await storage.getQuestion(questionId);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      const { judge0Service, LANGUAGE_IDS } = await import('./judge0Service');
      const languageId = LANGUAGE_IDS[language as keyof typeof LANGUAGE_IDS];
      
      if (!languageId) {
        return res.status(400).json({ message: 'Unsupported language' });
      }

      // Helper function to tokenize output for comparison
      // Follows competitive programming standards: compares tokens, ignoring whitespace between them
      const tokenizeOutput = (output: string): string[] => {
        return output
          .trim()                          // Remove leading/trailing whitespace
          .replace(/\r\n/g, '\n')         // Normalize Windows line endings
          .split(/\s+/)                    // Split on any whitespace (spaces, tabs, newlines)
          .filter(token => token.length > 0); // Remove empty tokens
      };

      // Compare outputs using token-based comparison
      const outputsMatch = (actual: string, expected: string): boolean => {
        const actualTokens = tokenizeOutput(actual);
        const expectedTokens = tokenizeOutput(expected);
        
        if (actualTokens.length !== expectedTokens.length) {
          return false;
        }
        
        for (let i = 0; i < actualTokens.length; i++) {
          if (actualTokens[i] !== expectedTokens[i]) {
            return false;
          }
        }
        
        return true;
      };

      // Run code against all test cases
      let allPassed = true;
      let failedTestCase = null;
      let failureReason = '';
      let executionTime = '0';
      let executionMemory = null;

      for (let i = 0; i < question.testCases.length; i++) {
        const testCase = question.testCases[i];
        const result = await judge0Service.executeCode(
          code,
          languageId,
          testCase.input,
          testCase.expectedOutput
        );

        executionTime = result.time || '0';
        executionMemory = result.memory;

        // Check if execution was successful first
        if (result.status.id !== 3) {
          // Non-accepted status (compilation error, runtime error, etc.)
          allPassed = false;
          failedTestCase = i + 1;
          failureReason = result.status.description;
          if (process.env.NODE_ENV === 'development') {
            console.log(`Test case ${i + 1} failed with status: ${result.status.description}`);
          }
          break;
        }

        // Compare outputs using token-based comparison (ignores whitespace formatting)
        const actualOutput = result.stdout || '';
        const expectedOutput = testCase.expectedOutput;

        if (!outputsMatch(actualOutput, expectedOutput)) {
          allPassed = false;
          failedTestCase = i + 1;
          failureReason = 'Wrong Answer';
          // Only log in development mode to avoid exposing test cases
          if (process.env.NODE_ENV === 'development') {
            const actualTokens = tokenizeOutput(actualOutput);
            const expectedTokens = tokenizeOutput(expectedOutput);
            console.log(`Test case ${i + 1} - Output mismatch`);
            console.log(`  Expected tokens: ${expectedTokens.length}`);
            console.log(`  Actual tokens: ${actualTokens.length}`);
          }
          break;
        }
      }

      const status = allPassed ? 'accepted' : 'wrong_answer';
      
      // Save submission
      const submission = await storage.createSubmission({
        userId: req.user!.id,
        questionId,
        code,
        language,
        status,
        runtime: executionTime,
        memory: executionMemory ? `${executionMemory} KB` : null,
      });

      // Generate helpful feedback message
      let message = '';
      if (allPassed) {
        message = 'All test cases passed! Question solved.';
      } else if (failureReason && failureReason !== 'Wrong Answer') {
        message = `Failed on test case ${failedTestCase}: ${failureReason}`;
      } else {
        message = `Failed on test case ${failedTestCase}: Wrong Answer`;
      }

      res.json({
        status,
        runtime: executionTime,
        memory: executionMemory ? `${executionMemory} KB` : null,
        message,
        submissionId: submission.id,
      });
    } catch (error: any) {
      console.error('Submit code error:', error);
      res.status(500).json({ message: error.message || 'Failed to submit code' });
    }
  });

  // ============ ADMIN QUESTION ROUTES ============

  // Get all questions (admin - includes test cases)
  app.get('/api/admin/questions', requireAdmin, async (req, res) => {
    try {
      const questions = await storage.getAllQuestions();
      res.json(questions);
    } catch (error: any) {
      console.error('Admin get questions error:', error);
      res.status(500).json({ message: 'Failed to fetch questions' });
    }
  });

  // Create new question
  app.post('/api/admin/questions', requireAdmin, async (req, res) => {
    try {
      const { insertQuestionSchema } = await import('@shared/schema');
      const data = insertQuestionSchema.parse({
        ...req.body,
        createdBy: req.user!.id,
      });
      
      const question = await storage.createQuestion(data);
      res.json(question);
    } catch (error: any) {
      console.error('Create question error:', error);
      res.status(400).json({ message: error.message || 'Failed to create question' });
    }
  });

  // Update question
  app.put('/api/admin/questions/:id', requireAdmin, async (req, res) => {
    try {
      const questionId = req.params.id;
      const question = await storage.getQuestion(questionId);
      
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      const updated = await storage.updateQuestion(questionId, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error('Update question error:', error);
      res.status(400).json({ message: error.message || 'Failed to update question' });
    }
  });

  // Delete question
  app.delete('/api/admin/questions/:id', requireAdmin, async (req, res) => {
    try {
      const questionId = req.params.id;
      const question = await storage.getQuestion(questionId);
      
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      await storage.deleteQuestion(questionId);
      res.json({ message: 'Question deleted successfully' });
    } catch (error: any) {
      console.error('Delete question error:', error);
      res.status(500).json({ message: 'Failed to delete question' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
