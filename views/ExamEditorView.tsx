
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AssessmentAPI } from '../services/api';
import { Exam, Question, QuestionType, ExamStatus } from '../types';

const ExamEditorView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Partial<Exam>>({
    title: '',
    description: '',
    durationMinutes: 60,
    questions: [],
    status: ExamStatus.DRAFT
  });

  useEffect(() => {
    if (id) {
      AssessmentAPI.getExamById(id).then(found => {
        if (found) setExam(found);
      });
    }
  }, [id]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type: QuestionType.MULTIPLE_CHOICE,
      text: '',
      points: 5,
      options: ['', '', '', ''],
      correctAnswer: ''
    };
    setExam(prev => ({ ...prev, questions: [...(prev.questions || []), newQuestion] }));
  };

  const updateQuestion = (qId: string, updates: Partial<Question>) => {
    setExam(prev => ({
      ...prev,
      questions: prev.questions?.map(q => q.id === qId ? { ...q, ...updates } : q)
    }));
  };

  const handleSave = async () => {
    if (!exam.title) return alert('Title is required');
    await AssessmentAPI.saveExam({
      ...exam,
      id: exam.id || `exam_${Date.now()}`,
      instructorId: '2',
      createdAt: exam.createdAt || new Date().toISOString()
    } as Exam);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <header className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{id ? 'Edit Assessment' : 'New Assessment'}</h1>
          <p className="text-slate-500">Define your curriculum metrics and performance benchmarks.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => navigate('/dashboard')} className="px-6 py-3 text-slate-500 hover:text-slate-800 font-bold transition">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition shadow-lg shadow-blue-100 flex items-center"
          >
            <i className="fas fa-save mr-2"></i> Save Assessment
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">General Settings</h2>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Exam Title</label>
              <input 
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={exam.title}
                onChange={e => setExam({ ...exam, title: e.target.value })}
                placeholder="e.g. Advanced Architecture 202"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
              <textarea 
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition h-24"
                value={exam.description}
                onChange={e => setExam({ ...exam, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Duration (Minutes)</label>
              <input 
                type="number"
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={exam.durationMinutes}
                onChange={e => setExam({ ...exam, durationMinutes: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Publish Status</label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={exam.status}
                onChange={e => setExam({ ...exam, status: e.target.value as ExamStatus })}
              >
                <option value={ExamStatus.DRAFT}>Draft (Private)</option>
                <option value={ExamStatus.PUBLISHED}>Published (Visible)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Question Builder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">Questions ({exam.questions?.length || 0})</h2>
            <button 
              onClick={addQuestion}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition flex items-center"
            >
              <i className="fas fa-plus mr-2"></i> Add Question
            </button>
          </div>

          <div className="space-y-6">
            {exam.questions?.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 group relative">
                <div className="flex justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-500">
                      {idx + 1}
                    </span>
                    <select 
                      className="p-2 bg-slate-50 border-none rounded-lg text-sm font-bold text-slate-600 focus:ring-0"
                      value={q.type}
                      onChange={e => updateQuestion(q.id, { type: e.target.value as QuestionType })}
                    >
                      <option value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</option>
                      <option value={QuestionType.TRUE_FALSE}>True / False</option>
                      <option value={QuestionType.SHORT_ANSWER}>Short Answer</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="number"
                      className="w-16 p-2 bg-slate-50 rounded-lg text-center text-sm font-bold text-blue-600"
                      value={q.points}
                      onChange={e => updateQuestion(q.id, { points: parseInt(e.target.value) })}
                    />
                    <span className="text-[10px] font-black text-slate-300 uppercase">Pts</span>
                    <button 
                      onClick={() => setExam(prev => ({ ...prev, questions: prev.questions?.filter(item => item.id !== q.id) }))}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <textarea 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition mb-6 font-medium text-lg"
                  placeholder="Type your question prompt here..."
                  value={q.text}
                  onChange={e => updateQuestion(q.id, { text: e.target.value })}
                />

                {q.type === QuestionType.MULTIPLE_CHOICE && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options?.map((opt, oIdx) => (
                      <div key={oIdx} className="relative flex items-center">
                        <input 
                          type="radio" 
                          name={`correct-${q.id}`} 
                          checked={q.correctAnswer === opt && opt !== ''}
                          onChange={() => updateQuestion(q.id, { correctAnswer: opt })}
                          className="mr-3"
                        />
                        <input 
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                          placeholder={`Option ${oIdx + 1}`}
                          value={opt}
                          onChange={e => {
                            const newOpts = [...(q.options || [])];
                            newOpts[oIdx] = e.target.value;
                            updateQuestion(q.id, { options: newOpts });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {q.type === QuestionType.TRUE_FALSE && (
                  <div className="flex space-x-4">
                    {['True', 'False'].map(v => (
                      <button 
                        key={v}
                        onClick={() => updateQuestion(q.id, { correctAnswer: v })}
                        className={`flex-1 py-4 rounded-xl border-2 font-bold transition ${q.correctAnswer === v ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-100 text-slate-400'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="mt-6">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Explanation (Optional)</label>
                  <input 
                    className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs"
                    placeholder="Why is the correct answer correct?"
                    value={q.explanation || ''}
                    onChange={e => updateQuestion(q.id, { explanation: e.target.value })}
                  />
                </div>
              </div>
            ))}

            {(!exam.questions || exam.questions.length === 0) && (
              <div className="p-20 border-4 border-dashed border-slate-200 rounded-3xl text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <i className="fas fa-layer-group text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800">No Questions Yet</h3>
                <p className="text-slate-500 mt-2">Start by adding your first evaluation metric.</p>
                <button 
                  onClick={addQuestion}
                  className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-100"
                >
                  Create First Question
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamEditorView;
