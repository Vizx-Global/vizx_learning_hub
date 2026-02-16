import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../../components/AppIcon';

const PerformanceTrendsChart = ({ data, selectedMetric, onMetricChange }) => {
  const metrics = [
    { id: 'completion', label: 'Completion', color: '#F05123' },
    { id: 'engagement', label: 'Engagement', color: '#22c55e' },
    { id: 'assessment', label: 'Assessment', color: '#f59e0b' }
  ];

  return (
    <div className="bg-[#000000] rounded-[2.5rem] border border-border/50 p-8 shadow-sm h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <Icon name="TrendingUp" size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-widest text-foreground">Performance Velocity</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Growth trajectory analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
          {metrics.map(metric => (
            <button 
              key={metric.id} 
              onClick={() => onMetricChange(metric.id)} 
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedMetric === metric.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-muted/30 text-muted-foreground hover:text-foreground border border-border/30'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis 
              dataKey="month" 
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
              contentStyle={{ background: '#111', border: '1px solid #ffffff15', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle" 
              wrapperStyle={{ paddingTop: '0px', paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
            <Line type="monotone" dataKey="completion" stroke="#F05123" strokeWidth={4} dot={{ r: 4, fill: '#F05123', strokeWidth: 2, stroke: '#000' }} activeDot={{ r: 6, strokeWidth: 0 }} name="Completion %" />
            <Line type="monotone" dataKey="engagement" stroke="#22c55e" strokeWidth={3} dot={{ r: 3 }} name="Engagement %" />
            <Line type="monotone" dataKey="assessment" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} name="Assessment %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceTrendsChart;