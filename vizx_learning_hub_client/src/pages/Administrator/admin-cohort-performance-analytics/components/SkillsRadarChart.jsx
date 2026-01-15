import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../../components/AppIcon';

const SkillsRadarChart = ({ data }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon name="Target" size={24} className="text-primary" />
        <h3 className="text-xl font-bold text-foreground">Skills Performance</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="skill" stroke="#64748b" />
          <PolarRadiusAxis stroke="#64748b" />
          <Radar 
            name="Score" 
            dataKey="score" 
            stroke="#3b82f6" 
            fill="#3b82f6" 
            fillOpacity={0.6} 
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillsRadarChart;