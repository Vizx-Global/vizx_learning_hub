import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { Checkbox } from '../../../../components/ui/Checkbox';

const ModuleConfigPanel = ({ selectedModule, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    contentType: 'DOCUMENT',
    estimatedMinutes: '',
    difficulty: 'BEGINNER',
    videoUrl: '',
    audioUrl: '',
    documentUrl: '',
    content: '', // For custom content type
    thumbnailUrl: '',
    externalLink: '',
    learningObjectives: [],
    tags: [],
    prerequisites: [],
    attachments: [],
    isActive: true,
    isOptional: false,
    requiresCompletion: true,
    completionPoints: 100,
    maxQuizAttempts: 3
  });
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [errors, setErrors] = useState({});
  const [newObjective, setNewObjective] = useState('');
  const [newTag, setNewTag] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const contentTypeOptions = [
    { value: 'VIDEO', label: 'Video Content' },
    { value: 'AUDIO', label: 'Audio Content' },
    { value: 'DOCUMENT', label: 'Document/PDF' },
    { value: 'CONTENT', label: 'Rich Text Content' },
    { value: 'EXTERNAL', label: 'External Link' },
    { value: 'CUSTOM', label: 'Custom Content' }
  ];

  const difficultyLevels = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
    { value: 'EXPERT', label: 'Expert' }
  ];

  // Initialize form data when selectedModule changes
  useEffect(() => {
    if (selectedModule) {
      console.log('Selected Module:', selectedModule); // Debug log
      
      // Map database fields to form fields
      setFormData({
        title: selectedModule.title || '',
        description: selectedModule.description || '',
        shortDescription: selectedModule.shortDescription || '',
        contentType: selectedModule.contentType || 'DOCUMENT',
        estimatedMinutes: selectedModule.estimatedMinutes || '',
        difficulty: selectedModule.difficulty || 'BEGINNER',
        videoUrl: selectedModule.videoUrl || '',
        audioUrl: selectedModule.audioUrl || '',
        documentUrl: selectedModule.documentUrl || '',
        content: selectedModule.content || '',
        thumbnailUrl: selectedModule.thumbnailUrl || '',
        externalLink: selectedModule.externalLink || '',
        learningObjectives: selectedModule.learningObjectives || [],
        tags: selectedModule.tags || [],
        prerequisites: selectedModule.prerequisites || [],
        attachments: selectedModule.attachments || [],
        isActive: selectedModule.isActive !== false,
        isOptional: selectedModule.isOptional || false,
        requiresCompletion: selectedModule.requiresCompletion !== false,
        completionPoints: selectedModule.completionPoints || 100,
        maxQuizAttempts: selectedModule.maxQuizAttempts || 3
      });
      setErrors({});
      setSaveStatus('');
    }
  }, [selectedModule]);

  const handleInputChange = (field, value) => {
    if (isSaving) return; // Prevent changes while saving
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddObjective = () => {
    if (isSaving) return;
    if (newObjective.trim() && !formData.learningObjectives.includes(newObjective.trim())) {
      setFormData(prev => ({
        ...prev,
        learningObjectives: [...prev.learningObjectives, newObjective.trim()]
      }));
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (objectiveToRemove) => {
    if (isSaving) return;
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter(obj => obj !== objectiveToRemove)
    }));
  };

  const handleAddTag = () => {
    if (isSaving) return;
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    if (isSaving) return;
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddAttachment = () => {
    if (isSaving) return;
    if (attachmentUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, attachmentUrl.trim()]
      }));
      setAttachmentUrl('');
    }
  };

  const handleRemoveAttachment = (attachmentToRemove) => {
    if (isSaving) return;
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(attachment => attachment !== attachmentToRemove)
    }));
  };

  const handleObjectiveKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddObjective();
    }
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleAttachmentKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAttachment();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.estimatedMinutes || parseInt(formData.estimatedMinutes) <= 0) {
      newErrors.estimatedMinutes = 'Valid estimated minutes is required';
    }

    // Validate content based on type
    if (formData.contentType === 'VIDEO' && !formData.videoUrl?.trim()) {
      newErrors.videoUrl = 'Video URL is required for video content';
    }
    
    if (formData.contentType === 'AUDIO' && !formData.audioUrl?.trim()) {
      newErrors.audioUrl = 'Audio URL is required for audio content';
    }
    
    if (formData.contentType === 'DOCUMENT' && !formData.documentUrl?.trim()) {
      newErrors.documentUrl = 'Document URL is required for document content';
    }
    
    if (formData.contentType === 'EXTERNAL' && !formData.externalLink?.trim()) {
      newErrors.externalLink = 'External link is required for external content';
    }
    
    if (formData.contentType === 'CONTENT' && !formData.content?.trim()) {
      newErrors.content = 'Content is required for rich text content';
    }
    
    if (formData.completionPoints < 0 || formData.completionPoints > 1000) {
      newErrors.completionPoints = 'Completion points must be between 0 and 1000';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // Prepare the data in the backend expected format
      const saveData = {
        ...formData,
        // Ensure numeric fields are numbers
        estimatedMinutes: parseInt(formData.estimatedMinutes) || 0,
        completionPoints: parseInt(formData.completionPoints) || 100,
        maxQuizAttempts: parseInt(formData.maxQuizAttempts) || 3
      };
      
      await onSave(saveData);
      setSaveStatus('success');
      
      // Keep success message for 2 seconds, then clear it
      setTimeout(() => {
        setSaveStatus('');
      }, 2000);
      
    } catch (error) {
      setSaveStatus('error');
      console.error('Save error:', error);
      
      // Keep error message for 3 seconds, then clear it
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
      
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: 'Settings' },
    { id: 'content', label: 'Content', icon: 'FileText' },
    { id: 'completion', label: 'Completion', icon: 'CheckCircle' },
    { id: 'attachments', label: 'Attachments', icon: 'Paperclip' },
    { id: 'metadata', label: 'Metadata', icon: 'Tag' }
  ];

  if (!selectedModule) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 rounded-lg">
        <div className="text-center">
          <Icon name="Settings" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Module Selected</h3>
          <p className="text-muted-foreground">Select a module to configure its settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card rounded-lg border border-border overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Module Configuration</h3>
            <p className="text-sm text-muted-foreground">Configure {selectedModule.title}</p>
          </div>
          <div className="flex items-center gap-2">
            {saveStatus === 'success' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-lg">
                <Icon name="CheckCircle" size={16} className="animate-pulse" />
                <span className="text-sm font-medium">Saved!</span>
              </div>
            ) : saveStatus === 'error' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-error/10 text-error rounded-lg">
                <Icon name="AlertCircle" size={16} />
                <span className="text-sm font-medium">Save failed</span>
              </div>
            ) : null}
            
            <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSave} 
              disabled={isSaving}
              className="min-w-32"
            >
              {isSaving ? (
                <>
                  <Icon name="Loader" size={16} className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Saving Overlay */}
      {isSaving && (
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-6 shadow-xl flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <Icon name="Save" size={20} className="absolute inset-0 m-auto text-primary" />
            </div>
            <p className="text-foreground font-medium">Saving changes...</p>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Please wait while we save your module configuration
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border relative">
        {isSaving && (
          <div className="absolute inset-0 bg-white/50 z-5"></div>
        )}
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !isSaving && setActiveTab(tab.id)}
              disabled={isSaving}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5' 
                  : 'text-muted-foreground hover:text-foreground'
                }
                ${isSaving ? 'cursor-not-allowed opacity-70' : ''}
              `}
            >
              <Icon name={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        {isSaving && (
          <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] z-5 rounded-lg"></div>
        )}
        
        {activeTab === 'general' && (
          <div className="space-y-6">
            <Input
              label="Module Title *"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter module title"
              error={errors.title}
              required
              disabled={isSaving}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                disabled={isSaving}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                  errors.description ? 'border-error' : 'border-border'
                } ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                placeholder="Detailed description of the module"
              />
              {errors.description && (
                <p className="text-error text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <Input
              label="Short Description"
              type="text"
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              placeholder="Brief summary (for cards and previews)"
              description="Optional: Short summary for module cards and previews"
              disabled={isSaving}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Content Type *"
                options={contentTypeOptions}
                value={formData.contentType}
                onChange={(value) => handleInputChange('contentType', value)}
                required
                disabled={isSaving}
              />

              <Select
                label="Difficulty Level *"
                options={difficultyLevels}
                value={formData.difficulty}
                onChange={(value) => handleInputChange('difficulty', value)}
                required
                disabled={isSaving}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Estimated Minutes *"
                type="number"
                value={formData.estimatedMinutes}
                onChange={(e) => handleInputChange('estimatedMinutes', e.target.value)}
                placeholder="60"
                min="1"
                error={errors.estimatedMinutes}
                required
                disabled={isSaving}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center">
                <Checkbox
                  label="Active"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex items-center">
                <Checkbox
                  label="Optional"
                  checked={formData.isOptional}
                  onChange={(e) => handleInputChange('isOptional', e.target.checked)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex items-center">
                <Checkbox
                  label="Requires Completion"
                  checked={formData.requiresCompletion}
                  onChange={(e) => handleInputChange('requiresCompletion', e.target.checked)}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Video Content */}
            {formData.contentType === 'VIDEO' && (
              <div className="space-y-4">
                <Input
                  label="Video URL *"
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                  placeholder="http://localhost:3000/uploads/modules/videos/..."
                  error={errors.videoUrl}
                  description="URL to the video file (MP4, MOV, AVI, etc.)"
                  required
                  disabled={isSaving}
                />

                <Input
                  label="Thumbnail URL"
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
                  placeholder="http://localhost:3000/uploads/modules/thumbnails/..."
                  description="Optional: Custom thumbnail image for the video"
                  disabled={isSaving}
                />

                {/* Preview existing video */}
                {formData.videoUrl && !isSaving && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Icon name="Video" size={20} className="text-primary mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-primary mb-1">Video Preview</h4>
                        <p className="text-sm text-primary/80 mb-2">
                          Current video: {formData.videoUrl.split('/').pop()}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            iconName="Play"
                            onClick={() => window.open(formData.videoUrl, '_blank')}
                            disabled={isSaving}
                          >
                            Play Video
                          </Button>
                          {formData.thumbnailUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              iconName="Image"
                              onClick={() => window.open(formData.thumbnailUrl, '_blank')}
                              disabled={isSaving}
                            >
                              View Thumbnail
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Audio Content */}
            {formData.contentType === 'AUDIO' && (
              <div className="space-y-4">
                <Input
                  label="Audio URL *"
                  type="url"
                  value={formData.audioUrl}
                  onChange={(e) => handleInputChange('audioUrl', e.target.value)}
                  placeholder="http://localhost:3000/uploads/modules/audios/..."
                  error={errors.audioUrl}
                  description="URL to the audio file (MP3, WAV, etc.)"
                  required
                  disabled={isSaving}
                />

                {formData.audioUrl && !isSaving && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Icon name="Headphones" size={20} className="text-primary mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-primary mb-1">Audio Preview</h4>
                        <p className="text-sm text-primary/80 mb-2">
                          Current audio: {formData.audioUrl.split('/').pop()}
                        </p>
                        <audio controls className="w-full mt-2">
                          <source src={formData.audioUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Document Content */}
            {formData.contentType === 'DOCUMENT' && (
              <div className="space-y-4">
                {/* <Input
                  label="Document URL *"
                  type="url"
                  value={formData.documentUrl}
                  onChange={(e) => handleInputChange('documentUrl', e.target.value)}
                  placeholder="http://localhost:3000/uploads/modules/documents/..."
                  error={errors.documentUrl}
                  description="URL to the document (PDF, DOCX, PPTX, etc.)"
                  required
                  disabled={isSaving}
                /> */}

                {/* Preview existing document */}
                {formData.documentUrl && !isSaving && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Icon name="FileText" size={20} className="text-primary mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-primary mb-1">Document Preview</h4>
                        <p className="text-sm text-primary/80 mb-2">
                          Current document: {formData.documentUrl.split('/').pop()}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          iconName="ExternalLink"
                          onClick={() => window.open(formData.documentUrl, '_blank')}
                          disabled={isSaving}
                        >
                          View Document
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rich Text Content */}
            {formData.contentType === 'CONTENT' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={8}
                    disabled={isSaving}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                      errors.content ? 'border-error' : 'border-border'
                    } ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    placeholder="Enter your rich text content here..."
                  />
                  {errors.content && (
                    <p className="text-error text-sm mt-1">{errors.content}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports basic HTML formatting and markdown
                  </p>
                </div>
              </div>
            )}

            {/* External Link */}
            {formData.contentType === 'EXTERNAL' && (
              <div className="space-y-4">
                <Input
                  label="External Link URL *"
                  type="url"
                  value={formData.externalLink}
                  onChange={(e) => handleInputChange('externalLink', e.target.value)}
                  placeholder="https://docs.microsoft.com/learn/modules/..."
                  error={errors.externalLink}
                  description="Full URL to external learning resource"
                  required
                  disabled={isSaving}
                />
              </div>
            )}

            {/* Custom Content */}
            {formData.contentType === 'CUSTOM' && (
              <div className="space-y-4">
                <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
                    <div>
                      <h4 className="font-medium text-warning mb-1">Custom Content Type</h4>
                      <p className="text-sm text-warning/80">
                        This content type requires custom implementation. 
                        Contact the development team for setup.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-muted/30 border border-border rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Content Storage Information</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Icon name="Upload" size={16} className="text-primary" />
                  <span>Files should be uploaded to your server storage first</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Link" size={16} className="text-primary" />
                  <span>Paste the full URL to the uploaded file</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Info" size={16} className="text-primary" />
                  <span>Supported formats: MP4, PDF, DOCX, PPTX, MP3, JPG, PNG</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'completion' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Completion Points"
                type="number"
                value={formData.completionPoints}
                onChange={(e) => handleInputChange('completionPoints', e.target.value)}
                min="0"
                max="1000"
                placeholder="100"
                error={errors.completionPoints}
                description="Points awarded upon completion (0-1000)"
                disabled={isSaving}
              />

              <Input
                label="Max Quiz Attempts"
                type="number"
                value={formData.maxQuizAttempts}
                onChange={(e) => handleInputChange('maxQuizAttempts', e.target.value)}
                min="1"
                max="10"
                placeholder="3"
                description="Maximum attempts for quizzes (if applicable)"
                disabled={isSaving}
              />
            </div>

            <div className="p-4 bg-muted/50 border border-border rounded-lg">
              <h4 className="font-medium text-foreground mb-3">Completion Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Module Completion Required</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${formData.requiresCompletion ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {formData.requiresCompletion ? 'Required' : 'Optional'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Points Awarded</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {formData.completionPoints} points
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Estimated Time</span>
                  <span className="px-2 py-1 bg-info/10 text-info text-xs rounded-full">
                    {formData.estimatedMinutes} minutes
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="CheckCircle" size={20} className="text-success mt-0.5" />
                <div>
                  <h4 className="font-medium text-success mb-1">Progress Tracking</h4>
                  <p className="text-sm text-success/80">
                    Learner progress is automatically tracked. Completion status is updated in real-time 
                    and contributes to overall learning path progress.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attachments' && (
          <div className="space-y-6">
            {/* Attachments Management */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Additional Attachments
              </label>
          
              <p className="text-xs text-muted-foreground mb-3">
                Add URLs to supplementary materials (documents, images, links)
              </p>
              
              <div className="space-y-2">
                {formData.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isSaving ? 'bg-muted/50 opacity-70' : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon name="Paperclip" size={16} className="text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm text-foreground truncate">{attachment}</p>
                        <p className="text-xs text-muted-foreground">
                          {attachment.split('/').pop()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        iconName="ExternalLink"
                        onClick={() => !isSaving && window.open(attachment, '_blank')}
                        className="text-muted-foreground hover:text-foreground"
                        disabled={isSaving}
                      />
                      <button
                        type="button"
                        onClick={() => !isSaving && handleRemoveAttachment(attachment)}
                        className="text-error hover:text-error/80 transition-colors disabled:opacity-50"
                        disabled={isSaving}
                      >
                        <Icon name="X" size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {formData.attachments.length === 0 && (
                <div className={`text-center py-8 border border-dashed rounded-lg ${
                  isSaving ? 'border-border/50 opacity-70' : 'border-border'
                }`}>
                  <Icon name="Paperclip" size={32} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No attachments added yet</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-info/5 border border-info/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-info mt-0.5" />
                <div>
                  <h4 className="font-medium text-info mb-1">Attachments Usage</h4>
                  <p className="text-sm text-info/80">
                    Attachments are supplementary materials that appear alongside the main content.
                    They can include worksheets, reference documents, code samples, or additional resources.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metadata' && (
          <div className="space-y-6">
            {/* Learning Objectives */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Learning Objectives
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => !isSaving && setNewObjective(e.target.value)}
                  onKeyPress={handleObjectiveKeyPress}
                  disabled={isSaving}
                  className={`flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                    isSaving ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  placeholder="Add a learning objective"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddObjective}
                  disabled={isSaving}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {formData.learningObjectives.map((objective, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isSaving ? 'bg-muted/50 opacity-70' : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon name="CheckCircle" size={16} className="text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{objective}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => !isSaving && handleRemoveObjective(objective)}
                      className="text-error hover:text-error/80 transition-colors disabled:opacity-50"
                      disabled={isSaving}
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
                  onChange={(e) => !isSaving && setNewTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  disabled={isSaving}
                  className={`flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-primary focus:border-transparent bg-background text-foreground ${
                    isSaving ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  placeholder="Add a tag (e.g., Ethical AI)"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={isSaving}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                      isSaving ? 'bg-primary/5 opacity-70' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => !isSaving && handleRemoveTag(tag)}
                      className="hover:text-error transition-colors disabled:opacity-50"
                      disabled={isSaving}
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Prerequisites (Module IDs)
              </label>
              <div className="space-y-2">
                {formData.prerequisites.map((prereq, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isSaving ? 'bg-muted/50 opacity-70' : 'bg-muted'
                    }`}
                  >
                    <span className="text-sm text-foreground font-mono">{prereq}</span>
                    <button
                      type="button"
                      onClick={() => !isSaving && handleInputChange('prerequisites', formData.prerequisites.filter(p => p !== prereq))}
                      className="text-error hover:text-error/80 transition-colors disabled:opacity-50"
                      disabled={isSaving}
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <Input
                label="Add Prerequisite"
                type="text"
                value=""
                onChange={(e) => {
                  if (!isSaving && e.target.value.trim() && e.key === 'Enter') {
                    handleInputChange('prerequisites', [...formData.prerequisites, e.target.value.trim()]);
                    e.target.value = '';
                  }
                }}
                placeholder="Press Enter to add module ID"
                className="mt-2"
                disabled={isSaving}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleConfigPanel;