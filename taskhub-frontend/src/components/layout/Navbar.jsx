import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../ui/Button';

export function Navbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Click-outside handler for notification dropdown
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const notifications = [
    { id: 1, text: 'New comment on "Fix login bug"', time: '5m ago', unread: true },
    { id: 2, text: 'Alice invited you to "Design System"', time: '1h ago', unread: true },
    { id: 3, text: 'Task "Update README" is overdue', time: '3h ago', unread: false },
  ];

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : (user?.email?.charAt(0)?.toUpperCase() || 'U');

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center px-4 gap-3 sticky top-0 z-30">
      {/* Mobile Menu */}
      <button onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className={cn("relative flex-1 max-w-md transition-all duration-200", searchFocused ? 'max-w-lg' : '')}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search tasks, projects..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded hidden sm:block">⌘K</span>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-950"></span>
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</span>
                <button className="text-xs text-brand-600 dark:text-brand-400 hover:underline">Mark all read</button>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={cn("px-4 py-3 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer", n.unread && "bg-blue-50/50 dark:bg-blue-900/10")}>
                    {n.unread && <span className="mt-1.5 w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />}
                    {!n.unread && <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" />}
                    <div>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
                <button className="text-sm text-brand-600 dark:text-brand-400 hover:underline">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Avatar — shows real user initials */}
        <div className="ml-1 w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:ring-2 hover:ring-brand-400 transition-all"
          title={user?.name || user?.email || ''}>
          {initials}
        </div>
      </div>
    </header>
  );
}
