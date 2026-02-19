import { QuizRepository } from '../repositories/quiz.repository';
import { 
  Quiz, 
  QuizAttempt, 
  Prisma, 
  ProgressStatus,
  ActivityType
} from '@prisma/client';
import { 
  NotFoundError, 
  ValidationError
} from '../utils/error-handler';
import prisma from '../database';

export interface CreateQuizData {
  moduleId: string;
  title: string;
  description?: string;
  instructions?: string;
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  pointsAvailable?: number;
  questions: any[];
}

export class QuizService {
  async createQuiz(data: CreateQuizData): Promise<Quiz> {
    if (!data.questions || data.questions.length === 0) throw new ValidationError('Quiz must have at least one question');

    return await QuizRepository.create({
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      timeLimit: data.timeLimit,
      passingScore: data.passingScore || 70,
      maxAttempts: data.maxAttempts || 3,
      shuffleQuestions: data.shuffleQuestions ?? true,
      pointsAvailable: data.pointsAvailable || 100,
      questions: data.questions as any,
      module: { connect: { id: data.moduleId } }
    });
  }

  async getQuizByModuleId(moduleId: string): Promise<Quiz | null> {
    return await QuizRepository.findByModuleId(moduleId);
  }

  async submitAttempt(userId: string, quizId: string, enrollmentId: string, answers: any): Promise<QuizAttempt> {
    if (!userId) throw new ValidationError('User ID is required');
    if (!enrollmentId) throw new ValidationError('Enrollment ID is required');
    
    const quiz = await QuizRepository.findById(quizId);
    if (!quiz) throw new NotFoundError('Quiz not found');

    const previousAttempts = await QuizRepository.findAttemptsByUser(userId, quizId);
    if (quiz.maxAttempts && previousAttempts.length >= quiz.maxAttempts) throw new ValidationError('Maximum quiz attempts reached');

    const questions = quiz.questions as any[];
    let correctCount = 0;
    const detailedResults = questions.map((q, idx) => {
      const userAnswer = answers[idx];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;
      return { questionId: idx, userAnswer, correctAnswer: q.correctAnswer, isCorrect };
    });

    const percentage = (correctCount / questions.length) * 100;
    const passed = percentage >= quiz.passingScore;
    const score = (percentage / 100) * quiz.pointsAvailable;

    const isInitialAttempt = previousAttempts.length === 0;

    const attempt = await QuizRepository.createAttempt({
      user: { connect: { id: userId } },
      quiz: { connect: { id: quizId } },
      enrollment: { connect: { id: enrollmentId } },
      attemptNumber: previousAttempts.length + 1,
      score, percentage, passed,
      answers: answers as any,
      questions: quiz.questions as any,
      detailedResults: detailedResults as any,
      timeSpent: 0,
      startedAt: new Date(),
      completedAt: new Date()
    });

    // Update module progress attempts count and record the INITIAL attempt score
    await prisma.moduleProgress.upsert({
      where: { userId_moduleId_enrollmentId: { userId, moduleId: quiz.moduleId, enrollmentId } },
      update: { 
        attempts: { increment: 1 },
        lastAccessedAt: new Date(),
        ...(isInitialAttempt && { quizScore: score }) // Score for the initial attempt is the final one
      },
      create: { 
        userId, moduleId: quiz.moduleId, enrollmentId, 
        attempts: 1, 
        status: ProgressStatus.IN_PROGRESS, 
        progress: 0,
        lastAccessedAt: new Date(),
        quizScore: score // Set score for the first attempt ever
      }
    });

    const { StreakService } = require('./streak.service');
    const streakService = new StreakService(prisma);
    await streakService.updateStreakImplementation(userId);

    if (passed) await this.handleQuizPassed(userId, quiz, enrollmentId, score, attempt.id, isInitialAttempt);

    return attempt;
  }

  private async handleQuizPassed(userId: string, quiz: any, enrollmentId: string, score: number, currentAttemptId: string, isInitialAttempt: boolean = false) {
    const moduleId = quiz.moduleId;
    
    // Check if the user has already passed this quiz before (excluding the current attempt)
    const previousPassedAttempt = await prisma.quizAttempt.findFirst({
      where: { 
        userId, 
        quizId: quiz.id, 
        passed: true, 
        NOT: { id: currentAttemptId } 
      }
    });

    const isFirstTimePass = !previousPassedAttempt;

    await prisma.moduleProgress.update({
      where: { userId_moduleId_enrollmentId: { userId, moduleId, enrollmentId } },
      data: { 
        status: ProgressStatus.COMPLETED, 
        progress: 100, 
        completedAt: new Date()
        // Note: quizScore is NOT updated here because it was set for the initial attempt in submitAttempt
      }
    });

    if (isFirstTimePass && isInitialAttempt) {
      const { GamificationService } = require('./gamification.service');
      const gamificationService = new GamificationService(prisma);
      await gamificationService.awardPoints(
        userId, 
        Math.round(score), 
        'QUIZ_COMPLETION', 
        quiz.id, 
        `Passed quiz for module: ${quiz.module?.title}`
      );

      await prisma.activity.create({
        data: {
          userId, type: ActivityType.QUIZ_PASSED, description: `Passed quiz for ${quiz.module?.title} with score ${score}`,
          pointsEarned: Math.round(score),
          metadata: { quizId: quiz.id, moduleId: quiz.moduleId, score }
        }
      });
    } else {
      // Record as a revision/retake without adding points
      await prisma.activity.create({
        data: {
          userId, type: ActivityType.QUIZ_PASSED, description: `Retook and passed quiz for ${quiz.module?.title} with score ${score}`,
          pointsEarned: 0,
          metadata: { quizId: quiz.id, moduleId: quiz.moduleId, score, isRevision: true, isInitialAttempt }
        }
      });
    }
  }
}
