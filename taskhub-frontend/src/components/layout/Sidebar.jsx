import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { useProjects } from '../../context/ProjectContext';
import {
  LayoutDashboard, FolderKanban, Users, Settings, CheckSquare,
  ChevronRight, ChevronDown, BarChart2, Calendar, Cog,
  LogOut, ChevronUp, ListChecks, Plus, Building2, Loader2, X
} from 'lucide-react';
import { cn } from '../ui/Button';
import CreateOrgModal from '../org/CreateOrgModal';

/* ── Org Switcher ────────────────────────────────────────────────── */
function OrgSwitcher() {
  const { organizations, currentOrg, loadingOrgs, switchOrg } = useOrg();
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = (name) => name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          disabled={loadingOrgs}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-60"
        >
          {loadingOrgs ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : (
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {currentOrg ? initials(currentOrg.name) : <Building2 className="h-4 w-4" />}
            </div>
          )}
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate flex-1 text-left">
            {currentOrg?.name || 'No Organization'}
          </span>
          <ChevronUp className={cn("h-4 w-4 text-gray-400 flex-shrink-0 transition-transform duration-200", open ? '' : 'rotate-180')} />
        </button>

        {open && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
              Organizations
            </div>
            <div className="max-h-48 overflow-y-auto">
              {organizations.length === 0 ? (
                <p className="px-3 py-4 text-xs text-center text-gray-400">No organizations yet</p>
              ) : (
                organizations.map(org => (
                  <button key={org.id} onClick={() => { switchOrg(org); setOpen(false); }}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left",
                      currentOrg?.id === org.id ? 'text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20' : 'text-gray-700 dark:text-gray-300'
                    )}>
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {initials(org.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{org.name}</p>
                      <p className="text-xs text-gray-400">{org.memberCount} member{org.memberCount !== 1 ? 's' : ''}</p>
                    </div>
                    {currentOrg?.id === org.id && (
                      <span className="text-brand-600 dark:text-brand-400 text-xs font-bold">✓</span>
                    )}
                  </button>
                ))
              )}
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 p-1">
              <button
                onClick={() => { setOpen(false); setShowCreate(true); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <Plus className="h-4 w-4" /> Create Organization
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateOrgModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </>
  );
}

/* ── Nav Items ───────────────────────────────────────────────────── */
const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  {
    label: 'Projects', icon: FolderKanban, to: '/dashboard/projects',
    children: [
      { label: 'Tasks', icon: ListChecks, to: '/dashboard/projects/tasks' },
      { label: 'Analytics', icon: BarChart2, to: '/dashboard/projects/analytics' },
    ]
  },
  { label: 'My Tasks', icon: CheckSquare, to: '/dashboard/tasks' },
  { label: 'Team', icon: Users, to: '/dashboard/team' },
  { label: 'Settings', icon: Settings, to: '/dashboard/settings' },
];

function NavItem({ item, onClose }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(() =>
    item.children?.some(c => location.pathname.startsWith(c.to)) || location.pathname.startsWith(item.to + '/')
  );

  // Sync expanded state when location changes
  useEffect(() => {
    if (item.children) {
      const shouldExpand = item.children.some(c => location.pathname.startsWith(c.to)) || location.pathname.startsWith(item.to + '/');
      if (shouldExpand) setExpanded(true);
    }
  }, [location.pathname, item]);

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/');
  const isParentActive = item.children
    ? item.children.some(c => isActive(c.to)) || location.pathname === item.to || location.pathname.startsWith(item.to + '/')
    : location.pathname === item.to;

  if (item.children) {
    return (
      <div>
        <button onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isParentActive
              ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
          )}>
          <item.icon className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {expanded
            ? <ChevronDown className="h-4 w-4 text-gray-400" />
            : <ChevronRight className="h-4 w-4 text-gray-400" />}
        </button>
        <div className={cn("overflow-hidden transition-all duration-200", expanded ? 'max-h-60 mt-1' : 'max-h-0')}>
          <div className="ml-4 pl-3 border-l border-gray-200 dark:border-gray-700 space-y-0.5">
            {item.children.map(child => (
              <Link key={child.to} to={child.to} onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive(child.to)
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 font-medium'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                )}>
                <child.icon className="h-3.5 w-3.5 flex-shrink-0" />
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link to={item.to} onClick={onClose}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive(item.to)
          ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
      )}>
      <item.icon className="h-4 w-4 flex-shrink-0" />
      {item.label}
    </Link>
  );
}

/* ── Sidebar Shell ────────────────────────────────────────────────── */
export function Sidebar({ mobileOpen, onClose }) {
  const { logout } = useAuth();
  const { projects } = useProjects();
  const location = useLocation();
  const navigate = useNavigate();

  const match = location.pathname.match(/^\/dashboard\/projects\/([^/]+)/);
  const pathId = match ? match[1] : null;
  const isStaticPath = ['tasks', 'analytics'].includes(pathId);
  const activeProjectId = isStaticPath ? null : pathId;
  const activeProject = projects.find(p => p.id === activeProjectId);

  const dynamicNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    {
      label: activeProject ? activeProject.name : 'Project',
      icon: FolderKanban,
      to: activeProjectId ? `/dashboard/projects/${activeProjectId}` : '/dashboard/projects',
      children: [
        { label: 'Tasks', icon: ListChecks, to: activeProjectId ? `/dashboard/projects/${activeProjectId}/tasks` : '/dashboard/projects/tasks' },
        { label: 'Analytics', icon: BarChart2, to: activeProjectId ? `/dashboard/projects/${activeProjectId}/analytics` : '/dashboard/projects/analytics' },
      ]
    },
    { label: 'My Tasks', icon: CheckSquare, to: '/dashboard/tasks' },
    { label: 'Team', icon: Users, to: '/dashboard/team' },
    { label: 'Settings', icon: Settings, to: '/dashboard/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.();
  };

  const sidebar = (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 w-64">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">TaskHub</span>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {dynamicNavItems.map(item => <NavItem key={item.to} item={item} onClose={onClose} />)}
      </nav>

      {/* Bottom: Org Switcher + Sign Out */}
      <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
        <OrgSwitcher />
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-shrink-0 h-screen sticky top-0">
        {sidebar}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 shadow-xl">{sidebar}</aside>
        </div>
      )}
    </>
  );
}
