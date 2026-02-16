import React from 'react';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const DepartmentPerformanceChart = ({ data }) => {
  return (
    <div className="bg-[#000000] rounded-[2.5rem] border border-border/50 p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black tracking-tight uppercase">Department Completion Rates</h3>
          <p className="text-sm text-muted-foreground font-medium">Comparative skill acquisition rate across business units</p>
        </div>
        <div className="flex items-center gap-2 bg-accent/30 rounded-xl p-1">
          <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-primary shadow-sm rounded-lg">Completion %</button>
          <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">Activity Score</button>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--secondary)" stopOpacity={1}/>
                <stop offset="100%" stopColor="var(--secondary)" stopOpacity={0.7}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.3)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 900, fill: '#FFFFFF' }}
              dy={10}
              label={{ value: 'Departments', position: 'insideBottom', offset: -10, fill: '#F05123', fontSize: 12, fontWeight: 900 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#FFFFFF' }}
              domain={[0, 100]}
              label={{ value: 'Completion %', angle: -90, position: 'insideLeft', fill: '#F05123', fontSize: 12, fontWeight: 900 }}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(var(--primary-rgb), 0.05)' }}
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                borderRadius: '20px', 
                border: '1px solid var(--border)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                padding: '16px'
              }}
              itemStyle={{ fontWeight: 900, fontSize: '14px', color: 'var(--primary)' }}
              labelStyle={{ fontWeight: 900, fontSize: '10px', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '8px' }}
            />
            <Bar 
              dataKey="completion" 
              radius={[12, 12, 0, 0]} 
              barSize={40}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="url(#barGradient)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DepartmentPerformanceChart;
