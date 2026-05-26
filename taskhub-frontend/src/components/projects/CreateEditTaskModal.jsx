import { useState, useEffect } from 'react';
import { orgApi, taskApi } from '../../services/api';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { toast } from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' }
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' }
];

const TYPE_OPTIONS = [
  { value: 'TASK', label: 'Task' },
  { value: 'FEATURE', label: 'Feature' },
  { value: 'IMPROVEMENT', label: 'Improvement' },
  { value: 'BUG', label: 'Bug' }
];

export default function CreateEditTaskModal({ isOpen, onClose, onSuccess, orgId, projectId, task = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [type, setType] = useState('TASK');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (isOpen && orgId) {
      const fetchMembers = async () => {
        setLoadingMembers(true);
        try {
          const res = await orgApi.getMembers(orgId);
          setMembers(res.data || []);
        } catch (err) {
          console.error("Failed to fetch organization members:", err);
          toast.error("Failed to load team members");
        } finally {
          setLoadingMembers(false);
        }
      };
      fetchMembers();
    }
  }, [isOpen, orgId]);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'TODO');
      setPriority(task.priority || 'MEDIUM');
      setType(task.type || 'TASK');
      setAssigneeId(task.assignee?.userId || '');
      setDueDate(task.dueDate ? task.dueDate.substring(0, 16) : '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setPriority('MEDIUM');
      setType('TASK');
      setAssigneeId('');
      setDueDate('');
    }
  }, [task, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setLoading(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      type,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null
    };

    try {
      if (task) {
        await taskApi.update(orgId, projectId, task.id, payload);
        toast.success('Task updated successfully');
      } else {
        await taskApi.create(orgId, projectId, payload);
        toast.success('Task created successfully');
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to save task:", err);
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Create Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          placeholder="Enter task title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
            placeholder="Add detailed task description..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              {TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
              value={priority}
              onChange={e => setPriority(e.target.value)}
            >
              {PRIORITY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Assignee
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              disabled={loadingMembers}
            >
              <option value="">Unassigned</option>
              {members.map(member => (
                <option key={member.userId} value={member.userId}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Due Date"
          type="datetime-local"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" isLoading={loading}>
            {task ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
