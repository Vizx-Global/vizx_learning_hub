import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../../components/AppIcon';

const StrategicInsights = () => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden group cursor-pointer"
    >
      <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700">
        <Icon name="BrainCircuit" size={200} />
      </div>
      <div className="relative z-10">
        <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-[0.2em] mb-8 inline-block">Cognitive Analysis</div>
        <h3 className="text-3xl font-black mb-4 leading-tight">Insight: Strategic Skills Deficit</h3>
        <p className="text-sm opacity-80 mb-10 font-medium leading-relaxed">
          Data patterns identify a bottleneck in "Advanced Prompt Engineering" across technical departments. Early intervention could boost throughput by 18%.
        </p>
        <button className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-white/90 transition-all">
          DEPLOY TARGETED CONTENT <Icon name="ArrowRight" size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default StrategicInsights;
