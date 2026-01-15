import React from 'react';
import Icon from '../../../../components/AppIcon';
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
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'sent', label: 'Sent' },
    { value: 'failed', label: 'Failed' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'email', label: 'Email' },
    { value: 'push', label: 'Push Notification' },
    { value: 'in-app', label: 'In-App' },
    { value: 'sms', label: 'SMS' }
  ];

  const audienceOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'department', label: 'By Department' },
    { value: 'cohort', label: 'By Cohort' },
    { value: 'individual', label: 'Individual Users' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="Filter" size={20} className="text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Filters & Search</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={onSearchChange}
          className="w-full"
        />
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={onStatusChange}
          className="w-full"
        />
        <Select
          options={typeOptions}
          value={typeFilter}
          onChange={onTypeChange}
          className="w-full"
        />
        <Select
          options={audienceOptions}
          value={audienceFilter}
          onChange={onAudienceChange}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default NotificationFilters;