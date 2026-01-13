import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkOperationsToolbar = ({ selectedItems = [], onBulkAction, totalItems = 0 }) => {
  const [isOperationRunning, setIsOperationRunning] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const bulkActions = [
    {
      id: 'sync_all',
      label: 'Sync All',
      icon: 'RefreshCw',
      variant: 'default',
      description: 'Synchronize all selected items with Microsoft Learn',
      requiresConfirmation: true
    },
    {
      id: 'force_refresh',
      label: 'Force Refresh',
      icon: 'RotateCcw',
      variant: 'secondary',
      description: 'Force refresh content ignoring cache',
      requiresConfirmation: true
    },
    {
      id: 'resolve_conflicts',
      label: 'Resolve Conflicts',
      icon: 'GitMerge',
      variant: 'warning',
      description: 'Automatically resolve version conflicts',
      requiresConfirmation: true
    },
    {
      id: 'clear_cache',
      label: 'Clear Cache',
      icon: 'Trash2',
      variant: 'outline',
      description: 'Clear cached content for selected items',
      requiresConfirmation: false
    },
    {
      id: 'export_status',
      label: 'Export Status',
      icon: 'Download',
      variant: 'ghost',
      description: 'Export synchronization status report',
      requiresConfirmation: false
    }
  ];

  const handleBulkAction = async (action) => {
    if (action?.requiresConfirmation) {
      setPendingAction(action);
      setShowConfirmDialog(true);
      return;
    }

    await executeBulkAction(action);
  };

  const executeBulkAction = async (action) => {
    setIsOperationRunning(true);
    setShowConfirmDialog(false);
    setPendingAction(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onBulkAction) {
        onBulkAction(action?.id, selectedItems);
      }

      // Show success notification (in real app, use toast/notification system)
      console.log(`Bulk action ${action?.label} completed successfully`);
    } catch (error) {
      console.error(`Bulk action ${action?.label} failed:`, error);
    } finally {
      setIsOperationRunning(false);
    }
  };

  const getSelectionSummary = () => {
    if (selectedItems?.length === 0) {
      return `${totalItems} total items`;
    }
    return `${selectedItems?.length} of ${totalItems} selected`;
  };

  return (
    <>
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon name="Settings" size={20} className="text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Bulk Operations</h3>
            <div className="px-2 py-1 bg-muted rounded-full">
              <span className="text-xs font-medium text-muted-foreground">
                {getSelectionSummary()}
              </span>
            </div>
          </div>
          
          {isOperationRunning && (
            <div className="flex items-center gap-2 text-primary">
              <Icon name="RefreshCw" size={16} className="animate-spin" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {bulkActions?.map((action) => (
            <Button
              key={action?.id}
              variant={action?.variant}
              size="sm"
              iconName={action?.icon}
              iconPosition="left"
              disabled={isOperationRunning || (selectedItems?.length === 0 && action?.id !== 'export_status')}
              onClick={() => handleBulkAction(action)}
              className="flex-shrink-0"
            >
              {action?.label}
            </Button>
          ))}
        </div>

        {selectedItems?.length > 0 && (
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary mb-1">
                  Bulk operations will affect {selectedItems?.length} selected items
                </p>
                <p className="text-xs text-primary/80">
                  Operations may take several minutes to complete depending on the number of items and API response times.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-2 bg-muted/30 rounded-lg">
            <div className="text-sm font-semibold text-success">
              {Math.floor(totalItems * 0.85)}
            </div>
            <div className="text-xs text-muted-foreground">Synced</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded-lg">
            <div className="text-sm font-semibold text-primary">
              {Math.floor(totalItems * 0.08)}
            </div>
            <div className="text-xs text-muted-foreground">Syncing</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded-lg">
            <div className="text-sm font-semibold text-warning">
              {Math.floor(totalItems * 0.05)}
            </div>
            <div className="text-xs text-muted-foreground">Conflicts</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded-lg">
            <div className="text-sm font-semibold text-error">
              {Math.floor(totalItems * 0.02)}
            </div>
            <div className="text-xs text-muted-foreground">Errors</div>
          </div>
        </div>
      </div>
      {/* Confirmation Dialog */}
      {showConfirmDialog && pendingAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Confirm Bulk Operation
                </h3>
                <p className="text-sm text-muted-foreground">
                  {pendingAction?.label}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {pendingAction?.description}
            </p>

            <div className="bg-muted/30 p-3 rounded-lg mb-6">
              <p className="text-sm text-foreground">
                This operation will affect{' '}
                <span className="font-semibold">
                  {selectedItems?.length > 0 ? selectedItems?.length : totalItems}
                </span>{' '}
                items and cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmDialog(false);
                  setPendingAction(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant={pendingAction?.variant === 'warning' ? 'warning' : 'default'}
                onClick={() => executeBulkAction(pendingAction)}
                loading={isOperationRunning}
              >
                Confirm {pendingAction?.label}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkOperationsToolbar;