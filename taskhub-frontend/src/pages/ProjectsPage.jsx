import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen, Plus, Search, MoreHorizontal, Edit2, Trash2,
  Building2, Loader2, Calendar, User, Flag, ChevronDown
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useOrg } from '../context/OrgContext';
import CreateEditProjectModal from '../components/projects/CreateEditProjectModal';
import DeleteProjectModal from '../components/projects/DeleteProjectModal';

/* ─── Config ──────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  TODO:        { label: 'To Do',      color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', dot: 'bg-gray-400' },
  IN_PROGRESS: { label: 'In Progress',color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dot: 'bg-blue-500' },
  IN_REVIEW:   { label: 'In Review',  color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' },
  COMPLETED:   { label: 'Completed',  color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500' },
};
const PRIORITY_CONFIG = {
  LOW:      { label: 'Low',      color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
  MEDIUM:   { label: 'Medium',   color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  HIGH:     { label: 'High',     color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  CRITICAL: { label: 'Critical', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};
const GRADIENT_POOL = [
  'from-blue-500 to-blue-700', 'from-violet-500 to-violet-700',
  'from-emerald-500 to-emerald-700', 'from-orange-500 to-orange-700',
  'from-pink-500 to-pink-700', 'from-teal-500 to-teal-700',
  'from-indigo-500 to-indigo-700', 'from-rose-500 to-rose-700',
];
const getGradient = (id) => {
  if (!id) return GRADIENT_POOL[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENT_POOL[Math.abs(hash) % GRADIENT_POOL.length];
};

/* ─── Project Card ────────────────────────────────────────────────── */
function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const gradient = getGradient(project.id);
  const progress = project.progressPercentage || 0;
  const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.TODO;
  const priority = PRIORITY_CONFIG[project.priority] || PRIORITY_CONFIG.MEDIUM;
  const membersToShow = project.members?.slice(0, 4) || [];
  const extra = (project.members?.length || 0) - 4;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 group flex flex-col">
      {/* Top gradient bar */}
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
            <FolderOpen className="h-5 w-5 text-white" />
          </div>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-all">
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-8 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 min-w-[140px]"
                onMouseLeave={() => setMenuOpen(false)}>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(project); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Edit2 className="h-3.5 w-3.5" /> Edit Project
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(project); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title + Description */}
        <div
          className="cursor-pointer flex-1"
          onClick={() => navigate(`/dashboard/projects/${project.id}`)}>
          <h3 className="font-semibold text-gray-900 dark:text-white leading-snug">{project.name}</h3>
          {project.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{project.description}</p>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.color}`}>
            <Flag className="h-3 w-3 inline mr-0.5" />{priority.label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">{project.completedTaskCount}/{project.taskCount} tasks</span>
            <span className="text-xs font-medium text-gray-500">{progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer: Lead + Members + Dates */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          {/* Lead avatar */}
          <div className="flex items-center gap-1.5">
            {project.projectLead ? (
              <>
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[10px] font-bold`}>
                  {project.projectLead.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[80px]">{project.projectLead.name}</span>
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">No lead</span>
            )}
          </div>

          {/* Member avatars */}
          <div className="flex -space-x-1.5">
            {membersToShow.map((m, i) => (
              <div key={m.userId}
                title={m.name}
                className={`w-6 h-6 rounded-full bg-gradient-to-br ${gradient} border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-[9px] font-bold`}>
                {m.name?.charAt(0)?.toUpperCase()}
              </div>
            ))}
            {extra > 0 && (
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center text-gray-600 dark:text-gray-300 text-[9px] font-bold">
                +{extra}
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        {(project.startDate || project.endDate) && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="h-3 w-3" />
            {project.startDate && <span>{new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
            {project.startDate && project.endDate && <span>→</span>}
            {project.endDate && <span>{new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Select Filter ───────────────────────────────────────────────── */
function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer">
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="h-3.5 w-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

/* ─── Projects Page ───────────────────────────────────────────────── */
export default function ProjectsPage() {
  const { projects, loading } = useProjects();
  const { currentOrg } = useOrg();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || p.status === statusFilter;
      const matchPriority = !priorityFilter || p.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [projects, search, statusFilter, priorityFilter]);

  if (!currentOrg) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-4 text-center">
        <Building2 className="h-12 w-12 text-gray-300 dark:text-gray-700" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">No Organization Selected</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Create or switch to an organization using the switcher at the bottom of the sidebar.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {currentOrg.name} · {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors self-start sm:self-auto">
          <Plus className="h-4 w-4" /> New Project
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Status"
            options={Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <FilterSelect
            value={priorityFilter}
            onChange={setPriorityFilter}
            placeholder="All Priority"
            options={Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          {(statusFilter || priorityFilter || search) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); }}
              className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <>
          {filtered.length === 0 && projects.length > 0 && (
            <div className="text-center py-16 text-gray-400 dark:text-gray-600">
              <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No projects match your filters.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(p => (
              <ProjectCard key={p.id} project={p}
                onEdit={setEditProject}
                onDelete={setDeleteProject} />
            ))}

            {/* Create new card */}
            <button
              onClick={() => setShowCreate(true)}
              className="bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-all group min-h-[200px]">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 transition-colors">
                <Plus className="h-5 w-5 text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                Create new project
              </p>
            </button>
          </div>

          {/* Empty state (no projects at all) */}
          {projects.length === 0 && !loading && (
            <div className="text-center py-16 space-y-3">
              <FolderOpen className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No projects yet</h3>
              <p className="text-sm text-gray-400">Create your first project to get started.</p>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors mt-2">
                <Plus className="h-4 w-4" /> Create Project
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <CreateEditProjectModal
        isOpen={showCreate || !!editProject}
        onClose={() => { setShowCreate(false); setEditProject(null); }}
        project={editProject}
      />
      <DeleteProjectModal
        isOpen={!!deleteProject}
        onClose={() => setDeleteProject(null)}
        project={deleteProject}
      />
    </div>
  );
}
