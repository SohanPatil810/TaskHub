import { CheckCircle2, Clock, Plus, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '../components/ui/Button';
import { useOrg } from '../context/OrgContext';
import { useProjects } from '../context/ProjectContext';
import { taskApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const priorityColors = {
  CRITICAL: 'text-red-600 dark:text-red-400',
  HIGH: 'text-orange-500 dark:text-orange-400',
  MEDIUM: 'text-yellow-600 dark:text-yellow-400',
  LOW: 'text-green-600 dark:text-green-400',
};

const statusLabels = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  DONE: 'Completed',
};

export default function MyTasksPage() {
  const { currentOrg } = useOrg();
  const { projects } = useProjects();
  const navigate = useNavigate();
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const tabs = ['All', 'Todo', 'In Progress', 'Completed'];

  useEffect(() => {
    if (!currentOrg || !projects.length) {
      setAllTasks([]);
      return;
    }
    setLoading(true);
    Promise.all(
      projects.map(p => taskApi.getByProject(currentOrg.id, p.id).then(r => r.data).catch(() => []))
    ).then(results => {
      setAllTasks(results.flat());
    }).finally(() => setLoading(false));
  }, [currentOrg, projects]);

  const statusMap = { 'Todo': 'TODO', 'In Progress': 'IN_PROGRESS', 'Completed': 'DONE' };

  const filtered = useMemo(() => {
    if (filter === 'All') return allTasks;
    const statusKey = statusMap[filter];
    return allTasks.filter(t => t.status === statusKey);
  }, [allTasks, filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{allTasks.length} tasks across all projects</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
              filter === tab ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300')}>
            {tab}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filtered.map(task => (
            <div key={task.id}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer"
              onClick={() => navigate(`/dashboard/projects/${task.projectId}/tasks/${task.id}`)}>
              <button className="flex-shrink-0" onClick={e => e.stopPropagation()}>
                {task.status === 'DONE'
                  ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  : <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-brand-500 transition-colors" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium text-gray-800 dark:text-gray-200",
                  task.status === 'DONE' && 'line-through text-gray-400 dark:text-gray-500')}>{task.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{task.projectName}</p>
              </div>
              <span className={cn("text-xs font-semibold hidden sm:block", priorityColors[task.priority])}>{task.priority}</span>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'}
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <CheckCircle2 className="h-10 w-10 mb-3 text-gray-200 dark:text-gray-700" />
            <p className="text-sm">No tasks here. Enjoy the silence!</p>
          </div>
        )}
      </div>
    </div>
  );
}
