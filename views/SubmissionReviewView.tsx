
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

  if (!exam || !submission) return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium">Retrieving results from secure storage...</p>
    </div>
  );

  const scorePercentage = Math.round((submission.score! / (submission.totalPoints || 1)) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in pb-20">
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-12 text-center text-white relative">
          <div className="absolute top-8 left-8">
            <Link to="/dashboard" className="text-slate-400 hover:text-white transition-all flex items-center group">
              <i className="fas fa-chevron-left mr-2 group-hover:-translate-x-1 transition-transform"></i> 
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-4xl font-black mb-4 tracking-tight leading-tight">{exam.title}</h1>
          <p className="text-slate-400 font-medium">Submission Performance Report</p>
          
          <div className="mt-12 flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-5xl font-black text-blue-500 mb-2">{submission.score}</div>
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">Points Earned</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-slate-800"></div>
            <div className="text-center scale-110">
              <div className={`text-6xl font-black mb-2 ${scorePercentage >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {scorePercentage}%
              </div>
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">Mastery Index</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-slate-800"></div>
            <div className="text-center">
              <div className="text-5xl font-black text-slate-400 mb-2">{submission.totalPoints}</div>
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">Max Possible</div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          {/* AI Feedback Section */}
          <section className="bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <i className="fas fa-robot text-8xl text-blue-600"></i>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <i className="fas fa-sparkles text-white"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">AI Cognitive Feedback</h2>
                  <p className="text-sm text-slate-500">Professional analysis by Gemini Intelligence</p>
                </div>
              </div>
              {!aiFeedback && (
                <button 
                  onClick={generateAIAnalysis}
                  disabled={loadingAI}
                  className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all flex items-center justify-center shadow-xl shadow-blue-200 hover:-translate-y-0.5"
                >
                  {loadingAI ? <i className="fas fa-spinner fa-spin mr-3"></i> : <i className="fas fa-microchip mr-3"></i>}
                  Compute Insights
                </button>
              )}
            </div>

            {aiFeedback ? (
              <div className="prose prose-slate prose-blue max-w-none bg-white p-8 rounded-2xl border border-slate-100 shadow-sm animate-in">
                {aiFeedback.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0">{line}</p>
                ))}
              </div>
            ) : (
              <div className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-slate-200 rounded-2xl py-12 text-center">
                <p className="text-slate-400 font-medium">Click "Compute Insights" to generate a deep pedagogical review of your performance.</p>
              </div>
            )}
          </section>

          {/* Detailed Question Review */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center">
              <span className="w-2 h-8 bg-blue-600 rounded-full mr-4"></span>
              Assessment Breakdown
            </h2>
            <div className="space-y-6">
              {exam.questions.map((q, idx) => {
                const isCorrect = submission.answers[q.id] === q.correctAnswer;
                return (
                  <div key={q.id} className={`group p-8 rounded-[2rem] border-2 transition-all ${isCorrect ? 'border-emerald-100 bg-emerald-50/20' : 'border-rose-100 bg-rose-50/20'}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                      <div className="flex items-center space-x-4">
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-800 text-lg">{q.text}</h4>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {isCorrect ? 'Full Credit' : 'No Credit'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm group-hover:border-blue-100 transition-colors">
                        <span className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest">Your Response</span>
                        <div className={`text-lg font-bold ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {submission.answers[q.id] || <span className="text-slate-300 italic">No response provided</span>}
                        </div>
                      </div>
                      <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm group-hover:border-blue-100 transition-colors">
                        <span className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest">Solution Protocol</span>
                        <div className="text-lg font-bold text-slate-900">{q.correctAnswer}</div>
                      </div>
                    </div>
                    {q.explanation && (
                      <div className="mt-6 flex items-start space-x-3 bg-slate-100/50 p-4 rounded-xl border border-slate-100">
                        <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          <strong className="text-slate-800">Rationale:</strong> {q.explanation}
                        </p>
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
