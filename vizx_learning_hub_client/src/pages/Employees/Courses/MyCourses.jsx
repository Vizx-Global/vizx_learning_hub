import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Video, 
  FileText, 
  Mic, 
  Link as LinkIcon, 
  Clock, 
  BarChart,
  PlayCircle,
  MoreVertical,
  Zap,
  TrendingUp,
  Award,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  List,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { useLocation, useSearchParams } from 'react-router-dom';
import moduleService from '../../../api/moduleService';
import learningPathService from '../../../api/learningPathService';
import enrollmentService from '../../../api/enrollmentService';
import SideVideoPlayer from './components/SideVideoPlayer';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../utils/cn';
import Swal from 'sweetalert2';

import { useFilter } from '../../../contexts/FilterContext';
import { parseISO } from 'date-fns';

const MyCourses = () => {
  const { dateRange, activePreset } = useFilter();
  const [searchParams, setSearchParams] = useSearchParams();
  const [modules, setModules] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [groupedModules, setGroupedModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedModule, setSelectedModule] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const contentTypes = ['All', 'VIDEO', 'AUDIO', 'DOCUMENT', 'TEXT', 'QUIZ'];
  const difficulties = ['All', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  const stats = useMemo(() => {
    const enrolledModules = Object.values(groupedModules).flatMap(group => group.modules);
    return {
      total: enrolledModules.length,
      inProgress: enrollments.filter(e => e.status === 'IN_PROGRESS').length,
      completed: enrollments.filter(e => e.status === 'COMPLETED').length,
      totalPoints: enrolledModules.reduce((acc, m) => acc + (m.completionPoints || 0), 0)
    };
  }, [groupedModules, enrollments]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [modulesRes, pathsRes, enrollmentsRes] = await Promise.all([
        moduleService.getAllModules(),
        learningPathService.getAllLearningPaths(),
        enrollmentService.getMyEnrollments({ includeProgress: true, includePath: true })
      ]);

      const modulesData = modulesRes.data?.data?.modules || modulesRes.data?.modules || (Array.isArray(modulesRes.data?.data) ? modulesRes.data.data : (Array.isArray(modulesRes.data) ? modulesRes.data : []));
      const pathsData = pathsRes.data?.data?.learningPaths || pathsRes.data?.learningPaths || (Array.isArray(pathsRes.data?.data) ? pathsRes.data.data : (Array.isArray(pathsRes.data) ? pathsRes.data : []));
      const enrollData = enrollmentsRes.data?.data?.enrollments || enrollmentsRes.data?.enrollments || (Array.isArray(enrollmentsRes.data?.data) ? enrollmentsRes.data.data : (Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : []));

      setModules(modulesData);
      setEnrollments(enrollData);

      const enrolledPathIds = new Set(enrollData.map(e => e.learningPathId));
      
      const enrichedPaths = pathsData
        .filter(p => enrolledPathIds.has(p.id) && p.status === 'PUBLISHED')
        .map(path => {
          const enrollment = enrollData.find(e => e.learningPathId === path.id);
          return {
            ...path,
            progress: enrollment?.progress || 0,
            status: enrollment?.status || 'ENROLLED',
            completionRate: `${Math.round(enrollment?.progress || 0)}%`
          };
        });

      setLearningPaths(enrichedPaths);
      return { modulesData, enrichedPaths };
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Connection Issue',
        text: 'Failed to load course modules. Please try again later.',
      });
      return { modulesData: [], enrichedPaths: [] };
    } finally {
      setLoading(false);
    }
  };

  const groupModules = (allModules, enrolledPaths, allEnrollments) => {
    const grouped = {};
    if (!enrolledPaths || !enrolledPaths.length) return grouped;
    
    enrolledPaths.forEach(path => {
      const enrollment = allEnrollments.find(e => e.learningPathId === path.id);
      const progressMap = new Map();
      if (enrollment?.moduleProgress) {
        enrollment.moduleProgress.forEach(mp => {
          progressMap.set(mp.moduleId, {
            status: mp.status,
            progress: mp.progress || 0
          });
        });
      }

      grouped[path.id] = {
        path,
        modules: allModules
          .filter(m => m.learningPathId === path.id)
          .map(m => {
            const moduleProgress = progressMap.get(m.id);
            return {
              ...m,
              status: moduleProgress?.status || 'NOT_STARTED',
              progress: moduleProgress?.progress || 0,
              enrollmentId: enrollment?.id
            };
          })
      };
    });
    return grouped;
  };

  // 1. Initial Data Fetch
  useEffect(() => {
    fetchData();
  }, []);

  // 2. Handle Navigation State & Persistence
  useEffect(() => {
    if (modules.length === 0) return;

    const urlModuleId = searchParams.get('moduleId');
    const statePathId = location.state?.learningPathId;
    const stateModuleId = location.state?.moduleId;

    const targetModuleId = urlModuleId || stateModuleId;

    if (targetModuleId) {
      const target = modules.find(m => m.id === targetModuleId);
      if (target) {
        setSelectedModule(target);
        setIsPlayerOpen(true);
      }
    } else if (statePathId) {
      const pathModules = modules.filter(m => m.learningPathId === statePathId);
      if (pathModules.length > 0) {
        setSelectedModule(pathModules[0]);
        setIsPlayerOpen(true);
      }
    }
  }, [modules, searchParams, location.state]);

  // 3. Filtering logic (Separated from fetching)
  useEffect(() => {
    if (loading) return; 
    filterModules();
  }, [searchQuery, selectedType, selectedDifficulty, modules, learningPaths, enrollments, dateRange, activePreset]);

  const handleOpenModule = (module) => {
    setSelectedModule(module);
    setIsPlayerOpen(true);
    setSearchParams({ moduleId: module.id });
  };

  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('moduleId');
    setSearchParams(newParams);
  };

  const handleSelectModule = (module) => {
    setSelectedModule(module);
    setSearchParams({ moduleId: module.id });
  };

  const filterModules = () => {
    let result = modules;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.title.toLowerCase().includes(lowerQuery) || 
        m.description?.toLowerCase().includes(lowerQuery)
      );
    }

    if (selectedType !== 'All') {
      result = result.filter(m => m.contentType === selectedType);
    }

    if (selectedDifficulty !== 'All') {
      result = result.filter(m => m.difficulty === selectedDifficulty);
    }

    const isWithin = (dateStr) => {
      if (!dateStr) return false;
      if (activePreset === 'All Time') return true;
      if (!dateRange || !dateRange.from) return true;
      
      const date = parseISO(dateStr);
      const start = dateRange.from;
      const end = dateRange.to || new Date();
      
      return date >= start && date <= end;
    };

    if (activePreset !== 'All Time') {
      const filteredEnrollments = enrollments.filter(e => isWithin(e.lastActivityAt));
      const filteredPathIds = new Set(filteredEnrollments.map(e => e.learningPathId));
      result = result.filter(m => filteredPathIds.has(m.learningPathId));
    }

    const grouped = groupModules(result, learningPaths, enrollments);
    setGroupedModules(grouped);
  };

  const getModuleCategoryColor = (category) => {
    const colors = {
      'Technical': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'Soft Skills': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'Business': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'Design': 'bg-pink-500/10 text-pink-500 border-pink-500/20'
    };
    return colors[category] || 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  };

  const getTypeIcon = (module) => {
    const type = module.contentType;
    const url = module.documentUrl || '';
    
    if (type === 'VIDEO') return <Video className="h-4 w-4" />;
    if (type === 'AUDIO') return <Mic className="h-4 w-4" />;
    if (type === 'TEXT') return <BookOpen className="h-4 w-4" />;
    if (type === 'QUIZ') return <Sparkles className="h-4 w-4" />;
    
    if (url.toLowerCase().endsWith('.pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (url.toLowerCase().match(/\.(doc|docx)$/)) return <FileText className="h-4 w-4 text-blue-500" />;
    if (url.toLowerCase().match(/\.(ppt|pptx)$/)) return <BarChart className="h-4 w-4 text-orange-500" />;
    
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden pt-10">
      <div className="container mx-auto px-6 space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase">My Learning Journey</h1>
            <p className="text-muted-foreground text-sm font-medium opacity-70">Focus on your active enrolled paths and achieve mastery.</p>
          </div>
          <div className="flex gap-4">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-border/60 font-bold uppercase tracking-widest text-[10px]">
              {learningPaths.length} Active Paths
            </Badge>
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-border/60 font-bold uppercase tracking-widest text-[10px]">
              {modules.length} Total Modules
            </Badge>
          </div>
        </div>
        
        {/* Control & Filter Panel */}
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
           <div className="relative w-full lg:w-[500px] group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search modules, skills, or outcomes..." 
                className="h-14 pl-12 pr-6 rounded-[1.25rem] bg-card border-border/60 shadow-sm text-lg focus-visible:ring-primary focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>

           <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 no-scrollbar">
              <div className="flex bg-muted p-1.5 rounded-[1rem] border border-border overflow-hidden shrink-0">
                 <button 
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2.5 rounded-lg transition-all",
                    viewMode === 'grid' ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                 >
                   <LayoutGrid className="h-5 w-5" />
                 </button>
                 <button 
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2.5 rounded-lg transition-all",
                    viewMode === 'list' ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                 >
                   <List className="h-5 w-5" />
                 </button>
              </div>

              <div className="h-10 w-px bg-border hidden lg:block mx-2 shrink-0" />

              <div className="flex items-center gap-3">
                 <select 
                   className="h-12 px-6 rounded-[1rem] bg-card border border-border/60 text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:border-primary/40 transition-colors shrink-0"
                   value={selectedType}
                   onChange={(e) => setSelectedType(e.target.value)}
                 >
                   {contentTypes.map((type) => (
                     <option key={type} value={type}>{type === 'All' ? 'Material Type' : type}</option>
                   ))}
                 </select>

                 <select 
                   className="h-12 px-6 rounded-[1rem] bg-card border border-border/60 text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:border-primary/40 transition-colors shrink-0"
                   value={selectedDifficulty}
                   onChange={(e) => setSelectedDifficulty(e.target.value)}
                 >
                   {difficulties.map((diff) => (
                     <option key={diff} value={diff}>{diff === 'All' ? 'Complexity Level' : diff}</option>
                   ))}
                 </select>

                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-12 w-12 rounded-[1rem] text-muted-foreground hover:text-primary transition-colors border border-border/60 shrink-0"
                   onClick={() => {
                     setSearchQuery('');
                     setSelectedType('All');
                     setSelectedDifficulty('All');
                   }}
                 >
                   <Filter className="h-5 w-5" />
                 </Button>
              </div>
           </div>
        </div>

        {/* Dynamic Display Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-card rounded-[2rem] h-[340px] animate-pulse border border-border/40 p-6 flex flex-col gap-4">
                <div className="w-full h-40 bg-muted/60 rounded-2xl" />
                <div className="h-6 w-3/4 bg-muted/60 rounded-lg" />
                <div className="h-4 w-1/2 bg-muted/60 rounded-lg" />
                <div className="mt-auto h-12 w-full bg-muted/60 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            {Object.entries(groupedModules).map(([pathId, { path, modules: pathModules }], pathIdx) => (
              pathModules.length > 0 && (
                <div key={pathId} className="space-y-8">
                  <div className="flex items-end justify-between border-b border-border/40 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner shrink-0">
                        {pathIdx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-2">
                           <h2 className="text-2xl font-black tracking-tight text-foreground/90 truncate">{path.title}</h2>
                           <span className="text-[12px] font-black text-primary bg-primary/10 px-3 py-1 rounded-lg shrink-0">{path.completionRate}</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden border border-border/40">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: path.completionRate }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-primary"
                              />
                           </div>
                           <div className="flex items-center gap-3 shrink-0">
                             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{path.category}</span>
                             <div className="w-1.5 h-1.5 rounded-full bg-border" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-primary">{pathModules.length} Modules</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    "grid gap-8",
                    viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                  )}>
                    <AnimatePresence>
                      {pathModules.map((module, idx) => {
                        const isPathCompleted = path.progress === 100 || path.status === 'COMPLETED';
                        // A module is strictly "complete" if its status is COMPLETED or progress is 100%
                        const isModuleComplete = module.status === 'COMPLETED' || module.progress === 100;

                        // Locking Logic:
                        // 1. If the entire path (course) is completed, all modules are unlocked
                        // 2. Else if it's the first module (idx === 0), it's always unlocked
                        // 3. Else if the module itself is complete, it's unlocked for review
                        // 4. Else if the previous module is complete, this current one is unlocked for progress
                        // 5. Otherwise, the module is locked
                        const isLocked = isPathCompleted ? false : (
                           idx > 0 && 
                           !isModuleComplete && 
                           !(pathModules[idx-1].status === 'COMPLETED' || pathModules[idx-1].progress === 100)
                        );
                        
                        return (
                          <motion.div
                            key={module.id}
                            layoutId={module.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            className={cn(
                              "group relative bg-card border border-border/60 shadow-sm overflow-hidden hover:shadow-2xl hover:border-primary/30 transition-all duration-500",
                              viewMode === 'grid' ? "flex flex-col rounded-[2rem] aspect-[4/5] h-full" : "flex flex-col md:flex-row rounded-[1.5rem] items-center",
                              isLocked && "opacity-75 grayscale-[0.5]"
                            )}
                          >
                            {/* Visual Interface */}
                            <div className={cn(
                              "relative overflow-hidden bg-muted/30",
                              viewMode === 'grid' ? "h-[55%]" : "w-full md:w-80 h-48 rounded-[1.5rem] m-3 shrink-0"
                            )}>
                              {module.thumbnailUrl ? (
                                <img 
                                  src={module.thumbnailUrl} 
                                  alt={module.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/20">
                                   <div className="p-4 bg-background rounded-2xl shadow-sm ring-1 ring-border group-hover:scale-110 transition-transform">
                                     {isLocked ? <Lock className="h-4 w-4 text-muted-foreground" /> : getTypeIcon(module)}
                                   </div>
                                </div>
                              )}
                              
                              {isLocked && (
                                <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                                   <div className="p-4 bg-background/80 rounded-full shadow-xl border border-border">
                                      <Lock className="h-6 w-6 text-muted-foreground" />
                                   </div>
                                 </div>
                               )}

                              {isModuleComplete && (
                                <div className="absolute bottom-4 left-4 z-20">
                                   <div className="flex items-center gap-1.5 px-3 py-1 bg-success/20 text-success backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest border border-success/30">
                                      <CheckCircle2 className="h-3 w-3" />
                                      <span>Completed</span>
                                   </div>
                                </div>
                              )}

                              <div className="absolute top-4 left-4 flex gap-2 z-20">
                                 <span className={cn(
                                   "px-3 py-1 bg-black/40 text-white backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2",
                                   module.contentType === 'DOCUMENT' && module.documentUrl?.toLowerCase().endsWith('.pdf') && "bg-red-500/20 border-red-500/30",
                                   module.contentType === 'DOCUMENT' && module.documentUrl?.toLowerCase().match(/\.(ppt|pptx)$/) && "bg-orange-500/20 border-orange-500/30",
                                   module.contentType === 'DOCUMENT' && module.documentUrl?.toLowerCase().match(/\.(doc|docx)$/) && "bg-blue-500/20 border-blue-500/30"
                                 )}>
                                    {getTypeIcon(module)}
                                    {module.contentType === 'DOCUMENT' 
                                      ? (module.documentUrl?.split('.').pop()?.toUpperCase() || 'DOC') 
                                      : module.contentType}
                                 </span>
                              </div>

                              <div className="absolute top-4 right-4 z-20">
                                 <span className={cn(
                                   "px-2.5 py-1 text-[9px] font-black uppercase tracking-tighter rounded-lg border",
                                   module.difficulty === 'ADVANCED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                   module.difficulty === 'INTERMEDIATE' ? 'bg-warning/10 text-warning border-warning/20' : 
                                   'bg-success/10 text-success border-success/20'
                                 )}>
                                    {module.difficulty}
                                 </span>
                              </div>
                            </div>

                            {/* Information Design */}
                            <div className="p-6 flex flex-col flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-3">
                                 <span className={cn(
                                   "px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border shrink-0",
                                   getModuleCategoryColor(module.category)
                                 )}>
                                   {module.category || 'Strategic Growth'}
                                 </span>
                                 <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">{module.estimatedMinutes}m</span>
                                 </div>
                              </div>

                              <h3 className="text-xl font-black tracking-tight mb-3 text-foreground/90 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                {module.title}
                              </h3>

                              <p className="text-muted-foreground text-xs font-medium leading-relaxed line-clamp-2 mb-6 opacity-70">
                                 {module.description || 'Achieve deep mastery in this module specially curated for your professional evolution.'}
                              </p>

                              <div className="mt-auto flex items-center gap-4">
                                 <Button 
                                   disabled={isLocked}
                                   onClick={() => handleOpenModule(module)}
                                   className={cn(
                                     "flex-1 rounded-xl h-12 font-black text-[10px] uppercase tracking-[0.15em] transition-all gap-2",
                                     isLocked ? "bg-muted text-muted-foreground cursor-not-allowed" :
                                     isModuleComplete 
                                       ? "bg-success/20 text-success border border-success/30 hover:bg-success/30" 
                                       : "bg-primary text-white hover:shadow-lg hover:shadow-primary/30"
                                   )}
                                 >
                                    {isLocked ? <Lock className="h-4 w-4" /> : isModuleComplete && <CheckCircle2 className="h-4 w-4" />}
                                    {isLocked ? 'Locked' : isModuleComplete ? 'Redo Module' : 
                                     module.status === 'IN_PROGRESS' ? 'Continue' : 'Start Learning'} 
                                    {!isLocked && <ChevronRight className="h-4 w-4" />}
                                 </Button>
                                 <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-border/60 hover:bg-muted transition-colors">
                                    <MoreVertical className="h-4 w-4" />
                                 </Button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && Object.keys(groupedModules).length === 0 && (
           <div className="text-center py-32 bg-card rounded-[3rem] border border-dashed border-border/60">
              <div className="w-24 h-24 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-8">
                  <BookOpen className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter">No Enrolled Paths</h3>
              <p className="text-muted-foreground font-medium opacity-60 mt-3 max-w-sm mx-auto leading-relaxed">
                  You haven't enrolled in any learning paths yet. Explore the discovery page to start your professional journey.
              </p>
              <Button 
                  onClick={() => window.location.href = '/employee-learning-paths'}
                  className="mt-10 rounded-2xl h-14 px-10 font-bold uppercase tracking-widest text-[11px]"
              >
                  Explore Learning Paths
              </Button>
           </div>
        )}
      </div>

      {/* Deep Focus Experience Overlay */}
      <AnimatePresence>
        {isPlayerOpen && (
          <SideVideoPlayer 
            module={selectedModule}
            allModules={modules}
            onClose={handleClosePlayer}
            onSelectModule={handleSelectModule}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyCourses;
