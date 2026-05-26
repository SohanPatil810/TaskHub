import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskApi, commentApi, projectApi } from '../services/api';
import { useOrg } from '../context/OrgContext';
import {
  ArrowLeft, Edit2, Trash2, Calendar, User, Flag, MessageSquare, Send,
  Clock, AlertCircle, Loader2, RefreshCw, Layers, Sparkles, Trash
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import CreateEditTaskModal from '../components/projects/CreateEditTaskModal';
import DeleteTaskModal from '../components/projects/DeleteTaskModal';

const TYPE_CONFIG = {
  TASK:        { label: 'Task',        color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  FEATURE:     { label: 'Feature',     color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  IMPROVEMENT: { label: 'Improvement', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  BUG:         { label: 'Bug',         color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
};

const PRIORITY_CONFIG = {
  LOW:      { label: 'Low',      color: 'bg-slate-100 text-slate-500 dark:bg-slate-850 dark:text-slate-400' },
  MEDIUM:   { label: 'Medium',   color: 'bg-yellow-105 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' },
  HIGH:     { label: 'High',     color: 'bg-orange-105 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' },
  CRITICAL: { label: 'Critical', color: 'bg-red-105 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
};

const STATUS_CONFIG = {
  TODO:        { label: 'To Do',       color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
  DONE:        { label: 'Done',        color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
};

export default function TaskDetailPage() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { currentOrg } = useOrg();
  const orgId = currentOrg?.id;

  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Modals state
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const fetchData = async () => {
    if (!orgId || !projectId || !taskId) return;
    try {
      setLoading(true);
      const [taskRes, projectRes, commentsRes] = await Promise.all([
        taskApi.getById(orgId, projectId, taskId),
        projectApi.getById(orgId, projectId),
        commentApi.getByTask(orgId, projectId, taskId)
      ]);
      setTask(taskRes.data);
      setProject(projectRes.data);
      setComments(commentsRes.data || []);
    } catch (err) {
      console.error("Failed to load task details:", err);
      toast.error("Failed to load task details");
      navigate(`/dashboard/projects/${projectId}/tasks`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgId, projectId, taskId]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await commentApi.create(orgId, projectId, taskId, newComment.trim());
      toast.success("Comment added");
      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } catch (err) {
      console.error("Failed to post comment:", err);
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentApi.delete(orgId, projectId, taskId, commentId);
      toast.success("Comment deleted");
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
      toast.error(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatShortDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading && !task) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  const typeConfig = TYPE_CONFIG[task?.type] || TYPE_CONFIG.TASK;
  const priorityConfig = PRIORITY_CONFIG[task?.priority] || PRIORITY_CONFIG.MEDIUM;
  const statusConfig = STATUS_CONFIG[task?.status] || STATUS_CONFIG.TODO;

  return (
    <div className="flex flex-col h-full bg-gray-50/20 dark:bg-transparent">
      {/* Header breadcrumb bar */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center justify-between">
        <button
          onClick={() => navigate(`/dashboard/projects/${projectId}/tasks`)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Tasks
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* Main Split Pane Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-140px)]">
        {/* LEFT COLUMN: Discussion / Comments (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 h-full overflow-hidden">
          {/* Discussion Header */}
          <div className="px-6 py-4 border-b border-gray-150 dark:border-gray-850 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-brand-500" />
            <h2 className="font-bold text-sm text-gray-800 dark:text-gray-200 uppercase tracking-wider">Discussion</h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400">
              {comments.length}
            </span>
          </div>

          {/* Comments Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 dark:text-gray-600">
                <MessageSquare className="h-10 w-10 text-gray-300 dark:text-gray-800 mb-2" />
                <p className="text-sm">No comments yet</p>
                <p className="text-xs mt-0.5">Start the conversation below!</p>
              </div>
            ) : (
              comments.map(c => (
                <div key={c.id} className="flex items-start gap-3 group">
                  {/* Initials Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {getInitials(c.user.name)}
                  </div>
                  
                  {/* Comment Bubble */}
                  <div className="flex-1 bg-gray-50 dark:bg-gray-900/60 rounded-xl p-3.5 border border-gray-100 dark:border-gray-900/40 relative">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-xs text-gray-800 dark:text-gray-200">
                        {c.user.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">
                          {new Date(c.createdAt).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                        
                        {/* Delete Comment Button */}
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-all"
                          title="Delete Comment"
                        >
                          <Trash className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Composer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <form onSubmit={handlePostComment} className="flex gap-2">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Type a comment, ask a question..."
                rows={1}
                className="flex-1 px-3 py-2.5 border border-gray-200 dark:border-gray-850 rounded-xl text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white max-h-24 resize-none"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePostComment(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md disabled:opacity-40 disabled:hover:bg-brand-600 flex items-center justify-center transition-all flex-shrink-0"
              >
                {submittingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Task Details & Project Details (5 Cols) */}
        <div className="lg:col-span-5 overflow-y-auto p-6 space-y-6 h-full scrollbar-thin">
          {/* Section: Task Details */}
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              <Layers className="h-4 w-4 text-brand-500" />
              <span>Task Details</span>
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                {task.title}
              </h1>
              {task.description ? (
                <div className="mt-2.5 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-900/40 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Description</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic mt-2">No description provided</p>
              )}
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-900">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Type</span>
                <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-bold ${typeConfig.color}`}>
                  {typeConfig.label}
                </span>
              </div>
              
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Priority</span>
                <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-bold ${priorityConfig.color}`}>
                  {priorityConfig.label}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</span>
                <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-bold ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Due Date</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  {formatDate(task.dueDate)}
                </span>
              </div>
            </div>

            {/* Assignee Box */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-900">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Assignee</span>
              {task.assignee ? (
                <div className="flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/20 p-2.5 rounded-lg border border-gray-100 dark:border-gray-900/40">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {getInitials(task.assignee.name)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-white leading-tight">{task.assignee.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{task.assignee.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-xs text-gray-400 italic">
                  <User className="h-4 w-4" />
                  <span>Unassigned</span>
                </div>
              )}
            </div>
          </div>

          {/* Section: Project Details */}
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-brand-500" />
              <span>Parent Project</span>
            </div>

            {project && (
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-gray-900 text-xs">
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Start Date</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {formatShortDate(project.startDate)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">End Date</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {formatShortDate(project.endDate)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Project Lead</span>
                    {project.projectLead ? (
                      <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <User className="h-3 w-3 text-gray-400" />
                        {project.projectLead.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">None</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateEditTaskModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        onSuccess={fetchData}
        orgId={orgId}
        projectId={projectId}
        task={task}
      />

      {showDelete && task && (
        <DeleteTaskModal
          isOpen={showDelete}
          onClose={() => setShowDelete(false)}
          onSuccess={() => navigate(`/dashboard/projects/${projectId}/tasks`)}
          orgId={orgId}
          projectId={projectId}
          taskId={task.id}
          taskTitle={task.title}
        />
      )}
    </div>
  );
}
