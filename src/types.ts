export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  CHAT_INTERROGATION = 'CHAT_INTERROGATION',
}

export interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  type: QuestionType;
  text: string;
  choices?: Choice[];
  correctAnswer?: boolean | string;
  explanation: string;
  storyContext?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AppState {
  currentStep: 'intro' | 'story' | 'quiz' | 'results';
  currentQuestionIndex: number;
  score: number;
  points: number;
  level: number;
  badges: string[];
  consecutiveCorrect: number;
  userAnswers: { questionId: number; isCorrect: boolean }[];
  bgHue: number;
}
