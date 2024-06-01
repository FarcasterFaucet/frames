export interface Question {
  question: string
  answers: string[]
  correctAnswerIndex: number
}

export interface QuizStructure {
  questions: Question[]
}

export interface CheckResult {
  isCorrect: boolean
  points: number
  nextQuestionId: number | null
}

export class Quiz {
  public questions: Question[]
  public currentQuestionIndex: number
  public points: number
  public static readonly expectedAnswersCount: number = 3

  constructor(quizStructure: QuizStructure, currentQuestionIndex: number = 0, points: number = 0) {
    if (quizStructure.questions.length === 0) {
      throw new Error('Quiz should have at least one question')
    }

    this.questions = quizStructure.questions
    this.currentQuestionIndex = currentQuestionIndex
    this.points = points
  }

  /**
   * Validate the structure of the quiz.
   * @param quizStructure - The quiz structure to validate.
   * @returns Whether the quiz structure is valid.
   */
  static validateQuizStructure(quizStructure: QuizStructure): boolean {
    if (!quizStructure.questions || quizStructure.questions.length === 0) {
      return false
    }

    for (const question of quizStructure.questions) {
      if (
        question.answers.length !== Quiz.expectedAnswersCount ||
        question.correctAnswerIndex < 0 ||
        question.correctAnswerIndex >= Quiz.expectedAnswersCount
      ) {
        return false
      }
    }

    return true
  }

  /**
   * Check the answer for the current question.
   * @param answerId - The index of the selected answer.
   * @returns An object with info about correctness, points, and next question ID.
   */
  check(answerId: number): CheckResult {
    const isCorrect = this.questions[this.currentQuestionIndex].correctAnswerIndex === answerId
    const points = this.points + (isCorrect ? 1 : 0)
    const nextQuestionId = this.currentQuestionIndex < this.questions.length - 1 ? this.currentQuestionIndex + 1 : null

    return {
      isCorrect,
      points,
      nextQuestionId,
    }
  }
}
