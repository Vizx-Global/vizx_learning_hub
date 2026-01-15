import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../../components/AppIcon';

const CompletionDistributionChart = ({ data }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon name="PieChart" size={24} className="text-primary" />
        <h3 className="text-xl font-bold text-foreground">Completion Distribution</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ range, count }) => `${range}: ${count}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            <div 
              className="w-4 h-4 rounded-full mx-auto mb-1" 
              style={{ backgroundColor: item.color }}
            />
            <div className="text-xs text-muted-foreground">{item.range}</div>
            <div className="text-sm font-semibold text-foreground">{item.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletionDistributionChart;