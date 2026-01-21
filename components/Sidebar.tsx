
import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, UserRole } from '../types';
import { APP_NAME, ROLE_BADGE_STYLES } from '../constants';

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col shadow-xl">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <i className="fas fa-graduation-cap text-xl"></i>
        </div>
        <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
      </div>

      <div className="p-6 flex flex-col items-center border-b border-slate-800">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-3">
          <i className="fas fa-user text-3xl text-slate-400"></i>
        </div>
        <h4 className="font-semibold text-sm">{user.fullName}</h4>
        <span className={`mt-2 text-[10px] px-2 py-1 rounded-full uppercase font-bold ${ROLE_BADGE_STYLES[user.role]}`}>
          {user.role}
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink to="/dashboard" className={({isActive}) => 
          `flex items-center space-x-3 p-3 rounded-lg transition ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
        }>
          <i className="fas fa-chart-line w-5"></i>
          <span>Dashboard</span>
        </NavLink>

        {(user.role === UserRole.INSTRUCTOR || user.role === UserRole.ADMIN) && (
          <>
            <NavLink to="/exams/create" className={({isActive}) => 
              `flex items-center space-x-3 p-3 rounded-lg transition ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
            }>
              <i className="fas fa-plus-circle w-5"></i>
              <span>Create Exam</span>
            </NavLink>
            <NavLink to="/users" className="flex items-center space-x-3 p-3 text-slate-400 rounded-lg transition hover:bg-slate-800 hover:text-white">
              <i className="fas fa-users w-5"></i>
              <span>User Management</span>
            </NavLink>
          </>
        )}

        <NavLink to="/settings" className="flex items-center space-x-3 p-3 text-slate-400 rounded-lg transition hover:bg-slate-800 hover:text-white">
          <i className="fas fa-cog w-5"></i>
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 p-3 bg-slate-800 hover:bg-red-900 rounded-lg text-red-400 transition"
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
