import { Router } from 'express';
import { QuizController } from '../controllers/quiz.controller';
import { QuizService } from '../services/quiz.service';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const quizService = new QuizService();
const quizController = new QuizController(quizService);

router.use(authenticate);

router.post('/', authorize('ADMIN', 'MANAGER'), quizController.createQuiz);
router.get('/module/:moduleId', quizController.getQuizByModuleId);
router.post('/:quizId/submit', quizController.submitAttempt);

export default router;
