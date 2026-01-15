import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';

const ContentHierarchy = ({ onItemSelect, selectedItem }) => {
  const [expandedItems, setExpandedItems] = useState(new Set(['microsoft-learn', 'ai-fundamentals']));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const contentHierarchy = [
    {
      id: 'microsoft-learn',
      name: 'Microsoft Learn',
      type: 'root',
      children: [
        {
          id: 'ai-fundamentals',
          name: 'AI Fundamentals',
          type: 'learning-path',
          syncStatus: 'synced',
          lastUpdate: new Date('2025-01-06T15:30:00'),
          itemCount: 12,
          children: [
            {
              id: 'intro-ai',
              name: 'Introduction to AI',
              type: 'module',
              syncStatus: 'synced',
              lastUpdate: new Date('2025-01-06T14:20:00'),
              duration: '45 min'
            },
            {
              id: 'machine-learning-basics',
              name: 'Machine Learning Basics',
              type: 'module',
              syncStatus: 'syncing',
              lastUpdate: new Date('2025-01-06T13:15:00'),
              duration: '60 min'
            },
            {
              id: 'neural-networks',
              name: 'Neural Networks Overview',
              type: 'module',
              syncStatus: 'error',
              lastUpdate: new Date('2025-01-05T16:45:00'),
              duration: '75 min',
              error: 'API rate limit exceeded'
            }
          ]
        },
        {
          id: 'azure-ai-services',
          name: 'Azure AI Services',
          type: 'learning-path',
          syncStatus: 'pending',
          lastUpdate: new Date('2025-01-05T10:30:00'),
          itemCount: 8,
          children: [
            {
              id: 'cognitive-services',
              name: 'Cognitive Services',
              type: 'module',
              syncStatus: 'synced',
              lastUpdate: new Date('2025-01-05T09:20:00'),
              duration: '90 min'
            },
            {
              id: 'computer-vision',
              name: 'Computer Vision',
              type: 'module',
              syncStatus: 'conflict',
              lastUpdate: new Date('2025-01-04T14:30:00'),
              duration: '120 min',
              conflict: 'Version mismatch detected'
            }
          ]
        },
        {
          id: 'data-science-path',
          name: 'Data Science with Python',
          type: 'learning-path',
          syncStatus: 'synced',
          lastUpdate: new Date('2025-01-06T11:45:00'),
          itemCount: 15,
          children: [
            {
              id: 'python-basics',
              name: 'Python for Data Science',
              type: 'module',
              syncStatus: 'synced',
              lastUpdate: new Date('2025-01-06T11:30:00'),
              duration: '180 min'
            }
          ]
        }
      ]
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'synced':
        return { name: 'CheckCircle', color: 'text-success' };
      case 'syncing':
        return { name: 'RefreshCw', color: 'text-primary animate-spin' };
      case 'error':
        return { name: 'AlertCircle', color: 'text-error' };
      case 'conflict':
        return { name: 'AlertTriangle', color: 'text-warning' };
      case 'pending':
        return { name: 'Clock', color: 'text-muted-foreground' };
      default:
        return { name: 'Circle', color: 'text-muted-foreground' };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'root':
        return 'FolderOpen';
      case 'learning-path':
        return 'BookOpen';
      case 'module':
        return 'FileText';
      default:
        return 'File';
    }
  };

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded?.has(itemId)) {
      newExpanded?.delete(itemId);
    } else {
      newExpanded?.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const formatLastUpdate = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date?.toLocaleDateString();
  };

  const filterItems = (items) => {
    return items?.filter(item => {
      const matchesSearch = item?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      const matchesFilter = filterStatus === 'all' || item?.syncStatus === filterStatus;
      return matchesSearch && matchesFilter;
    });
  };

  const renderItem = (item, level = 0) => {
    const hasChildren = item?.children && item?.children?.length > 0;
    const isExpanded = expandedItems?.has(item?.id);
    const statusIcon = getStatusIcon(item?.syncStatus);
    const isSelected = selectedItem?.id === item?.id;

    return (
      <div key={item?.id} className="select-none">
        <div
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
            transition-all duration-200 hover:bg-accent/50
            ${isSelected ? 'bg-primary/10 border border-primary/20' : ''}
          `}
          style={{ paddingLeft: `${12 + level * 20}px` }}
          onClick={() => onItemSelect(item)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e?.stopPropagation();
                toggleExpanded(item?.id);
              }}
              className="p-0.5 hover:bg-accent rounded"
            >
              <Icon
                name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
                size={14}
                className="text-muted-foreground"
              />
            </button>
          )}
          
          {!hasChildren && <div className="w-5" />}
          
          <Icon
            name={getTypeIcon(item?.type)}
            size={16}
            className="text-muted-foreground flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground truncate">
                {item?.name}
              </span>
              {item?.itemCount && (
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {item?.itemCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {formatLastUpdate(item?.lastUpdate)}
              </span>
              {item?.duration && (
                <span className="text-xs text-muted-foreground">
                  • {item?.duration}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Icon
              name={statusIcon?.name}
              size={14}
              className={statusIcon?.color}
            />
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {filterItems(item?.children)?.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Content Hierarchy</h2>
        
        <div className="space-y-3">
          <div className="relative">
            <Icon
              name="Search"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e?.target?.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Status</option>
            <option value="synced">Synced</option>
            <option value="syncing">Syncing</option>
            <option value="error">Error</option>
            <option value="conflict">Conflict</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {filterItems(contentHierarchy)?.map(item => renderItem(item))}
        </div>
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Total Items: 35</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full" />
            <span>Live Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentHierarchy;