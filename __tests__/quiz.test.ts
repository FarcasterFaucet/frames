import { Quiz, QuizStructure, Question, CheckResult } from '../api/quiz/index.ts'

function generateQuestion(correctAnswerIndex: number): Question {
  const numAnswers = Quiz.expectedAnswersCount
  const question: Question = {
    question: 'Random question?',
    answers: [],
    correctAnswerIndex: correctAnswerIndex,
  }

  // Generate random answers
  for (let i = 0; i < numAnswers; i++) {
    question.answers.push(`Answer ${i + 1}`)
  }

  return question
}

describe('Quiz', () => {
  let quizStructure: QuizStructure

  beforeEach(() => {
    quizStructure = {
      questions: [
        generateQuestion(2), // Correct answer at index 2
        generateQuestion(1), // Correct answer at index 1
      ],
    }
  })

  it('should validate quiz structure', () => {
    expect(Quiz.validateQuizStructure(quizStructure)).toBe(true)
  })

  it('should check correct answer', () => {
    const quiz = new Quiz(quizStructure)
    const result: CheckResult = quiz.check(2)
    expect(result.isCorrect).toBe(true) // Correct answer for first question
    expect(result.points).toBe(1)
    expect(result.nextQuestionId).toBe(1)
  })

  it('should check incorrect answer', () => {
    const quiz = new Quiz(quizStructure)
    const result: CheckResult = quiz.check(1)
    expect(result.isCorrect).toBe(false) // Incorrect answer for first question
    expect(result.points).toBe(0)
    expect(result.nextQuestionId).toBe(1)
  })

  it('should handle last question', () => {
    const quiz = new Quiz(quizStructure, 1) // Start with second question
    const result: CheckResult = quiz.check(1)
    expect(result.isCorrect).toBe(true) // Correct answer for second question
    expect(result.points).toBe(1)
    expect(result.nextQuestionId).toBeNull()
  })

  it('should return false for invalid quiz structure', () => {
    const invalidQuizStructure: QuizStructure = {
      questions: [
        generateQuestion(1), // Correct answer at index 1
      ],
    }
    invalidQuizStructure.questions[0].answers.pop() // make the number of answers less than expected
    expect(Quiz.validateQuizStructure(invalidQuizStructure)).toBe(false)
  })

  it('should handle empty quiz structure', () => {
    const emptyQuizStructure: QuizStructure = { questions: [] }
    expect(() => new Quiz(emptyQuizStructure)).toThrow()
  })

  it('should not accept answer index out of bounds', () => {
    const quiz = new Quiz(quizStructure)
    const result: CheckResult = quiz.check(10)
    expect(result.isCorrect).toBe(false)
    expect(result.points).toBe(0)
    expect(result.nextQuestionId).toBe(1)
  })

  it('should handle questions with the same answers', () => {
    const sameAnswersQuizStructure: QuizStructure = {
      questions: [
        {
          question: 'Which one?',
          answers: ['A', 'A', 'A'],
          correctAnswerIndex: 1,
        },
      ],
    }
    const quiz = new Quiz(sameAnswersQuizStructure)
    const result: CheckResult = quiz.check(1)
    expect(result.isCorrect).toBe(true)
    expect(result.points).toBe(1)
    expect(result.nextQuestionId).toBeNull()
  })

  it('should handle negative answer index', () => {
    const quiz = new Quiz(quizStructure)
    const result: CheckResult = quiz.check(-1)
    expect(result.isCorrect).toBe(false)
    expect(result.points).toBe(0)
    expect(result.nextQuestionId).toBe(1)
  })

  it('should return false for check if no current question', () => {
    const emptyQuizStructure: QuizStructure = { questions: [] }
    expect(() => new Quiz(emptyQuizStructure)).toThrow()
  })

  it('should handle quiz with maximum points', () => {
    const maxPointsQuizStructure: QuizStructure = {
      questions: [generateQuestion(0), generateQuestion(1), generateQuestion(2), generateQuestion(1)],
    }
    const quiz = new Quiz(maxPointsQuizStructure)
    quiz.check(0)
    quiz.currentQuestionIndex++
    quiz.check(1)
    quiz.currentQuestionIndex++
    quiz.check(2)
    quiz.currentQuestionIndex++
    const result: CheckResult = quiz.check(1)
    expect(result.points).toBe(1)
    expect(result.isCorrect).toBe(true)
    expect(result.nextQuestionId).toBeNull()
  })
})
