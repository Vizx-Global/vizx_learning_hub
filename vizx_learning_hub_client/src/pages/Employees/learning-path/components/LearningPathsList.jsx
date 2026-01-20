import React from 'react';
import { motion } from 'framer-motion';
import LearningPathCard from './LearningPathCard';

const LearningPathsList = ({ learningPaths, currentEnrollment, onEnroll, viewMode = 'grid' }) => {
  return (
    <div className={viewMode === 'grid' 
      ? "grid grid-cols-1 md:grid-cols-2 gap-8" 
      : "flex flex-col gap-6"
    }>
      {learningPaths.map((path, index) => (
        <motion.div
          key={path.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={viewMode === 'list' ? 'w-full' : ''}
        >
          <LearningPathCard
            path={path}
            isEnrolled={path.isEnrolled}
            currentEnrollment={currentEnrollment}
            onEnroll={() => onEnroll(path.id)}
            viewMode={viewMode}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default LearningPathsList;