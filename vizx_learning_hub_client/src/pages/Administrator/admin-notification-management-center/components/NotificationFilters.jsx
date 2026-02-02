import React from 'react';
import { Filter, Search } from 'lucide-react';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';

const NotificationFilters = ({ 
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  audienceFilter,
  onAudienceChange
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
    { value: 'archived', label: 'Archived' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'achievement', label: 'Achievement' },
    { value: 'streak', label: 'Streak' },
    { value: 'module_completion', label: 'Module Completion' },
    { value: 'path_completion', label: 'Path Completion' },
    { value: 'system', label: 'System' },
    { value: 'welcome', label: 'Welcome' },
  ];

  const audienceOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'hr', label: 'HR' },
  ];

  return (
    <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Filter size={18} className="text-primary" />
        </div>
        <h3 className="font-bold text-foreground tracking-tight">Filters & Search</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target?.value || e)}
            className="w-full pl-10 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-all"
          />
        </div>
        
        <div className="space-y-1">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={onStatusChange}
            className="w-full rounded-xl bg-muted/30 border-border/50"
          />
        </div>

        <div className="space-y-1">
          <Select
            options={typeOptions}
            value={typeFilter}
            onChange={onTypeChange}
            className="w-full rounded-xl bg-muted/30 border-border/50 transition-all"
          />
        </div>

        <div className="space-y-1">
          <Select
            options={audienceOptions}
            value={audienceFilter}
            onChange={onAudienceChange}
            className="w-full rounded-xl bg-muted/30 border-border/50 transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationFilters;