import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ModuleViewModal = ({ isOpen, onClose, module, moduleContent, isLoading }) => {
  const [fullScreenPreview, setFullScreenPreview] = useState(false);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const videoRef = useRef(null);
  const [videoThumbnails, setVideoThumbnails] = useState({});
  const [videoMetadata, setVideoMetadata] = useState({});
  
  if (!isOpen) return null;

  const getFileExtension = (url) => {
    if (!url) return '';
    return url.split('.').pop().toLowerCase();
  };

  const getFileIcon = (url) => {
    const ext = getFileExtension(url);
    const iconMap = {
      pdf: 'FileText',
      doc: 'FileText',
      docx: 'FileText',
      ppt: 'Presentation',
      pptx: 'Presentation',
      xls: 'Table',
      xlsx: 'Table',
      txt: 'File',
      zip: 'Archive',
      rar: 'Archive',
      '7z': 'Archive',
      mp4: 'Video',
      mov: 'Video',
      avi: 'Video',
      mkv: 'Video',
      webm: 'Video',
      mp3: 'Headphones',
      wav: 'Headphones',
      ogg: 'Headphones',
      m4a: 'Headphones',
      jpg: 'Image',
      jpeg: 'Image',
      png: 'Image',
      gif: 'Image',
      webp: 'Image',
      svg: 'Image',
      bmp: 'Image'
    };
    return iconMap[ext] || 'File';
  };

  const getFileType = (url) => {
    const ext = getFileExtension(url);
    const typeMap = {
      pdf: 'PDF Document',
      doc: 'Word Document',
      docx: 'Word Document',
      ppt: 'PowerPoint Presentation',
      pptx: 'PowerPoint Presentation',
      xls: 'Excel Spreadsheet',
      xlsx: 'Excel Spreadsheet',
      txt: 'Text File',
      zip: 'ZIP Archive',
      rar: 'RAR Archive',
      '7z': '7-Zip Archive',
      mp4: 'Video File',
      mov: 'Video File',
      avi: 'Video File',
      mkv: 'Video File',
      webm: 'WebM Video',
      mp3: 'Audio File',
      wav: 'Audio File',
      ogg: 'Audio File',
      m4a: 'Audio File',
      jpg: 'Image',
      jpeg: 'Image',
      png: 'Image',
      gif: 'Image',
      webp: 'Image',
      svg: 'SVG Image',
      bmp: 'Bitmap Image'
    };
    return typeMap[ext] || 'File';
  };

  const openFullScreenPreview = (url, type) => {
    setCurrentPreviewUrl(url);
    setPreviewType(type);
    setFullScreenPreview(true);
  };

  const closeFullScreenPreview = () => {
    setFullScreenPreview(false);
    setCurrentPreviewUrl(null);
    setPreviewType(null);
  };

  // Function to handle file download
  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `document.${getFileExtension(url)}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
L
  const getFilenameFromUrl = (url) => {
    if (!url) return 'document';
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.split('/').pop() || 'document';
    } catch {
      return url.split('/').pop() || 'document';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const generateVideoThumbnail = async (url) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {

        video.currentTime = video.duration * 0.1;
      };
      
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnail = canvas.toDataURL('image/jpeg');
     
        setVideoMetadata(prev => ({
          ...prev,
          [url]: {
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight
          }
        }));
        
        resolve(thumbnail);
      };
      
      video.onerror = () => {
        console.warn('Could not generate thumbnail for:', url);
        resolve(null);
      };
      
      video.src = url;
    });
  };


  const VideoCard = ({ url, title, onPreview, thumbnailUrl }) => {
    const filename = getFilenameFromUrl(url);
    const [thumbnail, setThumbnail] = useState(thumbnailUrl || videoThumbnails[url]);
    const [isLoading, setIsLoading] = useState(!thumbnail);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
      const loadThumbnail = async () => {
      
        if (thumbnailUrl) {
          setThumbnail(thumbnailUrl);
          setIsLoading(false);
          return;
        }
  
        if (!thumbnail && !videoThumbnails[url]) {
          setIsLoading(true);
          try {
            const thumb = await generateVideoThumbnail(url);
            setThumbnail(thumb);
            setVideoThumbnails(prev => ({ ...prev, [url]: thumb }));
          } catch (error) {
            console.error('Error generating thumbnail:', error);
          } finally {
            setIsLoading(false);
          }
        }
      };

      loadThumbnail();
    }, [url, thumbnail, thumbnailUrl, videoThumbnails]);

    const metadata = videoMetadata[url];
    const duration = metadata?.duration;

    return (
      <div 
        className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon name="Video" size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">{filename}</h4>
                <p className="text-sm text-muted-foreground">Video Content</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                iconName="Play"
                onClick={() => onPreview(url, 'video')}
                className="text-primary hover:text-primary/80"
              >
                Play Video
              </Button>
              <Button
                variant="ghost"
                size="icon"
                iconName="Download"
                onClick={() => handleDownload(url, filename)}
                className="text-muted-foreground hover:text-foreground"
              />
            </div>
          </div>
        </div>
        
        {/* Video Preview Thumbnail */}
        <div className="relative">
          <div 
            className="relative aspect-video bg-gradient-to-br from-gray-900/20 to-gray-900/10 cursor-pointer overflow-hidden"
            onClick={() => onPreview(url, 'video')}
          >
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : thumbnail ? (
              <>
                <img
                  src={thumbnail}
                  alt={`${filename} thumbnail`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Icon name="Video" size={32} className="text-primary/60" />
                </div>
                <p className="text-foreground/60 text-sm font-medium text-center">Video preview loading...</p>
              </div>
            )}
            
            {/* Play button overlay */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Icon name="Play" size={24} className="text-primary ml-1" />
                </div>
              </div>
            </div>
            
            {/* Duration badge */}
            {duration && (
              <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs font-medium rounded">
                {formatDuration(duration)}
              </div>
            )}
            
            {/* Video badge */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-primary/90 text-white text-xs font-medium rounded">
              Video
            </div>
          </div>
          
          {/* Mini video controls */}
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                iconName="Play"
                onClick={() => onPreview(url, 'video')}
                className="text-white hover:bg-white/20"
              >
                Play Video
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconName="Download"
                onClick={() => handleDownload(url, filename)}
                className="text-white hover:bg-white/20"
              >
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconName="Maximize2"
                onClick={() => onPreview(url, 'video')}
                className="text-white hover:bg-white/20"
              >
                Full Screen
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Regular file info card for non-video files
  const FileInfoCard = ({ url, title, showPreview = true }) => {
    const filename = getFilenameFromUrl(url);
    const fileType = getFileType(url);
    const fileIcon = getFileIcon(url);
    const fileExtension = getFileExtension(url);

    const canPreview = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(fileExtension);
    const previewType = ['pdf'].includes(fileExtension) ? 'pdf' :
                       ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(fileExtension) ? 'image' : null;

    return (
      <div className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name={fileIcon} size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">{filename}</h4>
              <p className="text-sm text-muted-foreground">{fileType}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showPreview && canPreview && (
              <Button
                variant="ghost"
                size="sm"
                iconName="Eye"
                onClick={() => openFullScreenPreview(url, previewType)}
                className="text-muted-foreground hover:text-foreground"
              >
                Preview
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              iconName="Download"
              onClick={() => handleDownload(url, filename)}
              className="text-muted-foreground hover:text-foreground"
            >
              Download
            </Button>
            <Button
              variant="ghost"
              size="icon"
              iconName="ExternalLink"
              onClick={() => window.open(url, '_blank')}
              className="text-muted-foreground hover:text-foreground"
            />
          </div>
        </div>
      </div>
    );
  };

  // Audio player component
  const AudioPlayer = ({ url, title }) => {
    const filename = getFilenameFromUrl(url);
    
    return (
      <div className="p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon name="Headphones" size={24} className="text-primary" />
          </div>
          <div className="flex-1">
            <div className="mb-3">
              <h4 className="font-medium text-foreground mb-1">{filename}</h4>
              <p className="text-sm text-muted-foreground">Audio File</p>
            </div>
            <audio controls className="w-full">
              <source src={url} type={`audio/${getFileExtension(url)}`} />
              Your browser does not support the audio element.
            </audio>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              iconName="Download"
              onClick={() => handleDownload(url, filename)}
              className="text-muted-foreground hover:text-foreground"
            />
            <Button
              variant="ghost"
              size="icon"
              iconName="ExternalLink"
              onClick={() => window.open(url, '_blank')}
              className="text-muted-foreground hover:text-foreground"
            />
          </div>
        </div>
      </div>
    );
  };

  // Full screen preview modal
  const FullScreenPreview = () => (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col">
      <div className="p-4 bg-black/90 border-b border-white/10 flex justify-between items-center">
        <div className="text-white font-medium">
          {previewType === 'pdf' ? 'PDF Preview' : 
           previewType === 'video' ? 'Video Preview' : 
           previewType === 'image' ? 'Image Preview' : 'Preview'}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="Download"
            onClick={() => handleDownload(currentPreviewUrl, getFilenameFromUrl(currentPreviewUrl))}
            className="text-white hover:bg-white/20"
          >
            Download
          </Button>
          <Button
            variant="ghost"
            size="icon"
            iconName="X"
            onClick={closeFullScreenPreview}
            className="text-white hover:bg-white/20"
          />
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        {previewType === 'pdf' && (
          <iframe
            src={`${currentPreviewUrl}#view=fitH&toolbar=0`}
            className="w-full h-full"
            title="Full Screen PDF Preview"
            frameBorder="0"
          />
        )}
        
        {previewType === 'video' && (
          <video
            src={currentPreviewUrl}
            controls
            autoPlay
            className="max-w-full max-h-full"
          >
            Your browser does not support the video tag.
          </video>
        )}
        
        {previewType === 'image' && (
          <img
            src={currentPreviewUrl}
            alt="Full screen preview"
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <Icon name="FileText" size={24} className="absolute inset-0 m-auto text-primary" />
          </div>
          <p className="mt-4 text-foreground font-medium">Loading module content...</p>
          <p className="text-sm text-muted-foreground mt-1">Please wait a moment</p>
        </div>
      );
    }

    if (!moduleContent) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="p-4 bg-warning/10 rounded-full mb-4">
            <Icon name="AlertTriangle" size={32} className="text-warning" />
          </div>
          <p className="text-foreground font-medium">No content available</p>
          <p className="text-sm text-muted-foreground mt-1">This module doesn't have any content yet</p>
        </div>
      );
    }

    const {
      title,
      description,
      contentType,
      videoUrl,
      audioUrl,
      documentUrl,
      thumbnailUrl,
      content,
      externalLink,
      microsoftLearnUrl,
      customContent,
      learningObjectives = [],
      tags = [],
      estimatedMinutes,
      difficulty,
      category,
      attachments = []
    } = moduleContent;

    // Determine the main content based on content type
    const mainContent = {
      VIDEO: videoUrl,
      AUDIO: audioUrl,
      DOCUMENT: documentUrl,
      EXTERNAL: externalLink,
      CONTENT: content,
      CUSTOM: customContent
    };

    const mainContentUrl = mainContent[contentType];

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {category && (
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {category}
                </span>
              )}
              {difficulty && (
                <span className="px-3 py-1 bg-warning/10 text-warning text-sm font-medium rounded-full">
                  {difficulty}
                </span>
              )}
              {estimatedMinutes && (
                <span className="px-3 py-1 bg-muted text-muted-foreground text-sm font-medium rounded-full">
                  {estimatedMinutes} min
                </span>
              )}
              {contentType && (
                <span className="px-3 py-1 bg-info/10 text-info text-sm font-medium rounded-full">
                  {contentType.toLowerCase()}
                </span>
              )}
            </div>
            {description && (
              <p className="text-foreground/80 leading-relaxed">{description}</p>
            )}
          </div>
        </div>

        {/* Learning Objectives */}
        {learningObjectives.length > 0 && (
          <div className="bg-muted/30 rounded-xl p-5 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon name="Target" className="text-primary" />
              Learning Objectives
            </h3>
            <ul className="space-y-3">
              {learningObjectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Icon name="CheckCircle" size={16} className="text-success mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/80">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Content Display */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Content</h3>
            {mainContentUrl && (
              <div className="flex gap-2">
                {contentType !== 'EXTERNAL' && contentType !== 'CUSTOM' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Download"
                    onClick={() => handleDownload(mainContentUrl, getFilenameFromUrl(mainContentUrl))}
                  >
                    Download
                  </Button>
                )}
                {contentType === 'EXTERNAL' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="ExternalLink"
                    onClick={() => window.open(mainContentUrl, '_blank')}
                  >
                    Open Link
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Main Content based on content type */}
          {contentType === 'VIDEO' && videoUrl && (
            <VideoCard 
              url={videoUrl} 
              title={title} 
              onPreview={openFullScreenPreview} 
              thumbnailUrl={thumbnailUrl}
            />
          )}

          {contentType === 'AUDIO' && audioUrl && (
            <AudioPlayer url={audioUrl} title={title} />
          )}

          {contentType === 'DOCUMENT' && documentUrl && (
            <FileInfoCard url={documentUrl} title={title} showPreview={true} />
          )}

          {contentType === 'EXTERNAL' && externalLink && (
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-info/10 rounded-lg">
                  <Icon name="ExternalLink" size={20} className="text-info" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">External Resource</h4>
                  <p className="text-sm text-muted-foreground break-all">{externalLink}</p>
                </div>
                <Button
                  variant="default"
                  iconName="ExternalLink"
                  onClick={() => window.open(externalLink, '_blank')}
                >
                  Visit Link
                </Button>
              </div>
            </div>
          )}

          {contentType === 'CONTENT' && content && (
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="mb-4 flex items-center gap-2">
                <Icon name="FileText" className="text-primary" />
                <h4 className="font-medium text-foreground">Module Content</h4>
              </div>
              <div className="prose prose-sm max-w-none text-foreground/80">
                {content}
              </div>
            </div>
          )}

          {contentType === 'CUSTOM' && customContent && (
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="mb-4 flex items-center gap-2">
                <Icon name="FileText" className="text-primary" />
                <h4 className="font-medium text-foreground">Custom Content</h4>
              </div>
              <div className="prose prose-sm max-w-none text-foreground/80">
                {customContent}
              </div>
            </div>
          )}

          {/* Multiple Attachments */}
          {attachments.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Additional Attachments</h4>
              <div className="space-y-3">
                {attachments.map((attachment, index) => {
                  const attachmentUrl = typeof attachment === 'object' ? attachment.url : attachment;
                  const attachmentExt = getFileExtension(attachmentUrl);
                  
                  return (
                    <div key={index}>
                      {['mp3', 'wav', 'ogg', 'm4a'].includes(attachmentExt) ? (
                        <AudioPlayer url={attachmentUrl} title={getFilenameFromUrl(attachmentUrl)} />
                      ) : ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(attachmentExt) ? (
                        <VideoCard 
                          url={attachmentUrl} 
                          title={getFilenameFromUrl(attachmentUrl)} 
                          onPreview={openFullScreenPreview} 
                        />
                      ) : (
                        <FileInfoCard url={attachmentUrl} title={getFilenameFromUrl(attachmentUrl)} showPreview={true} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Content Available */}
          {!mainContentUrl && !microsoftLearnUrl && attachments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
              <Icon name="FolderOpen" size={48} className="text-muted-foreground mb-3" />
              <p className="text-foreground font-medium">No content available</p>
              <p className="text-sm text-muted-foreground mt-1">This module doesn't contain any files or content</p>
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="bg-muted/30 rounded-xl p-5 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon name="Tag" className="text-primary" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-background text-foreground text-sm font-medium rounded-lg border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Full Screen Preview Modal */}
      {fullScreenPreview && <FullScreenPreview />}
      
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon name="FileText" size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {isLoading ? 'Loading Module...' : (module?.title || 'Module View')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? 'Please wait while we load the content' : 'View and manage module content'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                iconName="X"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {moduleContent && (
                  <span>Module ID: {moduleContent.id || 'N/A'}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                {(moduleContent?.videoUrl || moduleContent?.documentUrl || moduleContent?.audioUrl) && (
                  <Button 
                    variant="default" 
                    onClick={() => {
                      const url = moduleContent.videoUrl || moduleContent.documentUrl || moduleContent.audioUrl;
                      handleDownload(url, getFilenameFromUrl(url));
                    }}
                    iconName="Download"
                  >
                    Download Content
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModuleViewModal;