import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import moduleService from '../services/moduleService';
import CreateModuleModal from './CreateModuleModal';
import ModuleViewModal from './ModuleViewModal'; 
import Swal from 'sweetalert2';

// Separate Edit Modal Component to prevent re-renders
const EditModuleModal = ({ 
  isOpen, 
  onClose, 
  editingModule, 
  onUpdate 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    estimatedMinutes: 0,
    difficulty: 'BEGINNER',
    category: '',
    learningObjectives: [],
    tags: [],
    isActive: true
  });
  const [newObjective, setNewObjective] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Refs for inputs
  const titleInputRef = useRef(null);

  // Initialize form data when module changes
  useEffect(() => {
    if (editingModule) {
      setFormData({
        title: editingModule.title || '',
        description: editingModule.description || '',
        shortDescription: editingModule.shortDescription || '',
        estimatedMinutes: editingModule.estimatedMinutes || 0,
        difficulty: editingModule.difficulty || 'BEGINNER',
        category: editingModule.category || '',
        learningObjectives: editingModule.learningObjectives || [],
        tags: editingModule.tags || [],
        isActive: editingModule.isActive !== undefined ? editingModule.isActive : true
      });
    }
  }, [editingModule]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && editingModule) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, editingModule]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleAddObjective = useCallback(() => {
    if (newObjective.trim() && !formData.learningObjectives.includes(newObjective.trim())) {
      setFormData(prev => ({
        ...prev,
        learningObjectives: [...prev.learningObjectives, newObjective.trim()]
      }));
      setNewObjective('');
    }
  }, [newObjective, formData.learningObjectives]);

  const handleRemoveObjective = useCallback((objectiveToRemove) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter(obj => obj !== objectiveToRemove)
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

  const handleObjectiveKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddObjective();
    }
  }, [handleAddObjective]);

  const handleTagKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingModule) return;

    setIsLoading(true);
    
    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        estimatedMinutes: parseInt(formData.estimatedMinutes),
        difficulty: formData.difficulty,
        category: formData.category,
        learningObjectives: formData.learningObjectives,
        tags: formData.tags,
        isActive: formData.isActive
      };

      await moduleService.updateModule(editingModule.id, updateData);
      
      await Swal.fire({
        title: 'Updated!',
        text: 'Module has been updated successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981',
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      await Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to update module',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !editingModule) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Edit Module
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
              ref={titleInputRef}
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="Enter module title"
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
              placeholder="Enter module description"
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Short Description
            </label>
            <textarea
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="Enter short description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Estimated Minutes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Estimated Minutes *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.estimatedMinutes}
                onChange={(e) => handleInputChange('estimatedMinutes', e.target.value)}
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

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="Enter module category"
            />
          </div>

          {/* Learning Objectives */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Learning Objectives
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyPress={handleObjectiveKeyPress}
                className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                placeholder="Add a learning objective"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddObjective}
              >
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {formData.learningObjectives.map((objective, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <span className="text-sm text-foreground">• {objective}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveObjective(objective)}
                    className="text-error hover:text-error/80 transition-colors"
                  >
                    <Icon name="X" size={16} />
                  </button>
                </div>
              ))}
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

          {/* Is Active */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
              />
              <span className="text-sm font-medium text-foreground">
                Active Module
              </span>
            </label>
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
                'Update Module'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PathStructurePanel = ({ 
  selectedPath, 
  onModuleReorder, 
  onModuleSelect, 
  selectedModule,
  onDeleteModule 
}) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [draggedModule, setDraggedModule] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingModule, setViewingModule] = useState(null);
  const [moduleContent, setModuleContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // Safe access to selectedPath properties
  const getSelectedPathTitle = () => {
    return selectedPath?.title || 'No Path Selected';
  };

  const getSelectedPathId = () => {
    return selectedPath?.id || null;
  };

  // Fetch modules for the selected learning path
  const fetchModules = async () => {
    const pathId = getSelectedPathId();
    if (!pathId) {
      setModules([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await moduleService.getModulesByLearningPath(pathId);
      const modulesData = response.data.data || [];
      
      // Sort modules by orderIndex
      const sortedModules = modulesData.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      setModules(sortedModules);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  };

  // Handle View Module - fetch full module content
  const handleViewModule = async (module, e) => {
    e?.stopPropagation();
    
    setViewingModule(module);
    setContentLoading(true);
    setShowViewModal(true);
    
    try {
      const response = await moduleService.getModuleById(module.id);
      setModuleContent(response.data.data);
    } catch (error) {
      console.error('Error fetching module content:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to load module content',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
      setShowViewModal(false);
    } finally {
      setContentLoading(false);
    }
  };

  // Handle View Modal Close
  const handleViewClose = () => {
    setShowViewModal(false);
    setViewingModule(null);
    setModuleContent(null);
  };

  // Handle add module button click
  const handleAddModule = () => {
    if (!getSelectedPathId()) {
      Swal.fire({
        title: 'No Path Selected',
        text: 'Please select a learning path first.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }
    setShowCreateModal(true);
  };

  // Handle module creation
  const handleModuleCreated = (newModule) => {
    // Add the new module to the list and sort by orderIndex
    setModules(prev => [...prev, newModule].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)));
    setShowCreateModal(false);
  };

  // Edit Modal Handlers
  const handleEdit = useCallback((module, e) => {
    e?.stopPropagation();
    setEditingModule(module);
    setShowEditModal(true);
  }, []);

  const handleEditClose = useCallback(() => {
    setShowEditModal(false);
    setEditingModule(null);
  }, []);

  const handleEditUpdate = useCallback(() => {
    fetchModules();
  }, []);

  // Action handlers with SweetAlert
  const handleActivateModule = async (module, e) => {
    e?.stopPropagation();
    const result = await Swal.fire({
      title: 'Activate Module?',
      text: `Are you sure you want to activate "${module.title}"? This will make it available to users.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Activate',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
    });

    if (result.isConfirmed) {
      setActionLoading(prev => ({ ...prev, [module.id]: 'activating' }));
      try {
        await moduleService.activateModule(module.id);
        
        await Swal.fire({
          title: 'Activated!',
          text: 'Module has been activated successfully.',
          icon: 'success',
          confirmButtonColor: '#10b981',
        });
        
        // Refresh the modules list
        fetchModules();
      } catch (error) {
        await Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to activate module',
          icon: 'error',
          confirmButtonColor: '#ef4444',
        });
      } finally {
        setActionLoading(prev => ({ ...prev, [module.id]: null }));
      }
    }
  };

  const handleDeactivateModule = async (module, e) => {
    e?.stopPropagation();
    const result = await Swal.fire({
      title: 'Deactivate Module?',
      text: `Are you sure you want to deactivate "${module.title}"? This will hide it from users.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Deactivate',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#f59e0b',
    });

    if (result.isConfirmed) {
      setActionLoading(prev => ({ ...prev, [module.id]: 'deactivating' }));
      try {
        await moduleService.deactivateModule(module.id);
        
        await Swal.fire({
          title: 'Deactivated!',
          text: 'Module has been deactivated successfully.',
          icon: 'success',
          confirmButtonColor: '#f59e0b',
        });
        
        // Refresh the modules list
        fetchModules();
      } catch (error) {
        await Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to deactivate module',
          icon: 'error',
          confirmButtonColor: '#ef4444',
        });
      } finally {
        setActionLoading(prev => ({ ...prev, [module.id]: null }));
      }
    }
  };

  const handleDeleteModule = async (module, e) => {
    e?.stopPropagation();
    const result = await Swal.fire({
      title: 'Delete Module?',
      text: `Are you sure you want to delete "${module.title}"? This action cannot be undone.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setActionLoading(prev => ({ ...prev, [module.id]: 'deleting' }));
      try {
        await moduleService.deleteModule(module.id);
        
        await Swal.fire({
          title: 'Deleted!',
          text: 'Module has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#10b981',
        });
        
        // Refresh the modules list
        fetchModules();
        
        // If the deleted module was selected, clear selection
        if (selectedModule?.id === module.id && onModuleSelect) {
          onModuleSelect(null);
        }
        
        // Call parent handler
        if (onDeleteModule) {
          onDeleteModule(module.id);
        }
      } catch (error) {
        await Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to delete module',
          icon: 'error',
          confirmButtonColor: '#ef4444',
        });
      } finally {
        setActionLoading(prev => ({ ...prev, [module.id]: null }));
      }
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, module) => {
    setDraggedModule(module);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetModule) => {
    e?.preventDefault();
    if (!draggedModule || draggedModule?.id === targetModule?.id || !getSelectedPathId()) {
      setDraggedModule(null);
      return;
    }

    try {
      // Update module order in backend
      await moduleService.updateModuleOrder(draggedModule.id, {
        orderIndex: targetModule.orderIndex,
        learningPathId: getSelectedPathId()
      });
      
      // Call parent handler for reordering
      if (onModuleReorder) {
        onModuleReorder(draggedModule, targetModule);
      }
      
      // Refresh modules to get updated order
      await fetchModules();
      
      await Swal.fire({
        title: 'Reordered!',
        text: 'Module order has been updated successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 1500,
        showConfirmButton: false
      });
      
    } catch (err) {
      await Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to update module order',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setDraggedModule(null);
    }
  };

  // Action buttons component for each module
  const ModuleActions = ({ module }) => {
    const isLoading = actionLoading[module.id];
    const isActive = module.isActive !== undefined ? module.isActive : module.status === 'active';

    return (
      <div className="flex items-center gap-1">
        {/* Activate/Deactivate Button */}
        {isActive ? (
          <Button
            variant="ghost"
            size="icon"
            iconName={isLoading === 'deactivating' ? 'Loader' : 'Pause'}
            className="h-6 w-6 text-warning hover:text-warning hover:bg-warning/10"
            onClick={(e) => handleDeactivateModule(module, e)}
            disabled={isLoading}
            title="Deactivate"
          />
        ) : (
          <Button
            variant="ghost"
            size="icon"
            iconName={isLoading === 'activating' ? 'Loader' : 'Play'}
            className="h-6 w-6 text-success hover:text-success hover:bg-success/10"
            onClick={(e) => handleActivateModule(module, e)}
            disabled={isLoading}
            title="Activate"
          />
        )}

        {/* Edit Button */}
        <Button
          variant="ghost"
          size="icon"
          iconName="Edit"
          className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10"
          onClick={(e) => handleEdit(module, e)}
          disabled={isLoading}
          title="Edit"
        />

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          iconName={isLoading === 'deleting' ? 'Loader' : 'Trash2'}
          className="h-6 w-6 text-error hover:text-error hover:bg-error/10"
          onClick={(e) => handleDeleteModule(module, e)}
          disabled={isLoading}
          title="Delete"
        />
      </div>
    );
  };

  // Helper functions
  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return 'text-muted-foreground bg-muted';
    
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'text-success bg-success/10';
      case 'intermediate': return 'text-warning bg-warning/10';
      case 'advanced': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-muted-foreground bg-muted';
    
    switch (status.toLowerCase()) {
      case 'published': 
      case 'active': 
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
      'draft': 'Draft',
      'review': 'In Review',
      'pending': 'Pending',
      'archived': 'Archived',
      'inactive': 'Inactive'
    };
    
    return statusMap[status.toLowerCase()] || status;
  };

  const getModuleIcon = (contentType) => {
    if (!contentType) return 'FileText';
    
    const iconMap = {
      'text': 'FileText',
      'video': 'Video',
      'audio': 'Headphones',
      'interactive': 'Code',
      'document': 'File',
      'quiz': 'HelpCircle',
      'assessment': 'ClipboardCheck',
      'external_link': 'ExternalLink',
      'microsoft-learn': 'BookOpen',
      'custom-quiz': 'HelpCircle',
      'hands-on': 'Code'
    };
    
    return iconMap[contentType.toLowerCase()] || 'FileText';
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

  // Calculate total duration of all modules
  const getTotalDuration = () => {
    return modules.reduce((total, module) => {
      return total + (module.estimatedMinutes || 0);
    }, 0);
  };

  // Calculate average completion rate (simulated for now)
  const getAverageCompletionRate = () => {
    if (modules.length === 0) return 0;
    
    const totalRate = modules.reduce((acc, module) => {
      if (module.status === 'published' || module.status === 'active') {
        return acc + 75;
      }
      return acc + 0;
    }, 0);
    
    return Math.round(totalRate / modules.length);
  };

  useEffect(() => {
    fetchModules();
  }, [selectedPath?.id]);

  // Show empty state when no path is selected
  if (!selectedPath) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 rounded-lg">
        <div className="text-center">
          <Icon name="FolderOpen" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Path Selected</h3>
          <p className="text-muted-foreground">Select a learning path to view its structure</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{getSelectedPathTitle()}</h3>
              <p className="text-sm text-muted-foreground">Loading modules...</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Icon name="Loader" size={32} className="animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading modules...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{getSelectedPathTitle()}</h3>
              <p className="text-sm text-muted-foreground">Error loading modules</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Icon name="AlertTriangle" size={32} className="text-error mx-auto mb-2" />
            <p className="text-sm text-error mb-2">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchModules}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full bg-card rounded-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{getSelectedPathTitle()}</h3>
              <p className="text-sm text-muted-foreground">
                {modules.length} modules • {formatDuration(getTotalDuration())} total
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              iconName="Plus"
              iconPosition="left"
              onClick={handleAddModule}
            >
              Add Module
            </Button>
          </div>
        </div>

        {/* Module List */}
        <div className="flex-1 overflow-y-auto p-4">
          {modules.length > 0 ? (
            <div className="space-y-2">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, module)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, module)}
                  onClick={() => onModuleSelect && onModuleSelect(module)}
                  className={`
                    group relative p-4 rounded-lg border cursor-pointer transition-all duration-200
                    ${selectedModule?.id === module.id 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-border bg-card hover:border-primary/50 hover:shadow-sm'
                    }
                    ${draggedModule?.id === module.id ? 'opacity-50' : ''}
                  `}
                >
                  {/* Drag Handle */}
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="GripVertical" size={16} className="text-muted-foreground" />
                  </div>

                  {/* Module Content */}
                  <div className="ml-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name={getModuleIcon(module.contentType)} size={16} className="text-primary" />
                          <span className="text-xs font-mono text-muted-foreground">#{module.orderIndex || index + 1}</span>
                          <h4 className="font-medium text-foreground">{module.title || 'Untitled Module'}</h4>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          {module.difficulty && (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(module.difficulty)}`}>
                              {module.difficulty}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(module.status)}`}>
                            {getStatusDisplay(module.status)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(module.estimatedMinutes)}
                          </span>
                        </div>

                        {/* Description */}
                        {module.description && (
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="FileText" size={14} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground line-clamp-2">
                              {module.description}
                            </span>
                          </div>
                        )}

                        {/* Learning Objectives */}
                        {module.learningObjectives?.length > 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="Target" size={14} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {module.learningObjectives.length} learning objective(s)
                            </span>
                          </div>
                        )}

                        {/* Tags */}
                        {module.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {module.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {module.tags.length > 3 && (
                              <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                                +{module.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Completion Rate and View Module Button */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${getAverageCompletionRate()}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono text-muted-foreground min-w-[40px]">
                              {getAverageCompletionRate()}%
                            </span>
                          </div>
                          
                          {/* View Module Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleViewModule(module, e)}
                            className="whitespace-nowrap bg-primary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Icon name="Eye" size={14} className="mr-1" />
                            View Module
                          </Button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ModuleActions module={module} />
                      </div>
                    </div>
                  </div>

                  {/* Connection Line */}
                  {index < modules.length - 1 && (
                    <div className="absolute left-8 bottom-0 w-px h-4 bg-border translate-y-full" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="BookOpen" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Modules Yet</h3>
              <p className="text-muted-foreground mb-4">This learning path doesn't have any modules yet.</p>
              <Button
                variant="outline"
                iconName="Plus"
                iconPosition="left"
                onClick={handleAddModule}
              >
                Add First Module
              </Button>
            </div>
          )}

          {/* Add Module Placeholder */}
          {modules.length > 0 && (
            <div className="mt-4 p-4 border-2 border-dashed border-border rounded-lg text-center hover:border-primary/50 transition-colors cursor-pointer"
                 onClick={handleAddModule}>
              <Icon name="Plus" size={24} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Add new module</p>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {modules.length > 0 && (
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-foreground">{modules.length}</div>
                <div className="text-xs text-muted-foreground">Modules</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">
                  {getAverageCompletionRate()}%
                </div>
                <div className="text-xs text-muted-foreground">Avg. Completion</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">
                  {formatDuration(getTotalDuration())}
                </div>
                <div className="text-xs text-muted-foreground">Total Duration</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Module Modal */}
      <CreateModuleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        learningPathId={getSelectedPathId()}
        onModuleCreated={handleModuleCreated}
      />

      {/* Edit Module Modal */}
      <EditModuleModal
        isOpen={showEditModal}
        onClose={handleEditClose}
        editingModule={editingModule}
        onUpdate={handleEditUpdate}
      />

      {/* View Module Modal */}
      {showViewModal && (
        <ModuleViewModal
          isOpen={showViewModal}
          onClose={handleViewClose}
          module={viewingModule}
          moduleContent={moduleContent}
          isLoading={contentLoading}
        />
      )}
    </>
  );
};

export default PathStructurePanel;