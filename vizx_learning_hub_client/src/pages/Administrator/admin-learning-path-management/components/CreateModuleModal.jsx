import React, { useState, useRef } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import moduleService from '../services/moduleService';
import learningPathService from '../services/learningPathService';
import categoryService from '../../../../api/categoryService';
import quizService from '../../../../api/quizService';
import { OrbitProgress } from 'react-loading-indicators';
import Swal from 'sweetalert2';
import { cn } from '../../../../utils/cn';

// Utility functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const validateFileForContentType = (file, contentType) => {
  const maxSizes = {
    VIDEO: 500 * 1024 * 1024,
    AUDIO: 100 * 1024 * 1024,
    DOCUMENT: 50 * 1024 * 1024,
    INTERACTIVE: 200 * 1024 * 1024,
    THUMBNAIL: 5 * 1024 * 1024,
    DEFAULT: 10 * 1024 * 1024,
  };

  const validTypes = {
    VIDEO: ['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/quicktime'],
    AUDIO: ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/x-m4a'],
    DOCUMENT: [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
      'text/plain'
    ],
    INTERACTIVE: ['application/zip', 'application/x-zip-compressed', 'text/html'],
    THUMBNAIL: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  };

  const fileType = file.type;
  const fileSize = file.size;
  const maxSize = maxSizes[contentType] || maxSizes.DEFAULT;

  if (fileSize > maxSize) {
    return { 
      isValid: false, 
      message: `File size must be less than ${formatFileSize(maxSize)}. Current file: ${formatFileSize(fileSize)}` 
    };
  }

  if (validTypes[contentType] && !validTypes[contentType].includes(fileType)) {
    const supportedTypes = validTypes[contentType]
      .join(', ')
      .replace(/application\//g, '')
      .replace(/video\//g, '')
      .replace(/audio\//g, '')
      .replace(/image\//g, '');
    return { 
      isValid: false, 
      message: `Invalid file type for ${contentType}. Supported formats: ${supportedTypes}` 
    };
  }

  return { isValid: true };
};

const CreateModuleModal = ({ 
  isOpen, 
  onClose, 
  learningPathId, 
  onModuleCreated 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [activeStep, setActiveStep] = useState('basic');
  const [categories, setCategories] = useState([]);
  const [isLoadingPath, setIsLoadingPath] = useState(false);
  
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const attachmentsInputRef = useRef(null);

  const [formData, setFormData] = useState({
    // Required fields
    title: '',
    description: '',
    category: '',
    estimatedMinutes: 60,
    
    // Content configuration
    contentType: 'TEXT',
    difficulty: 'BEGINNER',
    
    // Optional fields
    shortDescription: '',
    content: '',
    
    // Content type specific URLs
    videoUrl: '',
    audioUrl: '',
    documentUrl: '',
    externalLink: '',
    
    // Content type specific metadata
    videoDuration: '',
    audioDuration: '',
    documentPages: '',
    interactiveType: '',
    quizQuestions: 0,
    assessmentWeight: 0,
    externalLinkType: '',
    
    // Files
    thumbnailFile: null,
    contentFile: null,
    
    // Arrays
    learningObjectives: [],
    tags: [],
    attachments: [],
    
    // Settings
    completionPoints: 100,
    isActive: true,
    includeQuiz: false,
    
    // Quiz Questions
    quizInstructions: '',
    questions: []
  });

  // Fetch categories and learning path details on mount/open
  React.useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;
      
      try {
        // Fetch categories
        const catRes = await categoryService.getAllCategories();
        setCategories(catRes.data || []);

        // Fetch learning path to get its category
        if (learningPathId) {
          setIsLoadingPath(true);
          const pathRes = await learningPathService.getLearningPathById(learningPathId);
          if (pathRes.data?.data) {
            const pathData = pathRes.data.data;
            // Use path's category name as default if it exists
            const pathCategory = pathData.category || pathData.categoryRef?.name || '';
            if (pathCategory && !formData.category) {
              setFormData(prev => ({ ...prev, category: pathCategory }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch modal data:', err);
      } finally {
        setIsLoadingPath(false);
      }
    };

    fetchData();
  }, [isOpen, learningPathId]);

  const [tempInputs, setTempInputs] = useState({
    learningObjective: '',
    tag: ''
  });

  // Simple input change handler - like CreateLearningPath
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: type === 'checkbox' ? checked : value };
      
      // Clear content when switching away from TEXT type
      if (name === 'contentType' && value !== 'TEXT') {
        newData.content = '';
      }
      
      // Clear content-specific URLs when switching content type
      if (name === 'contentType') {
        newData.videoUrl = '';
        newData.audioUrl = '';
        newData.documentUrl = '';
        newData.externalLink = '';
        newData.contentFile = null;
      }
      
      return newData;
    });
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

  // File handlers
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateFileForContentType(file, 'THUMBNAIL');
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    setFormData(prev => ({ ...prev, thumbnailFile: file }));
    setError(null);
  };

  const handleContentFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateFileForContentType(file, formData.contentType);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    setFormData(prev => ({ ...prev, contentFile: file }));
    setError(null);
  };

  const handleAttachmentUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newAttachments = [...formData.attachments];

    files.forEach(file => {
      const validation = validateFileForContentType(file, 'DEFAULT');
      if (!validation.isValid) {
        setError(`Attachment ${file.name}: ${validation.message}`);
        return;
      }

      newAttachments.push({
        file,
        name: file.name,
        type: file.type,
        size: file.size
      });
    });

    setFormData(prev => ({ ...prev, attachments: newAttachments }));
    setError(null);
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Validation
  const validateStep = (step) => {
    switch (step) {
      case 'basic':
        if (!formData.title.trim()) {
          setError('Module title is required');
          return false;
        }
        if (!formData.description.trim()) {
          setError('Module description is required');
          return false;
        }
        if (!formData.category.trim()) {
          setError('Category is required');
          return false;
        }
        return true;
      
      case 'content':
        const contentType = formData.contentType;
        switch (contentType) {
          case 'TEXT':
            if (!formData.content || formData.content.trim() === '') {
              setError('Text content is required for TEXT content type');
              return false;
            }
            break;
          case 'VIDEO':
            const hasVideoUrl = formData.videoUrl?.trim();
            const hasVideoFile = formData.contentFile;
            if (!hasVideoUrl && !hasVideoFile) {
              setError('Video URL or video file upload is required for VIDEO content type');
              return false;
            }
            break;
          case 'AUDIO':
            const hasAudioUrl = formData.audioUrl?.trim();
            const hasAudioFile = formData.contentFile;
            if (!hasAudioUrl && !hasAudioFile) {
              setError('Audio URL or audio file upload is required for AUDIO content type');
              return false;
            }
            break;
          case 'DOCUMENT':
            const hasDocumentUrl = formData.documentUrl?.trim();
            const hasDocumentFile = formData.contentFile;
            if (!hasDocumentUrl && !hasDocumentFile) {
              setError('Document URL or document file upload is required for DOCUMENT content type');
              return false;
            }
            break;
          case 'EXTERNAL_LINK':
            if (!formData.externalLink?.trim()) {
              setError('External link URL is required for EXTERNAL_LINK content type');
              return false;
            }
            break;
        }
        return true;

      case 'quiz-questions':
        if (formData.questions.length === 0) {
          setError('At least one question is required for the quiz');
          return false;
        }
        for (let i = 0; i < formData.questions.length; i++) {
          const q = formData.questions[i];
          if (!q.text.trim()) {
            setError(`Question ${i + 1} text is required`);
            return false;
          }
          if (q.options.some(opt => !opt.trim())) {
            setError(`All options for question ${i + 1} must be filled`);
            return false;
          }
        }
        return true;
      
      default:
        return true;
    }
  };

  // Steps configuration
  const steps = [
    { id: 'basic', label: 'Basic Info', icon: 'FileText' },
    { id: 'content', label: 'Content', icon: 'PlayCircle' },
    { id: 'objectives', label: 'Objectives & Tags', icon: 'Target' },
    { id: 'attachments', label: 'Attachments', icon: 'Paperclip' },
    ...(formData.includeQuiz || formData.contentType === 'QUIZ' ? [{ id: 'quiz-questions', label: 'Quiz Questions', icon: 'List' }] : []),
    { id: 'settings', label: 'Settings', icon: 'Settings' }
  ];

  // Navigation
  const handleNext = () => {
    if (!validateStep(activeStep)) {
      return;
    }
    
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1].id);
      setError(null);
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1].id);
      setError(null);
    }
  };

  // Content type specific fields renderer
  const renderContentTypeSpecificFields = () => {
    const contentType = formData.contentType;
    
    switch (contentType) {
      case 'TEXT':
        return (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Text Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Enter your text content here..."
              rows={6}
              className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        );

      case 'VIDEO':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Video URL
              </label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/video.mp4"
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Video Duration (minutes)
              </label>
              <input
                type="number"
                name="videoDuration"
                value={formData.videoDuration}
                onChange={handleInputChange}
                placeholder="e.g., 30"
                min="1"
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Upload Video File
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleContentFileChange}
                accept="video/mp4,video/mov,video/avi,video/webm,video/quicktime"
                className="hidden"
              />
              <div className="flex gap-3 items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  iconName="Upload"
                >
                  {formData.contentFile ? 'Change Video File' : 'Choose Video File'}
                </Button>
                {formData.contentFile && (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <Icon name="CheckCircle" size={16} />
                    <span>Video file selected</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: MP4, MOV, AVI, WebM (Max: 500MB)
              </p>
            </div>
          </div>
        );

      case 'AUDIO':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Audio URL
              </label>
              <input
                type="url"
                name="audioUrl"
                value={formData.audioUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/audio.mp3"
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Audio Duration (minutes)
              </label>
              <input
                type="number"
                name="audioDuration"
                value={formData.audioDuration}
                onChange={handleInputChange}
                placeholder="e.g., 45"
                min="1"
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Upload Audio File
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleContentFileChange}
                accept="audio/mp3,audio/wav,audio/m4a,audio/ogg,audio/x-m4a"
                className="hidden"
              />
              <div className="flex gap-3 items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  iconName="Upload"
                >
                  {formData.contentFile ? 'Change Audio File' : 'Choose Audio File'}
                </Button>
                {formData.contentFile && (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <Icon name="CheckCircle" size={16} />
                    <span>Audio file selected</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: MP3, WAV, M4A, OGG (Max: 100MB)
              </p>
            </div>
          </div>
        );

      case 'DOCUMENT':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Document URL
              </label>
              <input
                type="url"
                name="documentUrl"
                value={formData.documentUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/document.pdf"
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Number of Pages
              </label>
              <input
                type="number"
                name="documentPages"
                value={formData.documentPages}
                onChange={handleInputChange}
                placeholder="e.g., 25"
                min="1"
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Upload Document File
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleContentFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
              />
              <div className="flex gap-3 items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  iconName="Upload"
                >
                  {formData.contentFile ? 'Change Document File' : 'Choose Document File'}
                </Button>
                {formData.contentFile && (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <Icon name="CheckCircle" size={16} />
                    <span>Document file selected</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: PDF, DOC, DOCX, PPT, TXT (Max: 50MB)
              </p>
            </div>
          </div>
        );

      case 'EXTERNAL_LINK':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                External URL *
              </label>
              <input
                type="url"
                name="externalLink"
                value={formData.externalLink}
                onChange={handleInputChange}
                placeholder="https://example.com/resource"
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Link Type
              </label>
              <select
                name="externalLinkType"
                value={formData.externalLinkType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select type</option>
                <option value="ARTICLE">Article</option>
                <option value="TUTORIAL">Tutorial</option>
                <option value="REFERENCE">Reference</option>
                <option value="TOOL">Tool</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        );

      case 'QUIZ':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground bg-primary/5 p-4 rounded-lg border border-primary/10">
              Module type is set to <strong>Quiz</strong>. You will be able to add questions and detailed instructions in the <strong>Quiz Questions</strong> step.
            </p>
          </div>
        );

      case 'ASSESSMENT':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Assessment Weight (%)
              </label>
              <input
                type="number"
                name="assessmentWeight"
                value={formData.assessmentWeight}
                onChange={handleInputChange}
                min="0"
                max="100"
                placeholder="e.g., 30"
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Assessment Description
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Describe the assessment criteria, format, and expectations..."
                rows={4}
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>
        );

      case 'INTERACTIVE':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Interactive Type
              </label>
              <select
                name="interactiveType"
                value={formData.interactiveType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select type</option>
                <option value="SIMULATION">Simulation</option>
                <option value="GAME">Game</option>
                <option value="EXERCISE">Exercise</option>
                <option value="DEMONSTRATION">Demonstration</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Upload Interactive File
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleContentFileChange}
                accept=".zip,.html,.xhtml,application/zip,application/x-zip-compressed,text/html"
                className="hidden"
              />
              <div className="flex gap-3 items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  iconName="Upload"
                >
                  {formData.contentFile ? 'Change Interactive File' : 'Choose Interactive File'}
                </Button>
                {formData.contentFile && (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <Icon name="CheckCircle" size={16} />
                    <span>Interactive file selected</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Supported: ZIP files containing HTML/JavaScript content (Max: 200MB)
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setUploadProgress({});

    try {
      Swal.fire({
        title: 'Creating Module...',
        html: `
          <div class="flex flex-col items-center justify-center space-y-4">
            <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />
            <p class="text-sm text-gray-600">Please wait while we create your module</p>
          </div>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      // Validation
      if (!validateStep('basic') || !validateStep('content')) {
        Swal.close();
        setLoading(false);
        return;
      }

      // Prepare module data
      const contentType = formData.contentType;
      const moduleData = {
        learningPathId: learningPathId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category?.trim(),
        estimatedMinutes: parseInt(formData.estimatedMinutes) || 60,
        contentType: contentType,
        difficulty: formData.difficulty,
        completionPoints: parseInt(formData.completionPoints) || 100,
        isActive: Boolean(formData.isActive),
        requiresCompletion: true,
        isOptional: false,
      };

      // Add optional fields if they exist
      if (formData.shortDescription?.trim()) {
        moduleData.shortDescription = formData.shortDescription.trim();
      }

      // Content based on type
      if (contentType === 'TEXT' && formData.content?.trim()) {
        moduleData.content = formData.content.trim();
      }
      if (contentType === 'VIDEO' && formData.videoUrl?.trim()) {
        moduleData.videoUrl = formData.videoUrl.trim();
      }
      if (contentType === 'AUDIO' && formData.audioUrl?.trim()) {
        moduleData.audioUrl = formData.audioUrl.trim();
      }
      if (contentType === 'DOCUMENT' && formData.documentUrl?.trim()) {
        moduleData.documentUrl = formData.documentUrl.trim();
      }
      if (contentType === 'EXTERNAL_LINK' && formData.externalLink?.trim()) {
        moduleData.externalLink = formData.externalLink.trim();
      }

      // Add arrays if they have values
      if (formData.learningObjectives.length > 0) {
        moduleData.learningObjectives = formData.learningObjectives;
      }
      if (formData.tags.length > 0) {
        moduleData.tags = formData.tags;
      }

      // Add content-type specific metadata
      if (formData.videoDuration) moduleData.videoDuration = parseInt(formData.videoDuration);
      if (formData.audioDuration) moduleData.audioDuration = parseInt(formData.audioDuration);
      if (formData.documentPages) moduleData.documentPages = parseInt(formData.documentPages);
      if (formData.interactiveType) moduleData.interactiveType = formData.interactiveType;
      if (formData.quizQuestions) moduleData.quizQuestions = parseInt(formData.quizQuestions);
      if (formData.assessmentWeight) moduleData.assessmentWeight = parseInt(formData.assessmentWeight);
      if (formData.externalLinkType) moduleData.externalLinkType = formData.externalLinkType;

      // Prepare files
      const files = {};
      let hasFiles = false;

      if (formData.thumbnailFile) {
        files.thumbnail = [formData.thumbnailFile];
        hasFiles = true;
      }

      if (formData.contentFile) {
        const fileFieldMapping = {
          'VIDEO': 'video',
          'AUDIO': 'audio',
          'DOCUMENT': 'document',
          'INTERACTIVE': 'document'
        };
        
        const fileFieldName = fileFieldMapping[contentType];
        if (fileFieldName) {
          files[fileFieldName] = [formData.contentFile];
          hasFiles = true;
        }
      }
      
      const attachmentFiles = formData.attachments
        .filter(att => att.file)
        .map(att => att.file);
      
      if (attachmentFiles.length > 0) {
        files.attachments = attachmentFiles;
        hasFiles = true;
      }

      // Submit to backend
      let response;
      
      if (hasFiles) {
        const formDataToSend = moduleService.createFormData(moduleData, files);
        
        response = await moduleService.createModuleWithFiles(formDataToSend, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress({ overall: percentCompleted });
          }
        });
      } else {
        response = await moduleService.createModule(moduleData);
      }

      // If it's a quiz, create the quiz questions
      if (response && response.data?.data && (contentType === 'QUIZ' || formData.includeQuiz) && formData.questions.length > 0) {
        console.log('📝 Creating quiz with data:', {
          moduleId: response.data.data.id,
          title: response.data.data.title,
          questionsCount: formData.questions.length
        });
        await quizService.createQuiz({
          moduleId: response.data.data.id,
          title: response.data.data.title,
          instructions: formData.quizInstructions,
          passingScore: 70, // Default or add to UI
          questions: formData.questions
        });
      }

      // Success handling
      if (response && response.data) {
        Swal.fire({
          title: 'Success!',
          text: 'Module created successfully!',
          icon: 'success',
          confirmButtonColor: '#32cd32',
          confirmButtonText: 'OK'
        });

        if (onModuleCreated) {
          onModuleCreated(response.data);
        }
        
        handleClose();
      }

    } catch (err) {
      console.error('❌ ERROR DETAILS:', err);
      
      let errorMessage = 'Failed to create module. Please try again.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          const validationErrors = errorData.errors;
          if (Array.isArray(validationErrors)) {
            errorMessage = validationErrors.join(', ');
          } else if (typeof validationErrors === 'object') {
            errorMessage = Object.values(validationErrors).flat().join(', ');
          }
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK'
      });

      setError(errorMessage);
      
    } finally {
      setLoading(false);
      setUploadProgress({});
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      estimatedMinutes: 60,
      contentType: 'TEXT',
      difficulty: 'BEGINNER',
      shortDescription: '',
      content: '',
      videoUrl: '',
      audioUrl: '',
      documentUrl: '',
      externalLink: '',
      videoDuration: '',
      audioDuration: '',
      documentPages: '',
      interactiveType: '',
      quizQuestions: 0,
      assessmentWeight: 0,
      externalLinkType: '',
      thumbnailFile: null,
      contentFile: null,
      learningObjectives: [],
      tags: [],
      attachments: [],
      completionPoints: 100,
      isActive: true,
      questions: []
    });
    setTempInputs({
      learningObjective: '',
      tag: ''
    });
    setError(null);
    setActiveStep('basic');
    onClose();
  };

  if (!isOpen) return null;

  const currentStepIndex = steps.findIndex(step => step.id === activeStep);
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Create New Module</h2>
            <p className="text-sm text-muted-foreground mt-1">Add a new module to the learning path</p>
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

        {/* Steps Navigation */}
        <div className="flex gap-1 px-6 pt-4 border-b border-border">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors
                ${activeStep === step.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }
              `}
            >
              <Icon name={step.icon} size={16} />
              <span className="text-sm font-medium">{step.label}</span>
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Basic Info Step */}
          {activeStep === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Module Title <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter module title"
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
                      placeholder="Detailed description of the module"
                      rows={3}
                      className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
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
                      placeholder="Brief description"
                      className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Category <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        disabled={isLoadingPath}
                        className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        <Icon name="ChevronDown" size={16} />
                      </div>
                    </div>
                    {isLoadingPath && <p className="text-[10px] text-primary mt-1 animate-pulse">Fetching default category...</p>}
                  </div>
                </div>

                <div className="space-y-4">
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

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Content Type <span className="text-error">*</span>
                    </label>
                    <select
                      name="contentType"
                      value={formData.contentType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="TEXT">Text</option>
                      <option value="VIDEO">Video</option>
                      <option value="AUDIO">Audio</option>
                      <option value="INTERACTIVE">Interactive</option>
                      <option value="DOCUMENT">Document</option>
                      <option value="QUIZ">Quiz</option>
                      <option value="ASSESSMENT">Assessment</option>
                      <option value="EXTERNAL_LINK">External Link</option>
                    </select>
                  </div>

                  <div className="pt-1">
                    <label className={cn(
                      "flex items-center gap-3 cursor-pointer group p-3 rounded-xl border border-border bg-muted/30 transition-all",
                      formData.includeQuiz || formData.contentType === 'QUIZ' ? "border-primary/30 bg-primary/5" : "hover:bg-muted",
                      formData.contentType === 'QUIZ' && "opacity-60 cursor-not-allowed"
                    )}>
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="includeQuiz"
                          className="sr-only peer"
                          checked={formData.includeQuiz || formData.contentType === 'QUIZ'}
                          onChange={handleInputChange}
                          disabled={formData.contentType === 'QUIZ'}
                        />
                        <div className="w-10 h-5 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary transition-colors"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          Include Quiz Assessment
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none mt-1">
                          {formData.contentType === 'QUIZ' ? 'Required for Quiz type' : 'Add evaluation after content'}
                        </span>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Difficulty Level <span className="text-error">*</span>
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

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Estimated Minutes <span className="text-error">*</span>
                    </label>
                    <input
                      type="number"
                      name="estimatedMinutes"
                      value={formData.estimatedMinutes}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Step */}
          {activeStep === 'content' && (
            <div className="space-y-6">
              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Thumbnail Image
                </label>
                <input
                  type="file"
                  ref={thumbnailInputRef}
                  onChange={handleThumbnailChange}
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                  className="hidden"
                />
                <div className="flex gap-3 items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => thumbnailInputRef.current?.click()}
                    iconName="Image"
                  >
                    {formData.thumbnailFile ? 'Change Thumbnail' : 'Choose Thumbnail'}
                  </Button>
                  {formData.thumbnailFile && (
                    <div className="flex items-center gap-2 text-sm text-success">
                      <Icon name="CheckCircle" size={16} />
                      <span>Thumbnail selected</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 16:9 ratio, JPEG, PNG, GIF, WebP (Max: 5MB)
                </p>
              </div>

              {/* Content Type Specific Fields */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-foreground">Content Configuration</h4>
                  {formData.includeQuiz && formData.contentType !== 'QUIZ' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                      <Icon name="List" size={14} className="text-primary" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        Quiz questions step enabled
                      </span>
                    </div>
                  )}
                </div>
                {renderContentTypeSpecificFields()}
              </div>
            </div>
          )}

          {/* Quiz Questions Step */}
          {activeStep === 'quiz-questions' && (
            <div className="space-y-6">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-4">
                <label className="block text-sm font-bold text-primary uppercase tracking-wider">
                  Quiz Instructions
                </label>
                <textarea
                  name="quizInstructions"
                  value={formData.quizInstructions}
                  onChange={handleInputChange}
                  placeholder="Provide instructions for the learners before they start the quiz..."
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
                />
              </div>

              <div className="flex items-center justify-between border-t border-border pt-6">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                  <Icon name="List" size={20} className="text-primary" />
                  Questions ({formData.questions.length})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Plus"
                  className="rounded-xl font-bold"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      questions: [
                        ...prev.questions,
                        {
                          text: '',
                          type: 'MULTIPLE_CHOICE',
                          options: ['', '', '', ''],
                          correctAnswer: 0,
                          points: 10
                        }
                      ]
                    }));
                  }}
                >
                  Add Question
                </Button>
              </div>

              {formData.questions.length === 0 ? (
                <div className="text-center py-10 bg-muted/30 rounded-lg border border-dashed border-border">
                  <Icon name="List" size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No questions added yet. Click "Add Question" to begin.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.questions.map((q, qIndex) => (
                    <div key={qIndex} className="p-4 bg-muted/30 rounded-lg border border-border relative">
                      <button
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            questions: prev.questions.filter((_, i) => i !== qIndex)
                          }));
                        }}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-error"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                            Question {qIndex + 1}
                          </label>
                          <input
                            type="text"
                            value={q.text}
                            onChange={(e) => {
                              const newQuestions = [...formData.questions];
                              newQuestions[qIndex].text = e.target.value;
                              setFormData(prev => ({ ...prev, questions: newQuestions }));
                            }}
                            placeholder="Enter question text"
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-3">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={q.correctAnswer === oIndex}
                                onChange={() => {
                                  const newQuestions = [...formData.questions];
                                  newQuestions[qIndex].correctAnswer = oIndex;
                                  setFormData(prev => ({ ...prev, questions: newQuestions }));
                                }}
                                className="w-4 h-4 text-primary focus:ring-primary"
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const newQuestions = [...formData.questions];
                                  newQuestions[qIndex].options[oIndex] = e.target.value;
                                  setFormData(prev => ({ ...prev, questions: newQuestions }));
                                }}
                                placeholder={`Option ${oIndex + 1}`}
                                className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Objectives & Tags Step */}
          {activeStep === 'objectives' && (
            <div className="space-y-6">
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
            </div>
          )}

          {/* Attachments Step */}
          {activeStep === 'attachments' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Additional Attachments
                </label>
                <input
                  type="file"
                  ref={attachmentsInputRef}
                  multiple
                  onChange={handleAttachmentUpload}
                  className="hidden"
                />
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    iconName="Paperclip"
                    onClick={() => attachmentsInputRef.current?.click()}
                  >
                    Add Attachments
                  </Button>
                  
                  {formData.attachments.length > 0 && (
                    <div className="space-y-2">
                      {formData.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                          <div className="flex items-center gap-3">
                            <Icon 
                              name={attachment.type.startsWith('image/') ? 'Image' : 
                                    attachment.type.startsWith('video/') ? 'Video' : 
                                    attachment.type.startsWith('audio/') ? 'Music' : 
                                    attachment.type.includes('pdf') ? 'FileText' : 
                                    attachment.type.includes('zip') ? 'Archive' : 'File'} 
                              size={16} 
                              className="text-muted-foreground" 
                            />
                            <div>
                              <p className="text-sm font-medium text-foreground">{attachment.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            iconName="X"
                            onClick={() => removeAttachment(index)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings Step */}
          {activeStep === 'settings' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Completion Points
                </label>
                <input
                  type="number"
                  name="completionPoints"
                  value={formData.completionPoints}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Points awarded upon module completion
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="font-medium text-foreground">Module is Active</div>
                  <p className="text-sm text-muted-foreground">Make this module available to users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted-foreground/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            {activeStep !== 'basic' && (
              <Button
                variant="outline"
                iconName="ChevronLeft"
                onClick={handlePrevious}
                disabled={loading}
              >
                Previous
              </Button>
            )}
            {!isLastStep ? (
              <Button
                variant="default"
                iconName="ChevronRight"
                iconPosition="right"
                onClick={handleNext}
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
                {loading ? 'Creating...' : 'Create Module'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateModuleModal;