import React, { useState } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import Select from '../../../../components/ui/Select';

const BulkOperationsToolbar = ({ 
  selectedModules = [], // Changed from selectedPaths to selectedModules
  onBulkAction, 
  onSelectAll, 
  onClearSelection,
  totalModules = 0, // Changed from totalPaths to totalModules
  allModules = [] // Added to get all modules for Select All
}) => {
  const [bulkAction, setBulkAction] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSelectAllActive, setIsSelectAllActive] = useState(false);

  const bulkActions = [
    { value: 'publish', label: 'Publish Modules', icon: 'Upload' },
    { value: 'unpublish', label: 'Unpublish Modules', icon: 'Download' },
    { value: 'activate', label: 'Activate Modules', icon: 'Play' },
    { value: 'deactivate', label: 'Deactivate Modules', icon: 'Pause' },
    { value: 'duplicate', label: 'Duplicate Modules', icon: 'Copy' },
    { value: 'archive', label: 'Archive Modules', icon: 'Archive' },
    { value: 'delete', label: 'Delete Modules', icon: 'Trash2' },
    { value: 'assign-category', label: 'Assign Category', icon: 'Tag' },
    { value: 'update-difficulty', label: 'Update Difficulty', icon: 'TrendingUp' },
    { value: 'reorder', label: 'Reorder Modules', icon: 'List' }
  ];

  const handleSelectAllClick = () => {
    if (isSelectAllActive) {
      // If already selecting all, clear selection
      onClearSelection();
      setIsSelectAllActive(false);
    } else {
      // Select all modules
      if (onSelectAll && allModules.length > 0) {
        onSelectAll(allModules);
      }
      setIsSelectAllActive(true);
    }
  };

  const handleClearSelection = () => {
    onClearSelection();
    setIsSelectAllActive(false);
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedModules.length === 0) return;
    
    if (bulkAction === 'delete' || bulkAction === 'archive') {
      setShowConfirmDialog(true);
    } else {
      executeBulkAction();
    }
  };

  const executeBulkAction = () => {
    onBulkAction(bulkAction, selectedModules);
    setBulkAction('');
    setShowConfirmDialog(false);
  };

  const getActionIcon = (action) => {
    const actionConfig = bulkActions.find(a => a.value === action);
    return actionConfig ? actionConfig.icon : 'Settings';
  };

  const getActionLabel = (action) => {
    const actionConfig = bulkActions.find(a => a.value === action);
    return actionConfig ? actionConfig.label : 'Unknown Action';
  };

  // Calculate module statistics
  const getModuleStats = () => {
    const activeCount = selectedModules.filter(m => m.isActive === true || m.status === 'active' || m.status === 'published').length;
    const inactiveCount = selectedModules.filter(m => m.isActive === false || m.status === 'inactive' || m.status === 'draft').length;
    const videoCount = selectedModules.filter(m => m.contentType === 'VIDEO').length;
    const documentCount = selectedModules.filter(m => m.contentType === 'DOCUMENT').length;
    const totalDuration = selectedModules.reduce((acc, m) => acc + (parseInt(m.estimatedMinutes) || 0), 0);

    return {
      activeCount,
      inactiveCount,
      videoCount,
      documentCount,
      totalDuration
    };
  };

  const stats = getModuleStats();

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return '0 min';
    
    const mins = parseInt(minutes);
    if (isNaN(mins)) return 'N/A';
    
    if (mins < 60) {
      return `${mins} min`;
    } else {
      const hours = Math.floor(mins / 60);
      const remainingMinutes = mins % 60;
      
      if (remainingMinutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${remainingMinutes}m`;
      }
    }
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          {/* Selection Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon name="CheckSquare" size={20} className="text-primary" />
              <span className="font-medium text-foreground">
                {selectedModules.length} of {totalModules} modules selected
              </span>
            </div>
            
            {selectedModules.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Square"
                  iconPosition="left"
                  onClick={handleClearSelection}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="CheckSquare"
                  iconPosition="left"
                  onClick={handleSelectAllClick}
                >
                  {isSelectAllActive ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center gap-3">
            <Select
              placeholder="Choose bulk action..."
              options={bulkActions}
              value={bulkAction}
              onChange={setBulkAction}
              disabled={selectedModules.length === 0}
              className="min-w-48"
            />
            
            <Button
              variant="default"
              size="sm"
              iconName={getActionIcon(bulkAction)}
              iconPosition="left"
              onClick={handleBulkAction}
              disabled={!bulkAction || selectedModules.length === 0}
            >
              Apply Action
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        {selectedModules.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">Quick Actions:</span>
              
              <Button
                variant="outline"
                size="sm"
                iconName="Play"
                iconPosition="left"
                onClick={() => onBulkAction('activate', selectedModules)}
              >
                Activate
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                iconName="Pause"
                iconPosition="left"
                onClick={() => onBulkAction('deactivate', selectedModules)}
              >
                Deactivate
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                iconName="Copy"
                iconPosition="left"
                onClick={() => onBulkAction('duplicate', selectedModules)}
              >
                Duplicate
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                iconName="Tag"
                iconPosition="left"
                onClick={() => onBulkAction('assign-category', selectedModules)}
              >
                Assign Category
              </Button>
            </div>
          </div>
        )}

        {/* Selection Summary */}
        {selectedModules.length > 0 && (
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Info" size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">Selection Summary</span>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Active:</span>
                <span className="ml-2 font-medium text-foreground">
                  {stats.activeCount}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Inactive:</span>
                <span className="ml-2 font-medium text-foreground">
                  {stats.inactiveCount}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Videos:</span>
                <span className="ml-2 font-medium text-foreground">
                  {stats.videoCount}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Duration:</span>
                <span className="ml-2 font-medium text-foreground">
                  {formatDuration(stats.totalDuration)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Confirm Bulk Action</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-sm text-foreground mb-6">
              Are you sure you want to <strong>{getActionLabel(bulkAction)?.toLowerCase()}</strong> {selectedModules.length} module{selectedModules.length > 1 ? 's' : ''}?
            </p>
            
            <div className="flex items-center gap-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={executeBulkAction}
              >
                Confirm {getActionLabel(bulkAction)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkOperationsToolbar;