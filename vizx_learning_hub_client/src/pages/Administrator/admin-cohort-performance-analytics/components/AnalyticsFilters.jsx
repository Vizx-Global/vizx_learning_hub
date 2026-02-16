import React from 'react';
import Icon from '../../../../components/AppIcon';
import Select from '../../../../components/ui/Select';

const AnalyticsFilters = ({ cohorts = [], selectedCohort, onCohortChange, timeRange, onTimeRangeChange, selectedMetric, onMetricChange }) => {
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
    <div className="bg-[#000000] border border-border/50 rounded-[2rem] p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-6 px-2">
        <div className="p-2.5 rounded-xl bg-muted/30 text-muted-foreground border border-border/50">
          <Icon name="Filter" size={18} className="stroke-[2.5]" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Analytics Filters</h3>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">Refine your intelligence vector</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Learning Cohort</label>
          <Select 
            options={cohorts.map(c => ({ value: c.id, label: c.name }))} 
            value={selectedCohort} 
            onChange={onCohortChange} 
            className="w-full bg-card/30 border-border/40 rounded-xl font-bold uppercase tracking-widest text-[10px]" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Time Horizon</label>
          <Select 
            options={timeRangeOptions} 
            value={timeRange} 
            onChange={onTimeRangeChange} 
            className="w-full bg-card/30 border-border/40 rounded-xl font-bold uppercase tracking-widest text-[10px]" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Primary Metric</label>
          <Select 
            options={metricOptions} 
            value={selectedMetric} 
            onChange={onMetricChange} 
            className="w-full bg-card/30 border-border/40 rounded-xl font-bold uppercase tracking-widest text-[10px]" 
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFilters;