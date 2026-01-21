
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AssessmentAPI } from '../services/api';
import { getAIGradingFeedback } from '../services/aiService';
import { Exam, Submission, User } from '../types';

interface SubmissionReviewViewProps {
  user: User;
}

const SubmissionReviewView: React.FC<SubmissionReviewViewProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const sub = await AssessmentAPI.getSubmissionById(id);
        if (sub) {
          setSubmission(sub);
          const foundExam = await AssessmentAPI.getExamById(sub.examId);
          if (foundExam) setExam(foundExam);
        }
      }
    };
    fetchData();
  }, [id]);

  const generateAIAnalysis = async () => {
    if (!exam || !submission) return;
    setLoadingAI(true);
    const feedback = await getAIGradingFeedback(exam, submission);
    setAiFeedback(feedback);
    setLoadingAI(false);
  };

  if (!exam || !submission) return <div className="p-8">Loading Results...</div>;

  const scorePercentage = Math.round((submission.score! / submission.totalPoints!) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-12 text-center text-white relative">
          <div className="absolute top-8 left-8">
            <Link to="/dashboard" className="text-slate-400 hover:text-white transition flex items-center">
              <i className="fas fa-chevron-left mr-2"></i> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-4xl font-black mb-4 tracking-tight">{exam.title}</h1>
          <p className="text-slate-400">Submission Result Summary</p>
          
          <div className="mt-10 flex justify-center items-center space-x-12">
            <div className="text-center">
              <div className="text-5xl font-black text-blue-500 mb-2">{submission.score}</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Points Earned</div>
            </div>
            <div className="w-px h-16 bg-slate-800"></div>
            <div className="text-center">
              <div className={`text-6xl font-black mb-2 ${scorePercentage >= 70 ? 'text-green-500' : 'text-orange-500'}`}>
                {scorePercentage}%
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Total Score</div>
            </div>
            <div className="w-px h-16 bg-slate-800"></div>
            <div className="text-center">
              <div className="text-5xl font-black text-slate-300 mb-2">{submission.totalPoints}</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Possible Points</div>
            </div>
          </div>
        </div>

        <div className="p-12 space-y-12">
          {/* AI Feedback Section */}
          <section className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-blue-900 flex items-center">
                <i className="fas fa-robot mr-3 text-blue-500"></i>
                AI Performance Analysis
              </h2>
              {!aiFeedback && (
                <button 
                  onClick={generateAIAnalysis}
                  disabled={loadingAI}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition flex items-center shadow-lg shadow-blue-100"
                >
                  {loadingAI ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-sparkles mr-2"></i>}
                  Generate Insights
                </button>
              )}
            </div>
            {aiFeedback ? (
              <div className="prose prose-blue max-w-none text-blue-800 leading-relaxed whitespace-pre-line">
                {aiFeedback}
              </div>
            ) : (
              <div className="text-blue-400 italic text-center py-4">
                Click the button above for automated cognitive performance breakdown.
              </div>
            )}
          </section>

          {/* Detailed Question Review */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Detailed Review</h2>
            <div className="space-y-4">
              {exam.questions.map((q, idx) => {
                const isCorrect = submission.answers[q.id] === q.correctAnswer;
                return (
                  <div key={q.id} className={`p-6 rounded-2xl border-2 ${isCorrect ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-800">{q.text}</h4>
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrect ? `+${q.points} Points` : '0 Points'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-white rounded-xl border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Your Answer</span>
                        <div className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {submission.answers[q.id] || '(Skipped)'}
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Correct Solution</span>
                        <div className="font-medium text-slate-900">{q.correctAnswer}</div>
                      </div>
                    </div>
                    {q.explanation && (
                      <div className="mt-4 text-sm text-slate-500 italic bg-slate-50 p-3 rounded-lg">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SubmissionReviewView;
