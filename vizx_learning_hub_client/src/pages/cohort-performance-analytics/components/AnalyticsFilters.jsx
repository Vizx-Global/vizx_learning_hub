import React from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';

const AnalyticsFilters = ({ 
  cohorts = [],
  selectedCohort, 
  onCohortChange,
  timeRange,
  onTimeRangeChange,
  selectedMetric,
  onMetricChange
}) => {
  const timeRangeOptions = [
    { value: 'weekly', label: 'Last 7 Days' },
    { value: 'monthly', label: 'Last 30 Days' },
    { value: 'quarterly', label: 'Last Quarter' },
    { value: 'yearly', label: 'Last Year' }
  ];

  const metricOptions = [
    { value: 'completion', label: 'Completion Rate' },
    { value: 'engagement', label: 'Engagement Score' },
    { value: 'assessment', label: 'Assessment Scores' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="Filter" size={20} className="text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Analytics Filters</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Cohort"
          options={cohorts.map(c => ({ value: c.id, label: c.name }))}
          value={selectedCohort}
          onChange={onCohortChange}
          className="w-full"
        />
        <Select
          label="Time Range"
          options={timeRangeOptions}
          value={timeRange}
          onChange={onTimeRangeChange}
          className="w-full"
        />
        <Select
          label="Primary Metric"
          options={metricOptions}
          value={selectedMetric}
          onChange={onMetricChange}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default AnalyticsFilters;