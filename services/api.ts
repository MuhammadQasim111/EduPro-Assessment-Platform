
import { User, UserRole, Exam, Question, ExamStatus, Submission, QuestionType } from '../types';

// Simulate Database Tables
const DB_USERS = 'edupro_users';
const DB_EXAMS = 'edupro_exams';
const DB_SUBMISSIONS = 'edupro_submissions';

// Initial Seed Data
const seedData = () => {
  if (!localStorage.getItem(DB_USERS)) {
    localStorage.setItem(DB_USERS, JSON.stringify([
      { id: '1', email: 'admin@edupro.com', fullName: 'System Admin', role: UserRole.ADMIN, isActive: true },
      { id: '2', email: 'jane@edupro.com', fullName: 'Jane Instructor', role: UserRole.INSTRUCTOR, isActive: true },
      { id: '3', email: 'john@edupro.com', fullName: 'John Student', role: UserRole.STUDENT, isActive: true }
    ]));
  }

  if (!localStorage.getItem(DB_EXAMS)) {
    localStorage.setItem(DB_EXAMS, JSON.stringify([
      {
        id: 'exam_1',
        title: 'Introduction to Cloud Computing',
        description: 'Covers basic AWS, GCP, and Azure concepts.',
        instructorId: '2',
        durationMinutes: 45,
        status: ExamStatus.PUBLISHED,
        createdAt: new Date().toISOString(),
        questions: [
          {
            id: 'q1',
            type: QuestionType.MULTIPLE_CHOICE,
            text: 'Which service is used for scalable virtual servers in AWS?',
            points: 10,
            options: ['S3', 'EC2', 'RDS', 'Lambda'],
            correctAnswer: 'EC2'
          },
          {
            id: 'q2',
            type: QuestionType.TRUE_FALSE,
            text: 'Serverless computing means there are no servers involved.',
            points: 5,
            correctAnswer: 'False'
          }
        ]
      }
    ]));
  }
};

seedData();

const getFromDB = <T,>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]');
const saveToDB = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

export const AssessmentAPI = {
  // Exams
  getExams: async (): Promise<Exam[]> => {
    return getFromDB<Exam>(DB_EXAMS);
  },
  getExamById: async (id: string): Promise<Exam | undefined> => {
    const exams = getFromDB<Exam>(DB_EXAMS);
    return exams.find(e => e.id === id);
  },
  saveExam: async (exam: Exam): Promise<void> => {
    const exams = getFromDB<Exam>(DB_EXAMS);
    const idx = exams.findIndex(e => e.id === exam.id);
    if (idx >= 0) exams[idx] = exam;
    else exams.push(exam);
    saveToDB(DB_EXAMS, exams);
  },

  // Submissions
  getSubmissions: async (userId?: string, examId?: string): Promise<Submission[]> => {
    let subs = getFromDB<Submission>(DB_SUBMISSIONS);
    if (userId) subs = subs.filter(s => s.studentId === userId);
    if (examId) subs = subs.filter(s => s.examId === examId);
    return subs;
  },
  getSubmissionById: async (id: string): Promise<Submission | undefined> => {
    return getFromDB<Submission>(DB_SUBMISSIONS).find(s => s.id === id);
  },
  submitExam: async (submission: Submission): Promise<Submission> => {
    const subs = getFromDB<Submission>(DB_SUBMISSIONS);
    const exam = (await AssessmentAPI.getExamById(submission.examId))!;
    
    // Auto-grade simple types
    let score = 0;
    let totalPoints = 0;
    exam.questions.forEach(q => {
      totalPoints += q.points;
      if (submission.answers[q.id] === q.correctAnswer) {
        score += q.points;
      }
    });

    const finalSubmission = { ...submission, score, totalPoints };
    subs.push(finalSubmission);
    saveToDB(DB_SUBMISSIONS, subs);
    return finalSubmission;
  },

  // Users
  getUsers: async (): Promise<User[]> => getFromDB<User>(DB_USERS),
  getUserByEmail: async (email: string): Promise<User | undefined> => {
    return getFromDB<User>(DB_USERS).find(u => u.email === email);
  }
};
