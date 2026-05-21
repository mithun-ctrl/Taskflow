import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, FolderKanban, LogOut, User, Sun, Moon } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="flex flex-col w-60 min-h-screen shrink-0 border-r border-zinc-200 dark:border-zinc-900 bg-white dark:bg-black px-4 py-6 transition-colors duration-200">
      <div className="mb-10 px-2">
        <h1 className="text-zinc-900 dark:text-white font-black text-xl tracking-tight">
          TaskFlow
        </h1>
        <p className="text-zinc-400 dark:text-zinc-700 text-[0.6875rem] mt-0.5 font-medium">
          Project Management
        </p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-150 ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-zinc-200 dark:border-zinc-900 pt-4 mt-4 transition-colors duration-200">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 bg-transparent border-none cursor-pointer transition-all duration-150"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2 mt-1">
          <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 transition-colors duration-200">
            <User size={13} className="text-zinc-400 dark:text-zinc-500" />
          </div>
          <div className="min-w-0">
            <p className="text-zinc-900 dark:text-white text-xs font-semibold truncate">
              {user?.name}
            </p>
            <p className="text-zinc-400 dark:text-zinc-600 text-[0.6875rem] truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 bg-transparent border-none cursor-pointer transition-all duration-150"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
