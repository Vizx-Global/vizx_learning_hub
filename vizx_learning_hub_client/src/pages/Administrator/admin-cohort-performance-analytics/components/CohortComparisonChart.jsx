import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../../components/AppIcon';

const CohortComparisonChart = ({ data }) => {
  return (
    <div className="bg-[#000000] rounded-[2.5rem] border border-border/50 p-8 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
          <Icon name="BarChart3" size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase tracking-widest text-foreground">Benchmarking Hub</h3>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Cross-cohort comparative analysis</p>
        </div>
      </div>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: '#64748b', fontWeight: 'bold' }}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: '#64748b', fontWeight: 'bold' }}
            />
            <Tooltip 
              contentStyle={{ background: '#111', border: '1px solid #ffffff15', borderRadius: '16px', fontSize: '10px' }}
              itemStyle={{ color: '#fff' }}
              cursor={{ fill: '#ffffff05' }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle" 
              wrapperStyle={{ paddingTop: '0px', paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
            <Bar dataKey="completion" fill="#F05123" radius={[4, 4, 0, 0]} name="Completion %" />
            <Bar dataKey="engagement" fill="#22c55e" radius={[4, 4, 0, 0]} name="Engagement %" />
            <Bar dataKey="assessment" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Assessment %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CohortComparisonChart;