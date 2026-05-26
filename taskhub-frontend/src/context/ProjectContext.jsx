import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projectApi } from '../services/api';
import { useOrg } from './OrgContext';
import toast from 'react-hot-toast';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { currentOrg } = useOrg();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!currentOrg) { setProjects([]); return; }
    try {
      setLoading(true);
      const res = await projectApi.getByOrg(currentOrg.id);
      setProjects(res.data);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [currentOrg]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const createProject = async (data) => {
    try {
      const res = await projectApi.create(currentOrg.id, data);
      setProjects(prev => [res.data, ...prev]);
      toast.success(`Project "${res.data.name}" created!`);
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
      return null;
    }
  };

  const updateProject = async (projectId, data) => {
    try {
      const res = await projectApi.update(currentOrg.id, projectId, data);
      setProjects(prev => prev.map(p => p.id === projectId ? res.data : p));
      toast.success('Project updated!');
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project');
      return null;
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await projectApi.delete(currentOrg.id, projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success('Project deleted');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
      return false;
    }
  };

  return (
    <ProjectContext.Provider value={{ projects, loading, fetchProjects, createProject, updateProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);
