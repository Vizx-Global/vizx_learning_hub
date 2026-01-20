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
  List
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import moduleService from '../../../api/moduleService';
import SideVideoPlayer from './components/SideVideoPlayer';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../utils/cn';
import Swal from 'sweetalert2';

const MyCourses = () => {
  const location = useLocation();
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedModule, setSelectedModule] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const contentTypes = ['All', 'VIDEO', 'AUDIO', 'DOCUMENT', 'TEXT', 'QUIZ'];
  const difficulties = ['All', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  const stats = useMemo(() => ({
    total: modules.length,
    inProgress: Math.floor(modules.length * 0.4), // Mocked for UI
    completed: Math.floor(modules.length * 0.2), // Mocked for UI
    totalPoints: modules.reduce((acc, m) => acc + (m.completionPoints || 0), 0)
  }), [modules]);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const response = await moduleService.getAllModules();
      const body = response.data;
      const modulesData = body?.data?.modules || body?.modules || (Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []));
      
      setModules(modulesData);
      setFilteredModules(modulesData);
      return modulesData;
    } catch (error) {
      console.error('Error fetching modules:', error);
      Swal.fire({
        icon: 'error',
        title: 'Connection Issue',
        text: 'Failed to load course modules. Please try again later.',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleNavigationState = async () => {
      const allModules = await fetchModules();
      
      const statePathId = location.state?.learningPathId;
      const stateModuleId = location.state?.moduleId;

      if (stateModuleId) {
        const target = allModules.find(m => m.id === stateModuleId);
        if (target) {
            setSelectedModule(target);
            setIsPlayerOpen(true);
        }
      } else if (statePathId) {
        const pathModules = allModules.filter(m => m.learningPathId === statePathId);
        if (pathModules.length > 0) {
           setSelectedModule(pathModules[0]);
           setIsPlayerOpen(true);
        }
      }
    };
    handleNavigationState();
  }, [location]);

  useEffect(() => {
    filterModules();
  }, [searchQuery, selectedType, selectedDifficulty, modules]);

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

    setFilteredModules(result);
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'VIDEO': return <Video className="h-4 w-4" />;
      case 'AUDIO': return <Mic className="h-4 w-4" />;
      case 'DOCUMENT': return <FileText className="h-4 w-4" />;
      case 'TEXT': return <BookOpen className="h-4 w-4" />;
      case 'QUIZ': return <Sparkles className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden pt-10">
      <div className="container mx-auto px-6 space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase">My Courses</h1>
            <p className="text-muted-foreground text-sm font-medium opacity-70">Empower your expertise with curated modules.</p>
          </div>
          <Badge variant="outline" className="px-4 py-1.5 rounded-full border-border/60 font-bold uppercase tracking-widest text-[10px]">
            {filteredModules.length} Modules Available
          </Badge>
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
          <div className={cn(
            "grid gap-8",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
          )}>
            <AnimatePresence>
              {filteredModules.map((module, idx) => (
                <motion.div
                  key={module.id}
                  layoutId={module.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "group relative bg-card border border-border/60 shadow-sm overflow-hidden hover:shadow-2xl hover:border-primary/30 transition-all duration-500",
                    viewMode === 'grid' ? "flex flex-col rounded-[2rem] aspect-[4/5] h-full" : "flex flex-col md:flex-row rounded-[1.5rem] items-center"
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
                           {getTypeIcon(module.contentType)}
                         </div>
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-4 flex gap-2">
                       <span className="px-3 py-1 bg-black/40 text-white backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                          {getTypeIcon(module.contentType)}
                          {module.contentType}
                       </span>
                    </div>

                    <div className="absolute top-4 right-4">
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
                         onClick={() => {
                           setSelectedModule(module);
                           setIsPlayerOpen(true);
                         }}
                         className="flex-1 bg-primary text-white rounded-xl h-12 font-black text-[10px] uppercase tracking-[0.15em] hover:shadow-lg hover:shadow-primary/30 transition-all gap-2"
                       >
                          {module.status === 'IN_PROGRESS' ? 'Continue Learning' : 'Start Learning'} <ChevronRight className="h-4 w-4" />
                       </Button>
                       <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-border/60 hover:bg-muted transition-colors">
                          <MoreVertical className="h-4 w-4" />
                       </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredModules.length === 0 && (
           <div className="text-center py-32 bg-card rounded-[3rem] border border-dashed border-border/60">
              <div className="w-24 h-24 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Search className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter">Zero results detected</h3>
              <p className="text-muted-foreground font-medium opacity-60 mt-3 max-w-sm mx-auto leading-relaxed">
                  We couldn't locate any modules matching that intelligence criteria. Try recalibrating your search term or filters.
              </p>
              <Button 
                  onClick={() => {
                      setSearchQuery('');
                      setSelectedType('All');
                      setSelectedDifficulty('All');
                  }}
                  className="mt-10 rounded-2xl h-14 px-10 font-bold uppercase tracking-widest text-[11px]"
              >
                  Reset Discovery Filters
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
            onClose={() => setIsPlayerOpen(false)}
            onSelectModule={(m) => setSelectedModule(m)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyCourses;
