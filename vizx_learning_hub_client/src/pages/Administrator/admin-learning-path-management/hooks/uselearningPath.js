import { useState, useEffect } from 'react';
import learningPathService from '../services/learningPathService';

export const useLearningPaths = (initialFilters = {}) => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchLearningPaths = async (queryParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await learningPathService.getAllLearningPaths({
        ...filters,
        ...queryParams
      });
      
      // Handle the new nested structure: data.data.learningPaths
      const responseData = response.data?.data;
      if (responseData && Array.isArray(responseData.learningPaths)) {
        setLearningPaths(responseData.learningPaths);
      } else if (Array.isArray(response.data?.data)) {
        // Fallback for older API structure
        setLearningPaths(response.data.data);
      } else {
        setLearningPaths([]);
      }
    } catch (err) {
      console.error('useLearningPaths: fetch error', err);
      setError(err.response?.data?.message || 'Failed to fetch learning paths');
      setLearningPaths([]);
    } finally {
      setLoading(false);
    }
  };

  const createLearningPath = async (learningPathData) => {
    setLoading(true);
    try {
      const response = await learningPathService.createLearningPath(learningPathData);
      const newPath = response.data?.data;
      if (newPath) {
        setLearningPaths(prev => [...prev, newPath]);
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create learning path');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLearningPath = async (id, learningPathData) => {
    setLoading(true);
    try {
      const response = await learningPathService.updateLearningPath(id, learningPathData);
      const updatedPath = response.data?.data;
      if (updatedPath) {
        setLearningPaths(prev => 
          prev.map(lp => lp.id === id ? updatedPath : lp)
        );
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update learning path');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLearningPath = async (id) => {
    setLoading(true);
    try {
      await learningPathService.deleteLearningPath(id);
      setLearningPaths(prev => prev.filter(lp => lp.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete learning path');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningPaths();
  }, [filters]);

  return {
    learningPaths,
    loading,
    error,
    filters,
    setFilters,
    fetchLearningPaths,
    createLearningPath,
    updateLearningPath,
    deleteLearningPath,
    refetch: fetchLearningPaths
  };
};