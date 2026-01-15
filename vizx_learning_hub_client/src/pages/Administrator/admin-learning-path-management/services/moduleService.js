// src/services/moduleService.js
import axiosClient from '../../../../utils/axiosClient';

class ModuleService {
  // ==================== MODULE RETRIEVAL ====================

  getAllModules(queryParams = {}) {
    return axiosClient.get('/modules', { params: queryParams });
  }

  getModuleById(id) {
    return axiosClient.get(`/modules/${id}`);
  }

  getModulesByLearningPath(learningPathId) {
    return axiosClient.get(`/modules/learning-path/${learningPathId}`);
  }

  getModulesByContentType(contentType) {
    return axiosClient.get(`/modules/content-type/${contentType}`);
  }

  getModuleCountByLearningPath(learningPathId) {
    return axiosClient.get(`/modules/learning-path/${learningPathId}/count`);
  }

  validateModule(id) {
    return axiosClient.get(`/modules/${id}/validate`);
  }

  // ==================== MODULE CRUD (NO FILES) ====================

  /**
   * Create module without files (JSON)
   */
  createModule(moduleData) {
    return axiosClient.post('/modules', moduleData, {
      timeout: 30000,
    });
  }

  /**
   * Update module without files (JSON)
   */
  updateModule(id, moduleData) {
    return axiosClient.put(`/modules/${id}`, moduleData, {
      timeout: 30000,
    });
  }

  // ==================== MODULE CRUD WITH FILES ====================

  /**
   * Create module with file uploads
   */
  createModuleWithFiles(formData, config = {}) {
    return axiosClient.post('/modules/with-files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: config.onUploadProgress,
      timeout: 300000, // 5 minutes for file uploads
    });
  }

  /**
   * Update module with file uploads
   */
  updateModuleWithFiles(id, formData, config = {}) {
    return axiosClient.put(`/modules/${id}/with-files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: config.onUploadProgress,
      timeout: 300000,
    });
  }


  updateModuleOrder(id, orderData) {
    return axiosClient.patch(`/modules/${id}/order`, orderData);
  }

  activateModule(id) {
    return axiosClient.patch(`/modules/${id}/activate`);
  }

  deactivateModule(id) {
    return axiosClient.patch(`/modules/${id}/deactivate`);
  }

  deleteModule(id) {
    return axiosClient.delete(`/modules/${id}`);
  }

  // ==================== FILE UPLOAD UTILITIES ====================

  uploadFiles(formData, config = {}) {
    return axiosClient.post('/modules/upload/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: config.onUploadProgress,
      timeout: 300000,
    });
  }

  uploadThumbnail(formData, config = {}) {
    return axiosClient.post('/modules/upload/thumbnail', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: config.onUploadProgress,
      timeout: 60000,
    });
  }

  updateModuleThumbnail(id, formData, config = {}) {
    return axiosClient.patch(`/modules/${id}/thumbnail`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: config.onUploadProgress,
      timeout: 60000,
    });
  }

  deleteFile(publicId, resourceType = 'image') {
    return axiosClient.delete(`/modules/upload/files/${publicId}`, {
      data: { resourceType }
    });
  }

  // ==================== BULK OPERATIONS ====================

  bulkUpdateModuleOrder(updates) {
    return axiosClient.patch('/modules/bulk/order', { updates });
  }

  // ==================== HEALTH CHECK ====================

  healthCheck() {
    return axiosClient.get('/modules/health/check');
  }

  // ==================== FORM DATA UTILITIES ====================

  /**
   * Convert module data to FormData for file uploads
   */
createFormData(moduleData, files = {}) {
  const formData = new FormData();

  console.log('🔄 Creating FormData from:', { moduleData, files });

  // List of required fields that must be present (even if empty)
  const requiredFields = [
    'learningPathId', 'title', 'description', 'category', 
    'estimatedMinutes', 'contentType', 'difficulty'
  ];

  // Add all module data as individual fields
  Object.keys(moduleData).forEach(key => {
    let value = moduleData[key];
    
    // Skip undefined values but allow null, empty strings, false, 0, etc.
    if (value === undefined) {
      console.log(`⚠️  Skipping undefined field: ${key}`);
      return;
    }

    // Convert null to empty string for required fields
    if (value === null && requiredFields.includes(key)) {
      value = '';
    }

    if (Array.isArray(value)) {
      // Handle arrays - stringify them, use empty array if empty
      const arrayValue = value.length > 0 ? JSON.stringify(value) : '[]';
      formData.append(key, arrayValue);
      console.log(`  📦 Added array ${key}:`, value.length > 0 ? `${value.length} items` : 'empty array');
    } else if (typeof value === 'object' && value !== null) {
      // Handle objects - stringify them
      formData.append(key, JSON.stringify(value));
      console.log(`  📦 Added object ${key}:`, Object.keys(value).length > 0 ? `${Object.keys(value).length} properties` : 'empty object');
    } else if (typeof value === 'boolean') {
      // Handle booleans - convert to string
      formData.append(key, value.toString());
      console.log(`  📦 Added boolean ${key}:`, value);
    } else if (value === null) {
      // Handle null - send as empty string for form-data compatibility
      formData.append(key, '');
      console.log(`  📦 Added null ${key}: (converted to empty string)`);
    } else {
      // Handle strings, numbers, and other primitives
      formData.append(key, value.toString());
      console.log(`  📦 Added primitive ${key}:`, value);
    }
  });

  // Ensure all required fields are present (even if empty)
  requiredFields.forEach(field => {
    if (!formData.has(field)) {
      formData.append(field, '');
      console.log(`⚠️  Added missing required field: ${field} (empty string)`);
    }
  });

  // Add files with the exact field names your backend expects
  if (files.thumbnail && files.thumbnail[0]) {
    formData.append('thumbnail', files.thumbnail[0]);
    console.log(`  📷 Added thumbnail:`, files.thumbnail[0].name);
  }

  if (files.video && files.video[0]) {
    formData.append('video', files.video[0]);
    console.log(`  🎥 Added video:`, files.video[0].name);
  }

  if (files.audio && files.audio[0]) {
    formData.append('audio', files.audio[0]);
    console.log(`  🎵 Added audio:`, files.audio[0].name);
  }

  if (files.document && files.document[0]) {
    formData.append('document', files.document[0]);
    console.log(`  📄 Added document:`, files.document[0].name);
  }

  // Add multiple attachments
  if (files.attachments && files.attachments.length > 0) {
    files.attachments.forEach((file, index) => {
      formData.append('attachments', file);
      console.log(`  📎 Added attachment ${index + 1}:`, file.name);
    });
  }

  // Log final FormData for debugging
  console.log('📦 Final FormData entries:');
  let hasFiles = false;
  for (let pair of formData.entries()) {
    if (pair[1] instanceof File) {
      console.log(`  ${pair[0]}: File - ${pair[1].name} (${pair[1].type}, ${pair[1].size} bytes)`);
      hasFiles = true;
    } else {
      console.log(`  ${pair[0]}:`, typeof pair[1] === 'string' && pair[1].length > 100 ? 
        pair[1].substring(0, 100) + '...' : pair[1]);
    }
  }

  if (!hasFiles) {
    console.log('  📝 No files in FormData - only data fields');
  }

  return formData;
}
  /**
   * Determine if we need to use file upload endpoint
   */
  requiresFileUpload(files = {}) {
    const hasFiles = Object.keys(files).some(key => 
      files[key] && files[key].length > 0
    );
    console.log('🔍 File upload required?', hasFiles, files);
    return hasFiles;
  }
}

// Create and export a single instance
const moduleService = new ModuleService();

export default moduleService;