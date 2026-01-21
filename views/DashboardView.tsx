
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AssessmentAPI } from '../services/api';
import { Exam, User, UserRole, Submission, ExamStatus } from '../types';

interface DashboardViewProps {
  user: User;
}

const DashboardView: React.FC<DashboardViewProps> = ({ user }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const allExams = await AssessmentAPI.getExams();
      const allSubs = await AssessmentAPI.getSubmissions(
        user.role === UserRole.STUDENT ? user.id : undefined
      );
      setExams(allExams);
      setSubmissions(allSubs);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.fullName}</h1>
          <p className="text-slate-500">Here's what's happening in your assessment portal today.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Server Status</p>
          <div className="flex items-center justify-end text-green-500 text-sm font-semibold">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
            Operational
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <i className="fas fa-file-alt text-xl"></i>
            </div>
            <span className="text-xs font-bold text-slate-400">Total Exams</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{exams.length}</div>
          <p className="text-sm text-slate-500 mt-1">Available in library</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <i className="fas fa-check-circle text-xl"></i>
            </div>
            <span className="text-xs font-bold text-slate-400">Submissions</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{submissions.length}</div>
          <p className="text-sm text-slate-500 mt-1">Processed results</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <i className="fas fa-users text-xl"></i>
            </div>
            <span className="text-xs font-bold text-slate-400">Avg. Score</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {submissions.length > 0 
              ? Math.round((submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submissions.reduce((acc, s) => acc + (s.totalPoints || 1), 0)) * 100) + '%'
              : 'N/A'
            }
          </div>
          <p className="text-sm text-slate-500 mt-1">Performance metric</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Exams List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Available Exams</h2>
            <Link to="/exams/create" className="text-sm text-blue-600 font-semibold hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {exams.map(exam => (
              <div key={exam.id} className="p-6 hover:bg-slate-50 transition flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800">{exam.title}</h3>
                  <p className="text-sm text-slate-500 flex items-center mt-1">
                    <i className="far fa-clock mr-2"></i> {exam.durationMinutes} mins • {exam.questions.length} questions
                  </p>
                </div>
                {user.role === UserRole.STUDENT ? (
                  <Link 
                    to={`/exams/take/${exam.id}`}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition"
                  >
                    Start Test
                  </Link>
                ) : (
                  <Link 
                    to={`/exams/edit/${exam.id}`}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200 transition"
                  >
                    Manage
                  </Link>
                )}
              </div>
            ))}
            {exams.length === 0 && <div className="p-8 text-center text-slate-400">No exams published.</div>}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Recent Results</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {submissions.map(sub => {
              const exam = exams.find(e => e.id === sub.examId);
              return (
                <Link to={`/submissions/${sub.id}`} key={sub.id} className="p-6 hover:bg-slate-50 transition flex justify-between items-center group">
                  <div>
                    <h3 className="font-bold text-slate-800">{exam?.title || 'Unknown Exam'}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{sub.score} / {sub.totalPoints}</div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-blue-500 transition">View Details →</span>
                  </div>
                </Link>
              );
            })}
            {submissions.length === 0 && <div className="p-8 text-center text-slate-400">No submissions yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
