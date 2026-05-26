import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Clock, CheckCircle2, Briefcase, AlertTriangle, ArrowRight, MoreHorizontal, Loader2 } from 'lucide-react';
import { cn } from '../components/ui/Button';
import { useOrg } from '../context/OrgContext';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { taskApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const priorityColors = {
  CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  LOW: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const statusLabels = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  DONE: 'Completed',
};

const statusColors = {
  TODO: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  DONE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const projectColors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500'];

export default function DashboardPage() {
  const { currentOrg } = useOrg();
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const navigate = useNavigate();
  const [allTasks, setAllTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Fetch tasks from all projects
  useEffect(() => {
    if (!currentOrg || !projects.length) {
      setAllTasks([]);
      return;
    }
    setTasksLoading(true);
    Promise.all(
      projects.map(p => taskApi.getByProject(currentOrg.id, p.id).then(r => r.data).catch(() => []))
    ).then(results => {
      setAllTasks(results.flat());
    }).finally(() => setTasksLoading(false));
  }, [currentOrg, projects]);

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'DONE').length;
    const overdueTasks = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length;
    return { totalProjects, completedProjects, totalTasks, completedTasks, overdueTasks };
  }, [projects, allTasks]);

  const recentTasks = useMemo(() =>
    [...allTasks]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
    [allTasks]
  );

  const firstName = user?.name?.split(' ')[0] || 'there';

  const statsCards = [
    { label: 'Total Projects', value: stats.totalProjects, change: `${stats.completedProjects} completed`, up: true, icon: Briefcase, color: 'bg-blue-500' },
    { label: 'Total Tasks', value: stats.totalTasks, change: `${stats.completedTasks} completed`, up: true, icon: CheckCircle2, color: 'bg-emerald-500' },
    { label: 'My Tasks', value: allTasks.filter(t => t.assignee?.email === user?.email).length, change: `${allTasks.filter(t => t.assignee?.email === user?.email && t.status === 'TODO').length} todo`, up: null, icon: Clock, color: 'bg-violet-500' },
    { label: 'Overdue', value: stats.overdueTasks, change: stats.overdueTasks > 0 ? 'Needs attention' : 'All on track', up: stats.overdueTasks > 0 ? false : true, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  if (projectsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hello, welcome back 👋</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {currentOrg
              ? <>Viewing <span className="font-semibold text-brand-600 dark:text-brand-400">{currentOrg.name}</span> — {currentOrg.memberCount} member{currentOrg.memberCount !== 1 ? 's' : ''}</>
              : "Here's what's happening across your projects."}
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/projects')}
          className="hidden sm:flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          View Projects
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className={cn("p-2.5 rounded-lg flex-shrink-0", card.color)}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{card.value}</p>
              <p className={cn("text-xs mt-1 flex items-center gap-1",
                card.up === true ? 'text-emerald-600 dark:text-emerald-400' :
                card.up === false ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400')}>
                {card.up === true && <TrendingUp className="h-3 w-3" />}
                {card.up === false && <TrendingDown className="h-3 w-3" />}
                {card.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Tasks</h2>
            <button onClick={() => navigate('/dashboard/tasks')}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <CheckCircle2 className="h-8 w-8 mb-2 text-gray-200 dark:text-gray-700" />
                <p className="text-sm">No tasks yet. Create a project and add tasks!</p>
              </div>
            )}
            {recentTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer"
                onClick={() => navigate(`/dashboard/projects/${task.projectId}/tasks/${task.id}`)}>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium text-gray-800 dark:text-gray-200 truncate",
                    task.status === 'DONE' && 'line-through text-gray-400 dark:text-gray-500')}>{task.title}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {task.projectName}
                    {task.dueDate && <> · Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>}
                  </p>
                </div>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 hidden sm:block", priorityColors[task.priority])}>
                  {task.priority}
                </span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0", statusColors[task.status])}>
                  {statusLabels[task.status] || task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Active Projects</h2>
            <button onClick={() => navigate('/dashboard/projects')}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            {projects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Briefcase className="h-8 w-8 mb-2 text-gray-200 dark:text-gray-700" />
                <p className="text-sm">No projects yet</p>
              </div>
            )}
            {projects.slice(0, 5).map((project, idx) => {
              const progress = project.progressPercentage || 0;
              const color = projectColors[idx % projectColors.length];
              return (
                <div key={project.id}
                  className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/dashboard/projects/${project.id}`)}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0", color)} />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1 truncate">{project.name}</span>
                    <span className="text-xs text-gray-400">{project.taskCount} tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", color)}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-8 text-right">{progress}%</span>
                  </div>
                  {project.members && project.members.length > 0 && (
                    <div className="flex items-center mt-2">
                      <div className="flex -space-x-1.5">
                        {project.members.slice(0, 4).map((member, i) => (
                          <div key={member.userId || i} className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 border-2 border-white dark:border-gray-900 text-white text-[9px] flex items-center justify-center font-bold">
                            {member.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 ml-2">{project.members.length} members</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
