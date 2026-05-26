import { useState } from 'react';
import { useParams, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import {
  FolderOpen, CheckSquare2, BarChart2,
  ArrowLeft, Edit2, Trash2, Flag, Clock, Users
} from 'lucide-react';
import CreateEditProjectModal from '../components/projects/CreateEditProjectModal';
import DeleteProjectModal from '../components/projects/DeleteProjectModal';

const STATUS_CONFIG = {
  TODO:        { label: 'To Do',       color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  IN_REVIEW:   { label: 'In Review',   color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  COMPLETED:   { label: 'Completed',   color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};
const PRIORITY_CONFIG = {
  LOW:      { label: 'Low',      color: 'text-gray-500' },
  MEDIUM:   { label: 'Medium',   color: 'text-yellow-600' },
  HIGH:     { label: 'High',     color: 'text-orange-600' },
  CRITICAL: { label: 'Critical', color: 'text-red-600' },
};

const tabs = [
  { label: 'Tasks',     icon: CheckSquare2, path: 'tasks' },
  { label: 'Analytics', icon: BarChart2,    path: 'analytics' },
];

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { projects } = useProjects();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <FolderOpen className="h-10 w-10 text-gray-300 dark:text-gray-700" />
        <p className="text-gray-500 dark:text-gray-400">Project not found.</p>
        <button onClick={() => navigate('/dashboard/projects')}
          className="text-sm text-brand-600 hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </button>
      </div>
    );
  }

  const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.TODO;
  const priority = PRIORITY_CONFIG[project.priority] || PRIORITY_CONFIG.MEDIUM;
  const progress = project.progressPercentage || 0;

  return (
    <div className="flex flex-col h-full">
      {/* Project Header */}
      <div className="px-6 pt-6 pb-0 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => navigate('/dashboard/projects')}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mb-3 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> All Projects
        </button>

        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
              <FolderOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{project.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setShowEdit(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              <Edit2 className="h-4 w-4" />
            </button>
            <button onClick={() => setShowDelete(true)}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Meta badges + progress */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
            {status.label}
          </span>
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${priority.color}`}>
            <Flag className="h-3 w-3" />{priority.label}
          </span>
          {project.projectLead && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Users className="h-3 w-3" /> {project.projectLead.name}
            </span>
          )}
          {project.endDate && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" /> Due {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-brand-700 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-8 text-right">{progress}%</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 -mb-px overflow-x-auto">
          {tabs.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`
              }
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        <Outlet context={{ project }} />
      </div>

      <CreateEditProjectModal isOpen={showEdit} onClose={() => setShowEdit(false)} project={project} />
      <DeleteProjectModal isOpen={showDelete} onClose={() => { setShowDelete(false); navigate('/dashboard/projects'); }} project={project} />
    </div>
  );
}
