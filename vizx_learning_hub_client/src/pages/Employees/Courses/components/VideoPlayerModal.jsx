import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  Maximize, 
  Settings, 
  Clock, 
  Award,
  BookOpen,
  ChevronRight,
  Download
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

const VideoPlayerModal = ({ isOpen, onClose, module }) => {
  if (!module) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-card w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl border border-border/50 flex flex-col lg:flex-row h-[90vh] lg:h-[80vh]"
          >
            {/* Main Video Area */}
            <div className="flex-[2] bg-black relative group flex flex-col">
              <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white text-xs font-medium uppercase tracking-wider">Now Playing</span>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center">
                {module.videoUrl ? (
                  <video
                    src={module.videoUrl}
                    poster={module.thumbnailUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-8">
                     <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="h-10 w-10 text-primary" />
                     </div>
                     <p className="text-muted-foreground italic">Video content not available for this module.</p>
                  </div>
                )}
              </div>

              {/* Video Info Overlay (Mobile/Initial) */}
              <div className="p-6 bg-gradient-to-t from-black to-transparent">
                 <h2 className="text-white text-xl font-bold mb-1">{module.title}</h2>
                 <p className="text-white/70 text-sm line-clamp-1">{module.learningPath?.title || 'Course Module'}</p>
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="flex-1 bg-card border-l border-border/50 flex flex-col max-h-[40vh] lg:max-h-full">
              {/* Header */}
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">Module Details</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="rounded-full hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Module Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-3 rounded-xl border border-border/50 flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Clock className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Duration</p>
                      <p className="text-sm font-semibold">{module.estimatedMinutes}m</p>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-xl border border-border/50 flex items-center gap-3">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <Award className="h-4 w-4 text-warning" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Points</p>
                      <p className="text-sm font-semibold">{module.completionPoints}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold mb-3">
                    <BookOpen className="h-4 w-4 text-primary" />
                    About this module
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {module.description || 'No description provided for this module.'}
                  </p>
                </div>

                {/* Key Objectives */}
                {module.learningObjectives?.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold mb-3">
                      <Target className="h-4 w-4 text-primary" />
                      Learning Objectives
                    </h4>
                    <ul className="space-y-2">
                      {module.learningObjectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-3 group">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0 group-hover:scale-125 transition-transform" />
                          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <Button className="w-full justify-between items-center group py-6 rounded-xl shadow-lg shadow-primary/20">
                    <span className="font-semibold">Complete & Continue</span>
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  {module.resources?.length > 0 && (
                    <Button variant="outline" className="w-full gap-2 py-6 rounded-xl">
                      <Download className="h-4 w-4" />
                      Download Resources
                    </Button>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-muted/20 border-t border-border/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <img 
                       src="/logo.png" 
                       alt="Vizx" 
                       className="h-6 w-auto opacity-50 contrast-0 grayscale invert"
                       onError={(e) => {
                         e.target.style.display = 'none';
                         e.target.nextSibling.style.display = 'block';
                       }}
                    />
                    <span className="hidden text-[10px] font-black tracking-tighter text-primary/40">VIZX</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Vizx Academy</p>
                    <p className="text-xs font-medium">Empowering your growth</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoPlayerModal;
