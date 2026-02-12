const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Normalizes URLs that might have been saved with localhost:3000 in development
 * to use the current API_BASE_URL.
 */
export const normalizeUrl = (url) => {
  if (!url) return url;
  
  // If the site is online but using a localhost URL from the database
  if (url.includes('localhost:3000') || url.includes('127.0.0.1:3000')) {
    return url.replace(/http:\/\/(localhost|127\.0\.0\.1):3000/, API_BASE_URL);
  }
  
  return url;
};

/**
 * Helper to normalize all media URLs in a module object
 */
export const normalizeModuleUrls = (module) => {
  if (!module) return module;
  
  return {
    ...module,
    videoUrl: normalizeUrl(module.videoUrl),
    audioUrl: normalizeUrl(module.audioUrl),
    documentUrl: normalizeUrl(module.documentUrl),
    thumbnailUrl: normalizeUrl(module.thumbnailUrl),
  };
};
/**
 * Helper to normalize all media URLs in a learning path object
 */
export const normalizeLearningPathUrls = (path) => {
  if (!path) return path;
  
  return {
    ...path,
    thumbnailUrl: normalizeUrl(path.thumbnailUrl),
    modules: path.modules ? path.modules.map(normalizeModuleUrls) : path.modules
  };
};
