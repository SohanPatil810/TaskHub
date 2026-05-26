import { useState } from 'react';
import { useOrg } from '../../context/OrgContext';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { invitationApi } from '../../services/api';
import { toast } from 'react-hot-toast';

const ROLE_OPTIONS = [
  { value: 'MEMBER', label: 'Member' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN', label: 'Admin' }
];

export default function AddMemberModal({ isOpen, onClose, onMemberAdded }) {
  const { currentOrg } = useOrg();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await invitationApi.invite(currentOrg.id, email.trim(), role);
      toast.success(`Invitation email successfully sent to ${email}`);
      if (onMemberAdded) {
        onMemberAdded();
      }
      setEmail('');
      setRole('MEMBER');
      onClose();
    } catch (err) {
      console.error("Invitation failed:", err);
      const msg = err.response?.data?.message || 'Failed to send invitation';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('MEMBER');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Invite to ${currentOrg?.name || 'Organization'}`}>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
        Invite a new colleague to join your organization on TaskHub. An email containing a secure registration link will be dispatched immediately.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="colleague@company.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={error}
          autoFocus
          required
        />

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            Role Assignment
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            {ROLE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" isLoading={loading}>
            Send Invite
          </Button>
        </div>
      </form>
    </Modal>
  );
}
