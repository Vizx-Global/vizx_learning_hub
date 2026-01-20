import { Request, Response } from 'express';
import { QuizService } from '../services/quiz.service';
import { NotFoundError, ValidationError } from '../utils/error-handler';

export class QuizController {
  constructor(private quizService: QuizService) {}

  createQuiz = async (req: Request, res: Response) => {
    try {
      const quiz = await this.quizService.createQuiz(req.body);
      return res.status(201).json({
        success: true,
        data: quiz
      });
    } catch (error) {
      return this.handleError(res, error, 'Failed to create quiz');
    }
  };

  getQuizByModuleId = async (req: Request, res: Response) => {
    try {
      const { moduleId } = req.params;
      if (!moduleId) {
        throw new ValidationError('Module ID is required');
      }
      const quiz = await this.quizService.getQuizByModuleId(moduleId);
      
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'No quiz found for this module'
        });
      }

      return res.status(200).json({
        success: true,
        data: quiz
      });
    } catch (error) {
      return this.handleError(res, error, 'Failed to fetch quiz');
    }
  };

  submitAttempt = async (req: Request, res: Response) => {
    try {
      const { quizId } = req.params;
      const { enrollmentId, answers } = req.body;
      const userId = (req as any).user.id;

      if (!quizId) {
        throw new ValidationError('Quiz ID is required');
      }

      if (!enrollmentId || !answers) {
        throw new ValidationError('Enrollment ID and answers are required');
      }

      const attempt = await this.quizService.submitAttempt(userId, quizId, enrollmentId, answers);
      
      return res.status(200).json({
        success: true,
        data: attempt
      });
    } catch (error) {
      return this.handleError(res, error, 'Failed to submit quiz attempt');
    }
  };

  private handleError(res: Response, error: any, defaultMessage: string) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error instanceof NotFoundError) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: defaultMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
