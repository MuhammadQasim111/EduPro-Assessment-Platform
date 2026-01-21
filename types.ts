
export enum UserRole {
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  CODE = 'CODE'
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  points: number;
  options?: string[]; // For MCQ
  correctAnswer: string;
  explanation?: string;
}

export enum ExamStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  durationMinutes: number;
  questions: Question[];
  status: ExamStatus;
  createdAt: string;
}

export interface Submission {
  id: string;
  examId: string;
  studentId: string;
  answers: Record<string, string>; // questionId -> answer
  score?: number;
  totalPoints?: number;
  submittedAt: string;
  aiFeedback?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
