
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AssessmentAPI } from '../services/api';
import { Exam, Question, User, Submission, QuestionType } from '../types';

interface ExamRunnerViewProps {
  user: User;
}

const ExamRunnerView: React.FC<ExamRunnerViewProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      if (id) {
        const found = await AssessmentAPI.getExamById(id);
        if (found) {
          setExam(found);
          setTimeLeft(found.durationMinutes * 60);
        }
      }
    };
    fetchExam();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0 && exam) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, exam]);

  const handleSubmit = useCallback(async () => {
    if (!exam || isSubmitting) return;
    setIsSubmitting(true);

    const submission: Submission = {
      id: `sub_${Date.now()}`,
      examId: exam.id,
      studentId: user.id,
      answers,
      submittedAt: new Date().toISOString()
    };

    const result = await AssessmentAPI.submitExam(submission);
    navigate(`/submissions/${result.id}`);
  }, [exam, user, answers, navigate, isSubmitting]);

  if (!exam) return <div className="p-8">Loading Exam Session...</div>;

  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HUD Header */}
      <div className="sticky top-0 z-10 bg-white shadow-md p-6 rounded-2xl flex justify-between items-center mb-8 border border-slate-100">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800">{exam.title}</h2>
          <div className="flex items-center text-sm text-slate-500">
            <span className="mr-4">Question {currentQuestionIndex + 1} of {exam.questions.length}</span>
            <div className="w-48 h-2 bg-slate-100 rounded-full">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-50 text-slate-700'}`}>
          <i className="far fa-clock"></i>
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Question Canvas */}
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 min-h-[400px] flex flex-col justify-between">
        <div>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider mb-4 inline-block">
            {currentQuestion.points} Points
          </span>
          <h3 className="text-2xl font-medium text-slate-900 mb-8 leading-relaxed">
            {currentQuestion.text}
          </h3>

          <div className="space-y-4">
            {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && currentQuestion.options?.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center group ${
                  answers[currentQuestion.id] === option 
                  ? 'border-blue-600 bg-blue-50 text-blue-900' 
                  : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 text-sm font-bold transition ${
                  answers[currentQuestion.id] === option ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-lg">{option}</span>
              </button>
            ))}

            {currentQuestion.type === QuestionType.TRUE_FALSE && (
              <div className="flex space-x-4">
                {['True', 'False'].map(val => (
                  <button
                    key={val}
                    onClick={() => handleAnswerSelect(val)}
                    className={`flex-1 p-8 rounded-2xl border-2 text-xl font-bold transition ${
                      answers[currentQuestion.id] === val ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-100 hover:border-blue-200 text-slate-400'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 flex justify-between items-center border-t border-slate-100 pt-8">
          <button
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            className="px-6 py-3 text-slate-500 hover:text-slate-800 font-bold transition disabled:opacity-30"
          >
            <i className="fas fa-arrow-left mr-2"></i> Previous
          </button>

          {currentQuestionIndex === exam.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold transition shadow-lg shadow-green-100 flex items-center"
            >
              {isSubmitting ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-paper-plane mr-2"></i>}
              Finish & Submit
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition shadow-lg shadow-blue-100"
            >
              Next Question <i className="fas fa-arrow-right ml-2"></i>
            </button>
          )}
        </div>
      </div>

      {/* Navigator Map */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Question Map</h4>
        <div className="flex flex-wrap gap-2">
          {exam.questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition ${
                currentQuestionIndex === idx ? 'bg-blue-600 text-white shadow-lg' : answers[q.id] ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamRunnerView;
