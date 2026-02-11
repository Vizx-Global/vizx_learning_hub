import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import learningPathService from '../services/learningPathService';
import categoryService from '../../../../api/categoryService';
import toast from 'react-hot-toast';

const CreateLearningPath = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');

  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    categoryId: '',
    subCategoryId: '',
    difficulty: 'BEGINNER',
    estimatedHours: '',
    minEstimatedHours: '',
    maxEstimatedHours: '',
    thumbnailUrl: '',
    bannerUrl: '',
    iconUrl: '',
    prerequisites: [],
    learningObjectives: [],
    tags: [],
    skills: [],
    isPublic: true,
    isFeatured: false,
    featuredOrder: null
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        if (response.success) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    setFormData(prev => ({ ...prev, categoryId, subCategoryId: '' }));
    setSubCategories([]);
    if (categoryId) {
      try {
        const response = await categoryService.getSubCategories(categoryId);
        if (response.success) {
          setSubCategories(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch subcategories:', err);
      }
    }
  };


  const [tempInputs, setTempInputs] = useState({
    prerequisite: '',
    learningObjective: '',
    tag: '',
    skill: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTempInputChange = (e) => {
    const { name, value } = e.target;
    setTempInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addArrayItem = (arrayName, inputName) => {
    const value = tempInputs[inputName].trim();
    if (value) {
      setFormData(prev => ({
        ...prev,
        [arrayName]: [...prev[arrayName], value]
      }));
      setTempInputs(prev => ({
        ...prev,
        [inputName]: ''
      }));
    }
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e, arrayName, inputName) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addArrayItem(arrayName, inputName);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.categoryId) {
      setError('Category is required');
      return false;
    }
    if (!formData.estimatedHours || parseFloat(formData.estimatedHours) <= 0) {
      setError('A positive number of estimated hours is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        minEstimatedHours: formData.minEstimatedHours ? parseFloat(formData.minEstimatedHours) : undefined,
        maxEstimatedHours: formData.maxEstimatedHours ? parseFloat(formData.maxEstimatedHours) : undefined,
        featuredOrder: formData.featuredOrder ? parseInt(formData.featuredOrder) : undefined
      };

      // Remove empty optional fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === null || submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      const response = await learningPathService.createLearningPath(submitData);
      
      if (response.data.success) {
        toast.success('Learning path created successfully');
        onSuccess(response.data.data);
        handleClose();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create learning path';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      categoryId: '',
      subCategoryId: '',
      difficulty: 'BEGINNER',
      estimatedHours: '',
      minEstimatedHours: '',
      maxEstimatedHours: '',
      thumbnailUrl: '',
      bannerUrl: '',
      iconUrl: '',
      prerequisites: [],
      learningObjectives: [],
      tags: [],
      skills: [],
      isPublic: true,
      isFeatured: false,
      featuredOrder: null
    });
    setTempInputs({
      prerequisite: '',
      learningObjective: '',
      tag: '',
      skill: ''
    });
    setError(null);
    setActiveTab('basic');
    onClose();
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: 'FileText' },
    { id: 'details', label: 'Details', icon: 'ListChecks' },
    { id: 'settings', label: 'Settings', icon: 'Settings' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Create Learning Path</h2>
            <p className="text-sm text-muted-foreground mt-1">Add a new learning path to your platform</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            iconName="X"
            onClick={handleClose}
            disabled={loading}
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
            <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-error">Error</p>
              <p className="text-sm text-error/80 mt-1">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-error hover:text-error/80">
              <Icon name="X" size={16} />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors
                ${activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }
              `}
            >
              <Icon name={tab.icon} size={16} />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., AI Fundamentals"
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="Brief one-line description"
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description <span className="text-error">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed description of the learning path"
                  rows={4}
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category <span className="text-error">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleCategoryChange}
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Subcategory
                  </label>
                  <select
                    name="subCategoryId"
                    value={formData.subCategoryId}
                    onChange={handleInputChange}
                    disabled={!formData.categoryId}
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  >
                    <option value="">Select Subcategory</option>
                    {subCategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Difficulty Level
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    name="estimatedHours"
                    value={formData.estimatedHours}
                    onChange={handleInputChange}
                    placeholder="8"
                    step="0.5"
                    min="0"
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Min Hours
                  </label>
                  <input
                    type="number"
                    name="minEstimatedHours"
                    value={formData.minEstimatedHours}
                    onChange={handleInputChange}
                    placeholder="6"
                    step="0.5"
                    min="0"
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Max Hours
                  </label>
                  <input
                    type="number"
                    name="maxEstimatedHours"
                    value={formData.maxEstimatedHours}
                    onChange={handleInputChange}
                    placeholder="10"
                    step="0.5"
                    min="0"
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Prerequisites */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Prerequisites
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    name="prerequisite"
                    value={tempInputs.prerequisite}
                    onChange={handleTempInputChange}
                    onKeyPress={(e) => handleKeyPress(e, 'prerequisites', 'prerequisite')}
                    placeholder="Add a prerequisite and press Enter"
                    className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Plus"
                    onClick={() => addArrayItem('prerequisites', 'prerequisite')}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.prerequisites.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {item}
                      <button
                        onClick={() => removeArrayItem('prerequisites', index)}
                        className="hover:text-primary/80"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Learning Objectives */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Learning Objectives
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    name="learningObjective"
                    value={tempInputs.learningObjective}
                    onChange={handleTempInputChange}
                    onKeyPress={(e) => handleKeyPress(e, 'learningObjectives', 'learningObjective')}
                    placeholder="Add a learning objective and press Enter"
                    className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Plus"
                    onClick={() => addArrayItem('learningObjectives', 'learningObjective')}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.learningObjectives.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-full text-sm"
                    >
                      {item}
                      <button
                        onClick={() => removeArrayItem('learningObjectives', index)}
                        className="hover:text-success/80"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </span>
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
                    name="tag"
                    value={tempInputs.tag}
                    onChange={handleTempInputChange}
                    onKeyPress={(e) => handleKeyPress(e, 'tags', 'tag')}
                    placeholder="Add a tag and press Enter"
                    className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Plus"
                    onClick={() => addArrayItem('tags', 'tag')}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-muted text-foreground rounded-full text-sm"
                    >
                      {item}
                      <button
                        onClick={() => removeArrayItem('tags', index)}
                        className="hover:text-foreground/80"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    name="skill"
                    value={tempInputs.skill}
                    onChange={handleTempInputChange}
                    onKeyPress={(e) => handleKeyPress(e, 'skills', 'skill')}
                    placeholder="Add a skill and press Enter"
                    className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Plus"
                    onClick={() => addArrayItem('skills', 'skill')}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-warning/10 text-warning rounded-full text-sm"
                    >
                      {item}
                      <button
                        onClick={() => removeArrayItem('skills', index)}
                        className="hover:text-warning/80"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="font-medium text-foreground">Public Access</div>
                  <p className="text-sm text-muted-foreground">Make this path visible to all users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted-foreground/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="font-medium text-foreground">Featured Path</div>
                  <p className="text-sm text-muted-foreground">Display on featured sections</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted-foreground/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {formData.isFeatured && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Featured Order
                  </label>
                  <input
                    type="number"
                    name="featuredOrder"
                    value={formData.featuredOrder || ''}
                    onChange={handleInputChange}
                    placeholder="1"
                    min="1"
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Lower numbers appear first in featured sections
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            {activeTab !== 'basic' && (
              <Button
                variant="outline"
                iconName="ChevronLeft"
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.id === activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1].id);
                  }
                }}
                disabled={loading}
              >
                Previous
              </Button>
            )}
            {activeTab !== 'settings' ? (
              <Button
                variant="default"
                iconName="ChevronRight"
                iconPosition="right"
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.id === activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1].id);
                  }
                }}
                disabled={loading}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="default"
                iconName={loading ? "Loader" : "Check"}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Path'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLearningPath;