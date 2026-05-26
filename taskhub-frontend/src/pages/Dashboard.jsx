import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';
import { Moon, Sun, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-3 flex items-center justify-between">
        <div className="font-bold text-xl text-brand-600 dark:text-brand-500">
          TaskHub
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium dark:text-gray-200">{user?.email}</span>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </nav>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
        <div className="p-12 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
            <LogOut className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Welcome to TaskHub!</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            Your authentication setup is working perfectly. Next, you can build out your project and task management features here.
          </p>
        </div>
      </main>
    </div>
  );
}
