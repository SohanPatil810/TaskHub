import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskApi } from '../../services/api';
import { useOrg } from '../../context/OrgContext';
import {
  Plus, Search, Edit2, Trash2, Calendar, User, Flag,
  ChevronRight, ArrowRight, Loader2, ListChecks, CheckCircle2,
  Clock, AlertCircle, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import CreateEditTaskModal from './CreateEditTaskModal';
import DeleteTaskModal from './DeleteTaskModal';

const TYPE_CONFIG = {
  TASK:        { label: 'Task',        color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  FEATURE:     { label: 'Feature',     color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  IMPROVEMENT: { label: 'Improvement', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  BUG:         { label: 'Bug',         color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
};

const PRIORITY_CONFIG = {
  LOW:      { label: 'Low',      color: 'text-slate-500', iconColor: 'text-slate-400' },
  MEDIUM:   { label: 'Medium',   color: 'text-yellow-600', iconColor: 'text-yellow-500' },
  HIGH:     { label: 'High',     color: 'text-orange-600', iconColor: 'text-orange-500' },
  CRITICAL: { label: 'Critical', color: 'text-red-600', iconColor: 'text-red-500' },
};

export default function ProjectTasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentOrg } = useOrg();
  const orgId = currentOrg?.id;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showCreateEdit, setShowCreateEdit] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterType, setFilterType] = useState('');

  const fetchTasks = async () => {
    if (!orgId || !projectId) return;
    try {
      setLoading(true);
      const res = await taskApi.getByProject(orgId, projectId);
      setTasks(res.data || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [orgId, projectId]);

  // Inline status updater
  const handleStatusChange = async (task, newStatus) => {
    try {
      const payload = {
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        type: task.type,
        assigneeId: task.assignee?.userId || null,
        dueDate: task.dueDate
      };
      await taskApi.update(orgId, projectId, task.id, payload);
      toast.success(`Moved to ${newStatus === 'TODO' ? 'To Do' : newStatus === 'IN_PROGRESS' ? 'In Progress' : 'Done'}`);
      fetchTasks();
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update task status");
    }
  };

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPriority = !filterPriority || task.priority === filterPriority;
      const matchesType = !filterType || task.type === filterType;
      return matchesSearch && matchesPriority && matchesType;
    });
  }, [tasks, searchQuery, filterPriority, filterType]);

  // Categorize tasks for Kanban columns
  const columns = useMemo(() => {
    return {
      TODO: filteredTasks.filter(t => t.status === 'TODO'),
      IN_PROGRESS: filteredTasks.filter(t => t.status === 'IN_PROGRESS'),
      DONE: filteredTasks.filter(t => t.status === 'DONE'),
    };
  }, [filteredTasks]);

  const handleEditClick = (e, task) => {
    e.stopPropagation();
    setSelectedTask(task);
    setShowCreateEdit(true);
  };

  const handleDeleteClick = (e, task) => {
    e.stopPropagation();
    setTaskToDelete(task);
    setShowDelete(true);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dateStr, status) => {
    if (!dateStr || status === 'DONE') return false;
    return new Date(dateStr) < new Date();
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-6 py-4 space-y-4">
      {/* Header Filters & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 sm:flex-initial">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
            />
          </div>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
          >
            <option value="">All Types</option>
            <option value="TASK">Task</option>
            <option value="FEATURE">Feature</option>
            <option value="IMPROVEMENT">Improvement</option>
            <option value="BUG">Bug</option>
          </select>

          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <button
            onClick={fetchTasks}
            className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={() => { setSelectedTask(null); setShowCreateEdit(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" /> Create Task
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-x-auto pb-4">
        {/* TODO Column */}
        <KanbanColumn
          title="To Do"
          count={columns.TODO.length}
          tasks={columns.TODO}
          status="TODO"
          onCardClick={(task) => navigate(`/dashboard/projects/${projectId}/tasks/${task.id}`)}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onStatusChange={handleStatusChange}
          getInitials={getInitials}
          formatDate={formatDate}
          isOverdue={isOverdue}
        />

        {/* IN_PROGRESS Column */}
        <KanbanColumn
          title="In Progress"
          count={columns.IN_PROGRESS.length}
          tasks={columns.IN_PROGRESS}
          status="IN_PROGRESS"
          onCardClick={(task) => navigate(`/dashboard/projects/${projectId}/tasks/${task.id}`)}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onStatusChange={handleStatusChange}
          getInitials={getInitials}
          formatDate={formatDate}
          isOverdue={isOverdue}
        />

        {/* DONE Column */}
        <KanbanColumn
          title="Done"
          count={columns.DONE.length}
          tasks={columns.DONE}
          status="DONE"
          onCardClick={(task) => navigate(`/dashboard/projects/${projectId}/tasks/${task.id}`)}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onStatusChange={handleStatusChange}
          getInitials={getInitials}
          formatDate={formatDate}
          isOverdue={isOverdue}
        />
      </div>

      {/* Modals */}
      <CreateEditTaskModal
        isOpen={showCreateEdit}
        onClose={() => setShowCreateEdit(false)}
        onSuccess={fetchTasks}
        orgId={orgId}
        projectId={projectId}
        task={selectedTask}
      />

      {showDelete && taskToDelete && (
        <DeleteTaskModal
          isOpen={showDelete}
          onClose={() => setShowDelete(false)}
          onSuccess={fetchTasks}
          orgId={orgId}
          projectId={projectId}
          taskId={taskToDelete.id}
          taskTitle={taskToDelete.title}
        />
      )}
    </div>
  );
}

/* ─── Kanban Column Component ───────────────────────────────────────── */
function KanbanColumn({
  title, count, tasks, status, onCardClick, onEdit, onDelete, onStatusChange,
  getInitials, formatDate, isOverdue
}) {
  return (
    <div className="flex flex-col bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200/50 dark:border-gray-800/40 rounded-xl p-4 min-w-[280px]">
      {/* Column Title */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${
            status === 'TODO' ? 'bg-gray-400' : status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-green-500'
          }`} />
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm tracking-tight">{title}</h3>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-gray-200/60 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          {count}
        </span>
      </div>

      {/* Column Cards */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] scrollbar-thin">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-gray-200 dark:border-gray-850 rounded-xl bg-white dark:bg-gray-950/40">
            <ListChecks className="h-6 w-6 text-gray-300 dark:text-gray-700 mb-2" />
            <p className="text-xs text-gray-400">No tasks in this stage</p>
          </div>
        ) : (
          tasks.map(task => {
            const typeConfig = TYPE_CONFIG[task.type] || TYPE_CONFIG.TASK;
            const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
            const overdue = isOverdue(task.dueDate, task.status);

            return (
              <div
                key={task.id}
                onClick={() => onCardClick(task)}
                className="bg-white dark:bg-gray-950 border border-gray-200/70 dark:border-gray-850 rounded-xl p-3.5 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 cursor-pointer group space-y-3"
              >
                {/* Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-bold ${typeConfig.color}`}>
                    {typeConfig.label}
                  </span>
                  
                  {/* Status Dropdown */}
                  <select
                    value={task.status}
                    onClick={e => e.stopPropagation()}
                    onChange={e => onStatusChange(task, e.target.value)}
                    className="text-[10px] font-semibold border-0 py-0.5 px-2 bg-gray-100 dark:bg-gray-900 text-gray-500 rounded-md focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                {/* Content */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug group-hover:text-brand-600 transition-colors">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-900 gap-2">
                  <div className="flex items-center gap-2">
                    {/* Priority Icon */}
                    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${priorityConfig.color}`}>
                      <Flag className={`h-2.5 w-2.5 ${priorityConfig.iconColor} fill-current`} />
                      {priorityConfig.label}
                    </span>

                    {/* Due Date */}
                    {task.dueDate && (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${
                        overdue ? 'text-red-500 font-bold' : 'text-gray-400'
                      }`}>
                        {overdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>

                  {/* Assignee / Actions Overlay */}
                  <div className="flex items-center gap-2">
                    {/* Actions on Hover */}
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={e => onEdit(e, task)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={e => onDelete(e, task)}
                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Assignee Avatar */}
                    {task.assignee ? (
                      <div
                        className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white font-bold text-[9px] flex items-center justify-center flex-shrink-0"
                        title={`Assigned to ${task.assignee.name}`}
                      >
                        {getInitials(task.assignee.name)}
                      </div>
                    ) : (
                      <div
                        className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-800 text-gray-400 flex items-center justify-center flex-shrink-0"
                        title="Unassigned"
                      >
                        <User className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
