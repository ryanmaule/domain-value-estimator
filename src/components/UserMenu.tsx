import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/login')}
          className="text-gray-600 hover:text-gray-900"
        >
          Sign In
        </button>
        <button
          onClick={() => navigate('/pricing')}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Crown className="w-5 h-5" />
          <span>Get Started</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => navigate('/account')}
        className="flex items-center space-x-2"
      >
        <User className="w-8 h-8 text-gray-400" />
        <span className="text-gray-900">{user.email}</span>
      </button>
      <button
        onClick={handleLogout}
        className="text-gray-600 hover:text-gray-900"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
};

export default UserMenu;