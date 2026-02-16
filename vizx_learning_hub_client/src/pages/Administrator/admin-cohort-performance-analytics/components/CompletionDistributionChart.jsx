import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../../components/AppIcon';

const CompletionDistributionChart = ({ data }) => {
  return (
    <div className="bg-[#000000] rounded-[2.5rem] border border-border/50 p-8 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
          <Icon name="PieChart" size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase tracking-widest text-foreground">Completion Skew</h3>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Learner volume distribution</p>
        </div>
      </div>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={data} 
              cx="50%" 
              cy="50%" 
              innerRadius={60}
              outerRadius={100} 
              paddingAngle={5}
              dataKey="count"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ background: '#111', border: '1px solid #ffffff15', borderRadius: '12px', fontSize: '10px' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-8 grid grid-cols-5 gap-4">
        {data.map((item, index) => (
          <div key={index} className="text-center group cursor-default">
            <div className="w-2.5 h-2.5 rounded-full mx-auto mb-2 border border-white/10 group-hover:scale-125 transition-transform" style={{ backgroundColor: item.color }} />
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{item.range}</div>
            <div className="text-sm font-black text-foreground">{item.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletionDistributionChart;