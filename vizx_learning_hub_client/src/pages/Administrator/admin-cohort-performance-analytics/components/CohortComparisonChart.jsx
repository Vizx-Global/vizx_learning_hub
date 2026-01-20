import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../../components/AppIcon';

const CohortComparisonChart = ({ data }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6"><Icon name="BarChart3" size={24} className="text-primary" /><h3 className="text-xl font-bold text-foreground">Cohort Comparison</h3></div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
          <Legend />
          <Bar dataKey="completion" fill="#3b82f6" name="Completion %" />
          <Bar dataKey="engagement" fill="#22c55e" name="Engagement %" />
          <Bar dataKey="assessment" fill="#f59e0b" name="Assessment %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CohortComparisonChart;