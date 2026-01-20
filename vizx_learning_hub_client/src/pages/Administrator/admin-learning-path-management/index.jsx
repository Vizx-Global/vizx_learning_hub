import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationSidebar from '../../../components/ui/NavigationSidebar';
import PathCategorySidebar from './components/PathCategorySidebar';
import PathStructurePanel from './components/PathStructurePanel';
import ModuleConfigPanel from './components/ModuleConfigPanel';
import BulkOperationsToolbar from './components/BulkOperationsToolbar';
import IntegrationStatusPanel from './components/IntegrationStatusPanel';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useLearningPaths } from './hooks/uselearningPath';
import { useModules } from './hooks/useModules';
import learningPathService from './services/learningPathService';
import moduleService from './services/moduleService';
import CreateLearningPath from './components/CreateLearningPath';

const LearningPathManagement = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ai-fundamentals');
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedPaths, setSelectedPaths] = useState([]);
  const [activeView, setActiveView] = useState('structure');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Use custom hooks
  const { 
    learningPaths, 
    loading, 
    error,
    fetchLearningPaths,
    createLearningPath,
    updateLearningPath,
    deleteLearningPath 
  } = useLearningPaths();

  const { 
    modules, 
    createModule, 
    updateModule, 
    deleteModule,
    updateModuleOrder 
  } = useModules(selectedPath?.id);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'review', label: 'In Review' },
    { value: 'archived', label: 'Archived' }
  ];

  useEffect(() => {
    if (learningPaths?.length > 0 && !selectedPath) {
      setSelectedPath(learningPaths[0]);
    }
  }, [learningPaths, selectedPath]);

  const handlePathSelect = (path) => {
    setSelectedPath(path);
    setSelectedModule(null);
  };

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
  };

  const handleModuleReorder = async (draggedModule, targetModule) => {
    try {
      await updateModuleOrder(draggedModule.id, {
        orderIndex: targetModule.orderIndex,
        learningPathId: selectedPath.id
      });
    } catch (error) {
      console.error('Failed to reorder module:', error);
    }
  };

  const handleAddModule = async () => {
    if (!selectedPath) return;
    
    const newModuleData = {
      title: 'New Module',
      description: 'Module description',
      learningPathId: selectedPath.id,
      contentType: 'TEXT',
      orderIndex: modules.length + 1,
      isActive: true
    };

    try {
      await createModule(newModuleData);
    } catch (error) {
      console.error('Failed to create module:', error);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      await deleteModule(moduleId);
    } catch (error) {
      console.error('Failed to delete module:', error);
    }
  };

  const handleModuleSave = async (moduleData) => {
    try {
      if (selectedModule?.id) {
        // Update existing module
        await updateModule(selectedModule.id, moduleData);
      } else {
        // Create new module
        await createModule({
          ...moduleData,
          learningPathId: selectedPath.id
        });
      }
      setSelectedModule(null);
    } catch (error) {
      console.error('Failed to save module:', error);
    }
  };

  const handleModuleCancel = () => {
    setSelectedModule(null);
  };

  const handleBulkAction = async (action, paths) => {
    const pathIds = paths.map(p => p.id);
    
    try {
      switch (action) {
        case 'publish':
          await learningPathService.bulkPublish(pathIds);
          break;
        case 'archive':
          await learningPathService.bulkArchive(pathIds);
          break;
        case 'delete':
          await learningPathService.bulkDelete(pathIds);
          break;
        case 'duplicate':
          // Implement duplication logic
          console.log('Duplicating paths:', pathIds);
          break;
        default:
          console.log('Action not implemented:', action);
      }
      
      // Refresh data
      // You might want to add refetch methods to your hooks
      setSelectedPaths([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const handleSelectAll = () => {
    setSelectedPaths(learningPaths);
  };

  const handleClearSelection = () => {
    setSelectedPaths([]);
  };

  // File upload handler for modules with files
  const handleModuleWithFiles = async (moduleData, files) => {
    const formData = new FormData();
    
    // Append files
    if (files.thumbnail) {
      formData.append('thumbnail', files.thumbnail);
    }
    if (files.attachments) {
      files.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }
    
    // Append module data as JSON
    formData.append('moduleData', JSON.stringify(moduleData));
    
    try {
      if (selectedModule?.id) {
        await moduleService.updateModuleWithFiles(selectedModule.id, formData);
      } else {
        await moduleService.createModuleWithFiles(formData);
      }
    } catch (error) {
      console.error('Failed to save module with files:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Sidebar */}
      <NavigationSidebar userRole="admin" />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-72'}`}>
        <div className="flex h-screen">
          {/* Path Category Sidebar */}
          <PathCategorySidebar
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            selectedPath={selectedPath}
            onPathSelect={handlePathSelect}
            onCreatePath={() => setShowCreateModal(true)}
            learningPaths={learningPaths}
          />

          {/* Main Workspace */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-card border-b border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Learning Path Management</h1>
                  <p className="text-muted-foreground">Create and manage AI education curricula</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={activeView === 'structure' ? 'default' : 'outline'}
                      size="sm"
                      iconName="Layers"
                      iconPosition="left"
                      onClick={() => setActiveView('structure')}
                    >
                      Structure
                    </Button>
                    <Button
                      variant={activeView === 'integration' ? 'default' : 'outline'}
                      size="sm"
                      iconName="RefreshCw"
                      iconPosition="left"
                      onClick={() => setActiveView('integration')}
                    >
                      Integration
                    </Button>
                  </div>
                  <Button
                    variant="default"
                    iconName="Plus"
                    iconPosition="left"
                    onClick={() => setShowCreateModal(true)}
                  >
                    New Learning Path
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-md">
                  <Input
                    type="search"
                    placeholder="Search learning paths..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  options={statusOptions}
                  value={filterStatus}
                  onChange={setFilterStatus}
                  placeholder="Filter by status"
                  className="min-w-40"
                />
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Filter"
                  iconPosition="left"
                >
                  More Filters
                </Button>
              </div>
            </div>

            {/* Bulk Operations Toolbar */}
            <div className="p-6 pb-0">
              <BulkOperationsToolbar
                selectedPaths={selectedPaths}
                onBulkAction={handleBulkAction}
                onSelectAll={handleSelectAll}
                onClearSelection={handleClearSelection}
                totalPaths={learningPaths?.length}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="mx-6 mt-4 p-4 bg-error/10 border border-error/20 rounded-lg">
                <div className="flex items-center gap-2 text-error">
                  <Icon name="AlertTriangle" size={16} />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Icon name="Loader" size={32} className="animate-spin text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            {!loading && (
              <div className="flex-1 p-6 overflow-hidden">
                {activeView === 'structure' ? (
                  <div className="flex gap-6 h-full">
                    {/* Path Structure Panel (40%) */}
                    <div className="w-2/5">
                      <PathStructurePanel
                        selectedPath={selectedPath}
                        onModuleReorder={handleModuleReorder}
                        onModuleSelect={handleModuleSelect}
                        selectedModule={selectedModule}
                        // onAddModule={handleAddModule}
                        onDeleteModule={handleDeleteModule}
                        modules={modules}
                      />
                    </div>

                    {/* Module Configuration Panel (60%) */}
                    <div className="w-3/5">
                      <ModuleConfigPanel
                        selectedModule={selectedModule}
                        onSave={handleModuleSave}
                        onCancel={handleModuleCancel}
                        onSaveWithFiles={handleModuleWithFiles}
                      />
                    </div>
                  </div>
                ) : (
                  <IntegrationStatusPanel
                    onSync={() => console.log('Sync triggered')}
                    onResolveConflict={() => console.log('Conflict resolution')}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Path Modal */}
      <CreateLearningPath
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchLearningPaths();
          setShowCreateModal(false);
        }}
      />
    </div>
  );
};

export default LearningPathManagement;