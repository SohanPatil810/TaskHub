import { useState, useEffect } from 'react';
import { useOrg } from '../../context/OrgContext';
import { useProjects } from '../../context/ProjectContext';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { orgApi } from '../../services/api';

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'COMPLETED', label: 'Completed' },
];
const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const EMPTY_FORM = {
  name: '', description: '', status: 'TODO', priority: 'MEDIUM',
  startDate: '', endDate: '', projectLeadId: '', memberIds: [],
};

export default function CreateEditProjectModal({ isOpen, onClose, project }) {
  const { currentOrg } = useOrg();
  const { createProject, updateProject } = useProjects();
  const [form, setForm] = useState(EMPTY_FORM);
  const [orgMembers, setOrgMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const isEditing = !!project;

  // Load org members for lead/member selectors
  useEffect(() => {
    if (isOpen && currentOrg) {
      orgApi.getMembers(currentOrg.id)
        .then(res => setOrgMembers(res.data))
        .catch(() => setOrgMembers([]));
    }
  }, [isOpen, currentOrg]);

  // Populate form when editing
  useEffect(() => {
    if (isEditing && project) {
      setForm({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'TODO',
        priority: project.priority || 'MEDIUM',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        projectLeadId: project.projectLead?.userId || '',
        memberIds: project.members?.map(m => m.userId) || [],
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [isOpen, project]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Project name is required';
    if (!form.projectLeadId) e.projectLeadId = 'Project lead is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      projectLeadId: form.projectLeadId || null,
      memberIds: form.memberIds,
    };

    const result = isEditing
      ? await updateProject(project.id, payload)
      : await createProject(payload);

    setLoading(false);
    if (result) onClose();
  };

  const toggleMember = (userId) => {
    setForm(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter(id => id !== userId)
        : [...prev.memberIds, userId],
    }));
  };

  const selectClass = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Project' : 'Create Project'}>
      <form onSubmit={handleSubmit} className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto pr-1">
        {/* Name */}
        <Input label="Project Name" placeholder="e.g. TaskHub UI" value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))} error={errors.name} autoFocus />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea rows={3} placeholder="Describe the project..."
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50 resize-none" />
        </div>

        {/* Status + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className={selectClass}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className={selectClass}>
              {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
            <input type="date" value={form.startDate}
              onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
              className={selectClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
            <input type="date" value={form.endDate}
              onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
              className={selectClass} />
          </div>
        </div>

        {/* Project Lead */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Lead <span className="text-red-500">*</span>
          </label>
          <select value={form.projectLeadId} onChange={e => setForm(p => ({ ...p, projectLeadId: e.target.value }))} className={selectClass}>
            <option value="">Select a lead...</option>
            {orgMembers.map(m => (
              <option key={m.userId} value={m.userId}>{m.name} ({m.email})</option>
            ))}
          </select>
          {errors.projectLeadId && <p className="mt-1 text-xs text-red-500">{errors.projectLeadId}</p>}
        </div>

        {/* Team Members */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team Members</label>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {orgMembers.map(m => (
              <label key={m.userId} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <input type="checkbox" className="rounded text-brand-600"
                  checked={form.memberIds.includes(m.userId)}
                  onChange={() => toggleMember(m.userId)} />
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {m.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{m.name}</span>
                <span className="text-xs text-gray-400">{m.email}</span>
              </label>
            ))}
            {orgMembers.length === 0 && (
              <p className="text-xs text-gray-400 px-3 py-2">No members in this organization yet.</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2 sticky bottom-0 bg-white dark:bg-gray-950 pb-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" isLoading={loading}>
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
