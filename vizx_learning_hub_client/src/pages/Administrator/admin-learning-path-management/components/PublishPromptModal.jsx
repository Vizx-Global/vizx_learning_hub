import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

const PublishPromptModal = ({ isOpen, onClose, onPublish, pathName }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Decorative Gradient Header */}
          <div className="h-2 bg-gradient-to-r from-primary via-blue-500 to-indigo-600" />
          
          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Icon name="Rocket" size={32} className="text-primary animate-pulse" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-3">Ready to Publish?</h3>
              <p className="text-muted-foreground leading-relaxed">
                The learning path <span className="font-semibold text-foreground">"{pathName}"</span> is currently in draft. Would you like to make it public now?
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="default"
                className="w-full py-6 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
                iconName="Globe"
                iconPosition="left"
                onClick={onPublish}
              >
                Publish Now
              </Button>
              <Button
                variant="outline"
                className="w-full py-6 text-lg font-semibold rounded-2xl border-2"
                onClick={onClose}
              >
                Keep in Draft
              </Button>
            </div>
            
            <p className="text-center text-xs text-muted-foreground mt-6 flex items-center justify-center gap-1.5">
              <Icon name="ShieldCheck" size={14} className="text-success" />
              You can always change the status later in settings.
            </p>
          </div>

          {/* Close button top right */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PublishPromptModal;
