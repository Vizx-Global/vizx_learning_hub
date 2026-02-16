import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../../components/AppIcon';

const SkillsRadarChart = ({ data }) => {
  return (
    <div className="bg-[#000000] rounded-[2.5rem] border border-border/50 p-8 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
          <Icon name="Target" size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase tracking-widest text-foreground">Skill Proficiency Vector</h3>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Competency mapping</p>
        </div>
      </div>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="80%">
            <PolarGrid stroke="#ffffff15" />
            <PolarAngleAxis 
              dataKey="skill" 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: '#64748b', fontSize: 8 }} 
              axisLine={false}
              tickLine={false}
            />
            <Radar 
              name="Score" 
              dataKey="score" 
              stroke="#F05123" 
              fill="#F05123" 
              fillOpacity={0.5} 
              strokeWidth={3}
            />
            <Tooltip 
              contentStyle={{ background: '#111', border: '1px solid #ffffff15', borderRadius: '12px', fontSize: '10px' }}
              itemStyle={{ color: '#fff' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SkillsRadarChart;