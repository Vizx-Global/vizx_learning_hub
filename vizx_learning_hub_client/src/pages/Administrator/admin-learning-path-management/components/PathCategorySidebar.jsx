import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import learningPathService from '../services/learningPathService';
import moduleService from '../services/moduleService';

import Swal from 'sweetalert2';


const EditLearningPathModal = ({ 
  isOpen, 
  onClose, 
  editingPath, 
  onUpdate 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimatedHours: 0,
    difficulty: 'BEGINNER',
    tags: [],
    isFeatured: false,
    featuredOrder: 0
  });
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data when path changes
  useEffect(() => {
    if (editingPath) {
      setFormData({
        title: editingPath.title || '',
        description: editingPath.description || '',
        estimatedHours: editingPath.estimatedHours || 0,
        difficulty: editingPath.difficulty || 'BEGINNER',
        tags: editingPath.tags || [],
        isFeatured: editingPath.isFeatured || false,
        featuredOrder: editingPath.featuredOrder || 0
      });
    }
  }, [editingPath]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleAddTag = useCallback(() => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  }, [newTag, formData.tags]);

  const handleRemoveTag = useCallback((tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const handleTagKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingPath) return;

    setIsLoading(true);
    
    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        estimatedHours: parseFloat(formData.estimatedHours),
        difficulty: formData.difficulty,
        tags: formData.tags,
        isFeatured: formData.isFeatured,
        featuredOrder: parseInt(formData.featuredOrder)
      };

      await learningPathService.updateLearningPath(editingPath.id, updateData);
      
      await Swal.fire({
        title: 'Updated!',
        text: 'Learning path has been updated successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981',
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      await Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to update learning path',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !editingPath) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Edit Learning Path
            </h2>
            <Button
              variant="ghost"
              size="icon"
              iconName="X"
              onClick={onClose}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="Enter learning path title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="Enter learning path description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Estimated Hours */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Estimated Hours *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Difficulty *
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                placeholder="Add a tag"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-error transition-colors"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Featured Order */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Featured Order
              </label>
              <input
                type="number"
                min="0"
                value={formData.featuredOrder}
                onChange={(e) => handleInputChange('featuredOrder', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              />
            </div>

            {/* Is Featured */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                />
                <span className="text-sm font-medium text-foreground">
                  Featured Learning Path
                </span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Icon name="Loader" size={16} className="animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Update Learning Path'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PathCategorySidebar = ({ 
  isCollapsed, 
  onToggleCollapse, 
  selectedCategory, 
  onCategorySelect,
  selectedPath,
  onPathSelect,
  onCreatePath 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [learningPaths, setLearningPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [moduleData, setModuleData] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPath, setEditingPath] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const handlePathCreated = (newPath) => {
    fetchLearningPaths();
    if (onPathSelect) {
      onPathSelect(newPath);
    }
  };

  // Edit Modal Handlers
  const handleEdit = useCallback((path) => {
    setEditingPath(path);
    setIsEditModalOpen(true);
  }, []);

  const handleEditClose = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingPath(null);
  }, []);

  const handleEditUpdate = useCallback(() => {
    fetchLearningPaths();
  }, []);

  // Action handlers with SweetAlert
  const handlePublish = async (path) => {
    const result = await Swal.fire({
      title: 'Publish Learning Path?',
      text: `Are you sure you want to publish "${path.title}"? This will make it available to users.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Publish',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
    });

    if (result.isConfirmed) {
      setActionLoading(prev => ({ ...prev, [path.id]: 'publishing' }));
      try {
        await learningPathService.publishLearningPath(path.id);
        
        await Swal.fire({
          title: 'Published!',
          text: 'Learning path has been published successfully.',
          icon: 'success',
          confirmButtonColor: '#10b981',
        });
        
        // Refresh the list
        fetchLearningPaths();
      } catch (error) {
        await Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to publish learning path',
          icon: 'error',
          confirmButtonColor: '#ef4444',
        });
      } finally {
        setActionLoading(prev => ({ ...prev, [path.id]: null }));
      }
    }
  };

  const handleArchive = async (path) => {
    const result = await Swal.fire({
      title: 'Archive Learning Path?',
      text: `Are you sure you want to archive "${path.title}"? This will remove it from public view.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Archive',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#f59e0b',
    });

    if (result.isConfirmed) {
      setActionLoading(prev => ({ ...prev, [path.id]: 'archiving' }));
      try {
        await learningPathService.archiveLearningPath(path.id);
        
        await Swal.fire({
          title: 'Archived!',
          text: 'Learning path has been archived successfully.',
          icon: 'success',
          confirmButtonColor: '#f59e0b',
        });
        
        // Refresh the list
        fetchLearningPaths();
      } catch (error) {
        await Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to archive learning path',
          icon: 'error',
          confirmButtonColor: '#ef4444',
        });
      } finally {
        setActionLoading(prev => ({ ...prev, [path.id]: null }));
      }
    }
  };

  const handleDelete = async (path) => {
    const result = await Swal.fire({
      title: 'Delete Learning Path?',
      text: `Are you sure you want to delete "${path.title}"? This action cannot be undone.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setActionLoading(prev => ({ ...prev, [path.id]: 'deleting' }));
      try {
        await learningPathService.deleteLearningPath(path.id);
        
        await Swal.fire({
          title: 'Deleted!',
          text: 'Learning path has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#10b981',
        });
        
        // Refresh the list
        fetchLearningPaths();
        
        // If the deleted path was selected, clear selection
        if (selectedPath?.id === path.id && onPathSelect) {
          onPathSelect(null);
        }
      } catch (error) {
        await Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to delete learning path',
          icon: 'error',
          confirmButtonColor: '#ef4444',
        });
      } finally {
        setActionLoading(prev => ({ ...prev, [path.id]: null }));
      }
    }
  };

  // Action buttons component for each path
  const PathActions = ({ path }) => {
    const isLoading = actionLoading[path.id];
    const status = getPathProperty(path, 'status', '').toLowerCase();

    return (
      <div className="flex items-center gap-1 mt-2">
        {/* Publish Button - Show for draft status */}
        {status === 'draft' && (
          <Button
            variant="ghost"
            size="icon"
            iconName={isLoading === 'publishing' ? 'Loader' : 'Send'}
            className="h-6 w-6 text-success hover:text-success hover:bg-success/10"
            onClick={(e) => {
              e.stopPropagation();
              handlePublish(path);
            }}
            disabled={isLoading}
            title="Publish"
          />
        )}

        {/* Archive Button - Show for published status */}
        {status === 'published' && (
          <Button
            variant="ghost"
            size="icon"
            iconName={isLoading === 'archiving' ? 'Loader' : 'Archive'}
            className="h-6 w-6 text-warning hover:text-warning hover:bg-warning/10"
            onClick={(e) => {
              e.stopPropagation();
              handleArchive(path);
            }}
            disabled={isLoading}
            title="Archive"
          />
        )}

        {/* Edit Button - Always show */}
        <Button
          variant="ghost"
          size="icon"
          iconName="Edit"
          className="h-6 w-6 text-amber-600 hover:text-primary hover:bg-primary/10"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(path);
          }}
          disabled={isLoading}
          title="Edit"
        />

        {/* Delete Button - Always show */}
        <Button
          variant="ghost"
          size="icon"
          iconName={isLoading === 'deleting' ? 'Loader' : 'Trash2'}
          className="h-6 w-6 text-error hover:text-error hover:bg-error/10"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(path);
          }}
          disabled={isLoading}
          title="Delete"
        />
      </div>
    );
  };

  // Fetch learning paths from backend
  const fetchLearningPaths = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await learningPathService.getAllLearningPaths();
      
      // Extract learning paths from the nested structure
      let paths = [];
      const responseData = response.data;
      
      if (responseData.success && responseData.data) {
        // Check if data is an array directly
        if (Array.isArray(responseData.data)) {
          paths = responseData.data;
        } 
        // Check if data has a learningPaths property
        else if (responseData.data.learningPaths && Array.isArray(responseData.data.learningPaths)) {
          paths = responseData.data.learningPaths;
        }
        // Check if data has a items/properties that might contain the array
        else if (responseData.data.items && Array.isArray(responseData.data.items)) {
          paths = responseData.data.items;
        }
        // Check if data has a results property
        else if (responseData.data.results && Array.isArray(responseData.data.results)) {
          paths = responseData.data.results;
        }
        // Check if data has a docs property
        else if (responseData.data.docs && Array.isArray(responseData.data.docs)) {
          paths = responseData.data.docs;
        }
        // If data is an object with pagination, look for the array in any property
        else {
          const dataObj = responseData.data;
          // Try to find any array property in the data object
          for (const key in dataObj) {
            if (Array.isArray(dataObj[key])) {
              paths = dataObj[key];
              break;
            }
          }
        }
      }
      
      setLearningPaths(paths);
      
      // Fetch module data for each learning path
      await fetchModuleDataForPaths(paths);
      
      // Initialize expanded state for categories
      const categories = [...new Set(paths.map(path => path.category || 'Uncategorized'))];
      const initialExpandedState = {};
      categories.forEach(category => {
        initialExpandedState[category] = true;
      });
      setExpandedCategories(initialExpandedState);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch learning paths');
    } finally {
      setLoading(false);
    }
  };

  // Fetch module data for all learning paths
  const fetchModuleDataForPaths = async (paths) => {
    const moduleDataMap = {};
    
    // Fetch module data for each path
    const modulePromises = paths.map(async (path) => {
      try {
        // Get modules for this learning path
        const modulesResponse = await moduleService.getModulesByLearningPath(path.id);
        const modules = modulesResponse.data.data || [];
        
        // Calculate total duration from modules
        const totalDuration = modules.reduce((total, module) => {
          return total + (module.estimatedMinutes || 0);
        }, 0);
        
        moduleDataMap[path.id] = {
          moduleCount: modules.length,
          totalDuration: totalDuration
        };
        
      } catch (err) {
        // Set default values if module fetch fails
        moduleDataMap[path.id] = {
          moduleCount: 0,
          totalDuration: 0
        };
      }
    });
    
    // Wait for all module data to be fetched
    await Promise.all(modulePromises);
    setModuleData(moduleDataMap);
  };

  // Group learning paths by category
  const groupPathsByCategory = (paths) => {
    if (!Array.isArray(paths)) {
      return {};
    }
    
    const grouped = {};
    
    paths.forEach(path => {
      const category = path.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(path);
    });
    
    return grouped;
  };

  // Get icon for category based on category name
  const getCategoryIcon = (category) => {
    const iconMap = {
      'ai-fundamentals': 'Brain',
      'machine-learning': 'Cpu',
      'data-science': 'BarChart3',
      'natural-language-processing': 'MessageSquare',
      'computer-vision': 'Eye',
      'robotics': 'Settings',
      'uncategorized': 'Folder',
      'ai fundamentals': 'Brain',
      'machine learning': 'Cpu',
      'data science': 'BarChart3',
      'natural language processing': 'MessageSquare'
    };
    
    return iconMap[category?.toLowerCase()] || 'Folder';
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev?.[categoryId]
    }));
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-muted-foreground bg-muted';
    
    switch (status?.toLowerCase()) {
      case 'published': 
      case 'active': 
      case 'public': 
        return 'text-success bg-success/10';
      case 'draft': 
        return 'text-muted-foreground bg-muted';
      case 'review': 
      case 'pending': 
        return 'text-warning bg-warning/10';
      case 'archived': 
      case 'inactive': 
        return 'text-error bg-error/10';
      default: 
        return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusDisplay = (status) => {
    if (!status) return 'Unknown';
    
    const statusMap = {
      'published': 'Published',
      'active': 'Active',
      'public': 'Public',
      'draft': 'Draft',
      'review': 'In Review',
      'pending': 'Pending',
      'archived': 'Archived',
      'inactive': 'Inactive'
    };
    
    return statusMap[status?.toLowerCase()] || status;
  };

  // Format duration from minutes to readable format
  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return 'N/A';
    
    const mins = parseInt(minutes);
    if (isNaN(mins)) return 'N/A';
    
    if (mins < 60) {
      return `${mins} min`;
    } else {
      const hours = Math.floor(mins / 60);
      const remainingMinutes = mins % 60;
      
      if (remainingMinutes === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
      } else {
        return `${hours}h ${remainingMinutes}m`;
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Safe access to path properties with fallbacks
  const getPathProperty = (path, property, fallback = 'N/A') => {
    return path[property] !== undefined && path[property] !== null ? path[property] : fallback;
  };

  // Get module count for a path
  const getModuleCount = (pathId) => {
    return moduleData[pathId]?.moduleCount || 0;
  };

  // Get total duration for a path
  const getTotalDuration = (pathId) => {
    return moduleData[pathId]?.totalDuration || 0;
  };

  // Calculate total enrollments across all paths
  const getTotalEnrollments = () => {
    return learningPaths.reduce((acc, path) => {
      return acc + (parseInt(getPathProperty(path, 'enrollmentCount', 0)) || 0);
    }, 0);
  };

  // Calculate total modules across all paths
  const getTotalModules = () => {
    return Object.values(moduleData).reduce((acc, data) => {
      return acc + (data.moduleCount || 0);
    }, 0);
  };

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  // Safe grouping of paths
  const groupedPaths = groupPathsByCategory(learningPaths);
  const categories = Object.keys(groupedPaths);

  // Filter paths based on search term
  const filteredGroupedPaths = {};
  categories.forEach(category => {
    const filteredPaths = groupedPaths[category].filter(path => {
      const title = getPathProperty(path, 'title', '').toLowerCase();
      const description = getPathProperty(path, 'description', '').toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return title.includes(search) || description.includes(search);
    });
    
    if (filteredPaths.length > 0 || searchTerm === '') {
      filteredGroupedPaths[category] = filteredPaths;
    }
  });

  return (
    <div className={`
      h-full bg-card border-r border-border transition-all duration-300 flex flex-col
      ${isCollapsed ? 'w-16' : 'w-80'}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-foreground">Learning Paths</h2>
              <p className="text-xs text-muted-foreground">Manage AI education content</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            iconName={isCollapsed ? "ChevronRight" : "ChevronLeft"}
            onClick={onToggleCollapse}
          />
        </div>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search learning paths..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Create New Path */}
      <div className="p-4 border-b border-border">
        <Button
          variant="default"
          size={isCollapsed ? "icon" : "sm"}
          iconName="Plus"
          iconPosition={isCollapsed ? undefined : "left"}
          onClick={onCreatePath}
          fullWidth={!isCollapsed}
        >
          {!isCollapsed && "New Path"}
        </Button>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(filteredGroupedPaths).length > 0 ? (
          Object.keys(filteredGroupedPaths).map((category) => (
            <div key={category} className="border-b border-border last:border-b-0">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className={`
                  w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors
                  ${selectedCategory === category ? 'bg-primary/5 text-primary' : 'text-foreground'}
                `}
              >
                <Icon name={getCategoryIcon(category)} size={20} />
                {!isCollapsed && (
                  <>
                    <div className="flex-1">
                      <div className="font-medium">{category}</div>
                      <div className="text-xs text-muted-foreground">
                        {filteredGroupedPaths[category].length} path{filteredGroupedPaths[category].length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <Icon 
                      name={expandedCategories[category] ? "ChevronDown" : "ChevronRight"} 
                      size={16} 
                      className="text-muted-foreground"
                    />
                  </>
                )}
              </button>

              {/* Paths */}
              {!isCollapsed && expandedCategories[category] && (
                <div className="pb-2">
                  {filteredGroupedPaths[category].map((path) => (
                    <button
                      key={path.id}
                      onClick={() => onPathSelect(path)}
                      className={`
                        w-full flex items-start gap-3 p-3 mx-2 rounded-lg text-left transition-colors
                        ${selectedPath?.id === path.id 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'hover:bg-muted/50'
                        }
                      `}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm mb-1 truncate">
                          {getPathProperty(path, 'title', 'Untitled Path')}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(getPathProperty(path, 'status'))}`}>
                            {getStatusDisplay(getPathProperty(path, 'status'))}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs opacity-75">
                          <span>{getModuleCount(path.id)} modules</span>
                          <span>{formatDuration(getTotalDuration(path.id))}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs opacity-75 mt-1">
                          <span>{getPathProperty(path, 'enrollmentCount', 0)} enrolled</span>
                          <span>Updated {formatDate(getPathProperty(path, 'updatedAt'))}</span>
                        </div>
                        
                        {/* Action Buttons */}
                        <PathActions path={path} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          !isCollapsed && (
            <div className="p-4 text-center">
              <Icon name="Search" size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'No paths found matching your search' : 'No learning paths available'}
              </p>
            </div>
          )
        )}
      </div>

      {/* Footer Stats */}
      {!isCollapsed && learningPaths.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-foreground">
                {learningPaths.length}
              </div>
              <div className="text-xs text-muted-foreground">Total Paths</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">
                {getTotalEnrollments()}
              </div>
              <div className="text-xs text-muted-foreground">Total Enrollments</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center mt-3">
            <div>
              <div className="text-lg font-semibold text-foreground">
                {getTotalModules()}
              </div>
              <div className="text-xs text-muted-foreground">Total Modules</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">
                {formatDuration(Object.values(moduleData).reduce((acc, data) => acc + (data.totalDuration || 0), 0))}
              </div>
              <div className="text-xs text-muted-foreground">Total Duration</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modals */}
      
      <EditLearningPathModal 
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        editingPath={editingPath}
        onUpdate={handleEditUpdate}
      />
    </div>
  );
};

export default PathCategorySidebar;