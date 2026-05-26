import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { orgApi } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const OrgContext = createContext();

export const OrgProvider = ({ children }) => {
  const { token } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  const fetchOrgs = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingOrgs(true);
      const res = await orgApi.getMyOrgs();
      const orgs = res.data;
      setOrganizations(orgs);
      // Restore last selected org from localStorage, else default to first
      const savedId = localStorage.getItem('currentOrgId');
      const saved = orgs.find(o => o.id === savedId);
      setCurrentOrg(saved || orgs[0] || null);
    } catch {
      // Silently fail - user may not have orgs yet
    } finally {
      setLoadingOrgs(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  const switchOrg = (org) => {
    setCurrentOrg(org);
    localStorage.setItem('currentOrgId', org.id);
    toast.success(`Switched to ${org.name}`);
  };

  const createOrg = async (name, description) => {
    try {
      const res = await orgApi.create({ name, description });
      const newOrg = res.data;
      setOrganizations(prev => [...prev, newOrg]);
      switchOrg(newOrg);
      toast.success(`Organization "${name}" created!`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create organization');
      return false;
    }
  };

  const addMember = async (email) => {
    if (!currentOrg) return false;
    try {
      await orgApi.addMember(currentOrg.id, email);
      toast.success(`${email} added to ${currentOrg.name}`);
      await fetchOrgs();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
      return false;
    }
  };

  return (
    <OrgContext.Provider value={{
      organizations, currentOrg, loadingOrgs,
      switchOrg, createOrg, addMember, refetchOrgs: fetchOrgs
    }}>
      {children}
    </OrgContext.Provider>
  );
};

export const useOrg = () => useContext(OrgContext);
