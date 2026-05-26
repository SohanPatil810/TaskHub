import { useState } from 'react';
import { useOrg } from '../../context/OrgContext';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function CreateOrgModal({ isOpen, onClose }) {
  const { createOrg } = useOrg();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Organization name is required'); return; }
    setError('');
    setLoading(true);
    const success = await createOrg(name.trim(), description.trim());
    setLoading(false);
    if (success) {
      setName('');
      setDescription('');
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Organization">
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <Input
          label="Organization Name"
          placeholder="e.g. Acme Corp"
          value={name}
          onChange={e => setName(e.target.value)}
          error={error}
          autoFocus
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="What does this organization do?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50 dark:placeholder:text-gray-500 resize-none"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" isLoading={loading}>
            Create Organization
          </Button>
        </div>
      </form>
    </Modal>
  );
}
