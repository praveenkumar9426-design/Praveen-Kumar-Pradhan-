export interface Module {
  title: string;
  summary: string;
  markdownContent?: string;
  technicalNote?: string;
  takeaways: string[];
  keyTerms: { term: string; definition: string }[];
}

export interface Course {
  id: string;
  subject: string;
  modules: Module[];
  createdAt: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  status: 'learning' | 'mastered';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface SavedActivity {
  courseId: string;
  subject: string;
  score?: number;
  totalQuestions?: number;
  flashcardProgress?: { mastered: number; total: number };
  lastActive: string;
}
