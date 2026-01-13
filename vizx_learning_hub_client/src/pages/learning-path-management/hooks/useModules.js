import { useState, useEffect } from 'react';
import moduleService from '../services/moduleService';

export const useModules = (learningPathId = null) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  const fetchModules = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (learningPathId) {
        response = await moduleService.getModulesByLearningPath(learningPathId);
      } else {
        response = await moduleService.getAllModules();
      }
      setModules(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  };

  const createModule = async (moduleData, withFiles = false) => {
    setLoading(true);
    try {
      let response;
      if (withFiles) {
        response = await moduleService.createModuleWithFiles(moduleData);
      } else {
        response = await moduleService.createModule(moduleData);
      }
      setModules(prev => [...prev, response.data.data]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create module');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateModule = async (id, moduleData, withFiles = false) => {
    setLoading(true);
    try {
      let response;
      if (withFiles) {
        response = await moduleService.updateModuleWithFiles(id, moduleData);
      } else {
        response = await moduleService.updateModule(id, moduleData);
      }
      setModules(prev => 
        prev.map(module => module.id === id ? response.data.data : module)
      );
      if (selectedModule?.id === id) {
        setSelectedModule(response.data.data);
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update module');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateModuleOrder = async (id, orderData) => {
    try {
      const response = await moduleService.updateModuleOrder(id, orderData);
      await fetchModules(); 
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update module order');
      throw err;
    }
  };

  const deleteModule = async (id) => {
    setLoading(true);
    try {
      await moduleService.deleteModule(id);
      setModules(prev => prev.filter(module => module.id !== id));
      if (selectedModule?.id === id) {
        setSelectedModule(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete module');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (learningPathId) {
      fetchModules();
    }
  }, [learningPathId]);

  return {
    modules,
    loading,
    error,
    selectedModule,
    setSelectedModule,
    fetchModules,
    createModule,
    updateModule,
    updateModuleOrder,
    deleteModule,
    refetch: fetchModules
  };
};