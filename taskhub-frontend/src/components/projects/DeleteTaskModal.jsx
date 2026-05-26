import { useState } from 'react';
import { taskApi } from '../../services/api';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DeleteTaskModal({ isOpen, onClose, onSuccess, orgId, projectId, taskId, taskTitle }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await taskApi.delete(orgId, projectId, taskId);
      toast.success('Task deleted successfully');
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to delete task:", err);
      toast.error(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Task">
      <div className="flex flex-col items-center text-center p-2">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Are you absolutely sure?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
          This will permanently delete task <span className="font-semibold text-gray-700 dark:text-gray-300">"{taskTitle}"</span> and all its associated comments. This action cannot be undone.
        </p>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500" isLoading={loading} onClick={handleDelete}>
            Delete Task
          </Button>
        </div>
      </div>
    </Modal>
  );
}
