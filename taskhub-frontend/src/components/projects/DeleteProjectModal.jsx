import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useProjects } from '../../context/ProjectContext';

export default function DeleteProjectModal({ isOpen, onClose, project }) {
  const { deleteProject } = useProjects();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!project) return;
    setLoading(true);
    const success = await deleteProject(project.id);
    setLoading(false);
    if (success) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Project">
      <div className="mt-2 space-y-4">
        <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">This action cannot be undone</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              All tasks, data, and settings associated with <strong>{project?.name}</strong> will be permanently deleted.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            type="button"
            className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
            isLoading={loading}
            onClick={handleDelete}>
            Delete Project
          </Button>
        </div>
      </div>
    </Modal>
  );
}
