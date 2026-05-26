import { useState, useEffect, useCallback } from 'react';
import { Mail, MoreHorizontal, UserPlus, Building2, Loader2, RefreshCw } from 'lucide-react';
import { useOrg } from '../context/OrgContext';
import AddMemberModal from '../components/org/AddMemberModal';
import { orgApi } from '../services/api';
import { cn } from '../components/ui/Button';

const roleColors = {
  OWNER:   'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
  ADMIN:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  MANAGER: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  MEMBER:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

function formatRole(role) {
  if (!role) return 'Member';
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export default function TeamPage() {
  const { currentOrg, loadingOrgs } = useOrg();
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!currentOrg) return;
    setLoadingMembers(true);
    try {
      const res = await orgApi.getMembers(currentOrg.id);
      setMembers(res.data);
    } catch {
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  }, [currentOrg]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const refreshAll = () => {
    fetchMembers();
  };

  if (loadingOrgs) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

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

  const totalCount = members.length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {currentOrg.name} · {totalCount} member{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <UserPlus className="h-4 w-4" /> Invite Member
        </button>
      </div>

      {/* Members List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Workspace Members · {totalCount}
          </h3>
          <button 
            onClick={refreshAll}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {loadingMembers ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {members.length === 0 && (
              <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                No members found in this organization.
              </div>
            )}
            
            {members.map(item => (
              <div 
                key={item.userId} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm shadow-brand-500/10">
                    {item.name?.charAt(0)?.toUpperCase() || item.email.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{item.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.email}</p>
                  </div>
                </div>

                {/* Role Badge */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm ${roleColors[item.role] || roleColors.MEMBER}`}>
                    {formatRole(item.role)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href={`mailto:${item.email}`}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title={`Mail ${item.email}`}
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                  {!item.isOwner && (
                    <button className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddMemberModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        onMemberAdded={refreshAll}
      />
    </div>
  );
}
