import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../../components/AppIcon';

const PerformanceTrendsChart = ({ data, selectedMetric, onMetricChange }) => {
  const metrics = [
    { id: 'completion', label: 'Completion', color: '#3b82f6' },
    { id: 'engagement', label: 'Engagement', color: '#22c55e' },
    { id: 'assessment', label: 'Assessment', color: '#f59e0b' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><Icon name="TrendingUp" size={24} className="text-primary" /><h3 className="text-xl font-bold text-foreground">Performance Trends</h3></div>
        <div className="flex gap-2">
          {metrics.map(metric => (
            <button key={metric.id} onClick={() => onMetricChange(metric.id)} className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${selectedMetric === metric.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
              {metric.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
          <Legend />
          <Line type="monotone" dataKey="completion" stroke="#3b82f6" strokeWidth={2} name="Completion %" />
          <Line type="monotone" dataKey="engagement" stroke="#22c55e" strokeWidth={2} name="Engagement %" />
          <Line type="monotone" dataKey="assessment" stroke="#f59e0b" strokeWidth={2} name="Assessment %" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceTrendsChart;