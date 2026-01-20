import { PrismaClient, Quiz, QuizAttempt, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class QuizRepository {
  static async create(data: Prisma.QuizCreateInput): Promise<Quiz> {
    return await prisma.quiz.create({
      data
    });
  }

  static async update(id: string, data: Prisma.QuizUpdateInput): Promise<Quiz> {
    return await prisma.quiz.update({
      where: { id },
      data
    });
  }

  static async findById(id: string, includeQuestions: boolean = true): Promise<Quiz | null> {
    return await prisma.quiz.findUnique({
      where: { id },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            learningPathId: true
          }
        }
      }
    });
  }

  static async findByModuleId(moduleId: string): Promise<Quiz | null> {
    return await prisma.quiz.findFirst({
      where: { moduleId, isActive: true }
    });
  }

  static async delete(id: string): Promise<Quiz> {
    return await prisma.quiz.delete({
      where: { id }
    });
  }

  static async createAttempt(data: Prisma.QuizAttemptCreateInput): Promise<QuizAttempt> {
    return await prisma.quizAttempt.create({
      data
    });
  }

  static async findAttemptsByUser(userId: string, quizId: string): Promise<QuizAttempt[]> {
    return await prisma.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { attemptNumber: 'desc' }
    });
  }

  static async findLastAttempt(userId: string, quizId: string): Promise<QuizAttempt | null> {
    return await prisma.quizAttempt.findFirst({
      where: { userId, quizId },
      orderBy: { attemptNumber: 'desc' }
    });
  }
}
