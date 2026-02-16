import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../../components/AppIcon';

const KPICardsGrid = ({ stats }) => {
  const kpiCards = [
    { label: 'Departments', value: stats.totalDepartments, icon: 'Layout', color: 'from-orange-500 to-orange-600' },
    { label: 'System Users', value: stats.totalUsers, icon: 'Users', color: 'from-orange-500 to-orange-600' },
    { label: 'Active Learners', value: stats.activeLearners, icon: 'Zap', color: 'from-orange-500 to-orange-600' },
    { label: 'Learning Paths', value: stats.totalPaths, icon: 'Route', color: 'from-orange-500 to-orange-600' },
    { label: 'Total Modules', value: stats.totalModules, icon: 'BookOpen', color: 'from-orange-500 to-orange-600' },
    { label: 'Enrollments', value: stats.totalEnrollments, icon: 'ClipboardCheck', color: 'from-orange-500 to-orange-600' },
    { label: 'Certifications', value: stats.totalCertifications, icon: 'Award', color: 'from-orange-500 to-orange-600' },
    { label: 'Avg. Progress', value: `${stats.avgProgress}%`, icon: 'TrendingUp', color: 'from-orange-500 to-orange-600' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiCards.map((kpi, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="group relative bg-[#000000] rounded-[2rem] p-6 border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all overflow-hidden"
        >
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-lg`}>
              <Icon name={kpi.icon} size={24} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{kpi.label}</p>
          </div>
          <div className="text-4xl font-black tracking-tighter relative z-10">
            {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default KPICardsGrid;
