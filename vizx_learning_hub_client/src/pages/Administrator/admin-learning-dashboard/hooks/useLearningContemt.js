import { useState, useEffect } from 'react';
import learningPathService from '../services/learningPathService';
import moduleService from '../services/moduleService';

export const useLearningContent = () => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch learning paths
  const fetchLearningPaths = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await learningPathService.getAllLearningPaths();
      const paths = response.data.data;
      setLearningPaths(paths);
      
      // Set the first path as current if available
      if (paths.length > 0) {
        setCurrentPath(paths[0]);
        // Fetch modules for the first path
        await fetchModulesByLearningPath(paths[0].id);
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch learning paths');
      console.error('Learning paths fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch modules by learning path
  const fetchModulesByLearningPath = async (learningPathId) => {
    try {
      const response = await moduleService.getModulesByLearningPath(learningPathId);
      setModules(response.data.data);
    } catch (err) {
      console.error('Failed to fetch modules:', err);
      setModules([]);
    }
  };

  // Select a different learning path
  const selectLearningPath = async (path) => {
    setCurrentPath(path);
    await fetchModulesByLearningPath(path.id);
  };

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  return {
    learningPaths,
    currentPath,
    modules,
    loading,
    error,
    selectLearningPath,
    refetch: fetchLearningPaths
  };
};