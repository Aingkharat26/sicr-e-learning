import { Injectable, inject, signal } from '@angular/core';
import { MOCK_QUIZZES, Quiz, QuizAttempt, QuizQuestion } from '../models/quiz.model';
import { CoursesService } from './courses.service';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private readonly coursesService = inject(CoursesService);
  private readonly _quizzes = signal<Quiz[]>(MOCK_QUIZZES);
  private readonly _attempts = signal<Record<string, QuizAttempt>>({});

  readonly quizzes = this._quizzes.asReadonly();
  readonly attempts = this._attempts.asReadonly();

  getQuizById(quizId: string): Quiz | undefined {
    return this._quizzes().find((q) => q.id === quizId);
  }

  getQuizByLessonId(lessonId: string): Quiz | undefined {
    return this._quizzes().find((q) => q.lessonId === lessonId);
  }

  getLatestAttempt(quizId: string): QuizAttempt | undefined {
    return this._attempts()[quizId];
  }

  submitQuiz(
    quizId: string,
    answers: Record<string, string[]>,
    timeSpentSeconds: number
  ): QuizAttempt | undefined {
    const quiz = this.getQuizById(quizId);
    if (!quiz) return undefined;

    let earnedScore = 0;
    let maxScore = 0;

    quiz.questions.forEach((q) => {
      maxScore += q.points;
      const selected = answers[q.id] || [];
      const correct = q.correctAnswerIds;

      // Check if exact match
      if (
        selected.length === correct.length &&
        selected.every((id) => correct.includes(id))
      ) {
        earnedScore += q.points;
      }
    });

    const percent = maxScore > 0 ? Math.round((earnedScore / maxScore) * 100) : 0;
    const isPassed = percent >= quiz.passingScorePercent;

    const attempt: QuizAttempt = {
      quizId,
      courseId: quiz.courseId,
      answers,
      score: earnedScore,
      maxScore,
      percent,
      isPassed,
      timeSpentSeconds,
      submittedAt: new Date().toISOString(),
    };

    // Save attempt
    this._attempts.update((current) => ({
      ...current,
      [quizId]: attempt,
    }));

    // If passed, auto-complete the course lesson in CoursesService
    if (isPassed && quiz.lessonId) {
      const course = this.coursesService.getCourseById(quiz.courseId);
      if (course) {
        const lesson = course.modules
          .flatMap((m) => m.lessons)
          .find((l) => l.id === quiz.lessonId);
        if (lesson && !lesson.isCompleted) {
          this.coursesService.toggleLessonCompletion(course.id, quiz.lessonId);
        }
      }
    }

    return attempt;
  }
}
