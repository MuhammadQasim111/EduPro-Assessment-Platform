
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthState, User, UserRole } from './types';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import ExamEditorView from './views/ExamEditorView';
import ExamRunnerView from './views/ExamRunnerView';
import SubmissionReviewView from './views/SubmissionReviewView';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('auth');
    try {
      return saved ? JSON.parse(saved) : { user: null, token: null, isAuthenticated: false };
    } catch (e) {
      return { user: null, token: null, isAuthenticated: false };
    }
  });

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(auth));
  }, [auth]);

  const handleLogin = (user: User, token: string) => {
    setAuth({ user, token, isAuthenticated: true });
  };

  const handleLogout = () => {
    setAuth({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem('auth');
  };

  // Fixed: explicitly made children optional in ProtectedRoute prop types to satisfy TypeScript validation in Route elements
  const ProtectedRoute = ({ children, roles }: { children?: React.ReactNode, roles?: UserRole[] }) => {
    if (!auth.isAuthenticated) return <Navigate to="/login" replace />;
    if (roles && auth.user && !roles.includes(auth.user.role)) return <Navigate to="/dashboard" replace />;
    
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar user={auth.user!} onLogout={handleLogout} />
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          auth.isAuthenticated ? <Navigate to="/dashboard" /> : <LoginView onLogin={handleLogin} />
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardView user={auth.user!} />
          </ProtectedRoute>
        } />

        <Route path="/exams/edit/:id" element={
          <ProtectedRoute roles={[UserRole.INSTRUCTOR, UserRole.ADMIN]}>
            <ExamEditorView />
          </ProtectedRoute>
        } />

        <Route path="/exams/create" element={
          <ProtectedRoute roles={[UserRole.INSTRUCTOR, UserRole.ADMIN]}>
            <ExamEditorView />
          </ProtectedRoute>
        } />

        <Route path="/exams/take/:id" element={
          <ProtectedRoute roles={[UserRole.STUDENT]}>
            <ExamRunnerView user={auth.user!} />
          </ProtectedRoute>
        } />

        <Route path="/submissions/:id" element={
          <ProtectedRoute>
            <SubmissionReviewView user={auth.user!} />
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
};

export default App;
