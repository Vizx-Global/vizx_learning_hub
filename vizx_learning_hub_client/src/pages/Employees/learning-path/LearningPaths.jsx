import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import LearningPathsList from './components/LearningPathsList';
import { 
  Filter, 
  Search, 
  LayoutGrid, 
  List,
  SlidersHorizontal,
  X,
  TrendingUp, 
  Award,
  Users
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import learningPathService from '../../../api/learningPathService';
import enrollmentService from '../../../api/enrollmentService';
import Swal from 'sweetalert2';

const LearningPaths = () => {
  const { user } = useAuth();
  const [learningPaths, setLearningPaths] = useState([]);
  const [filteredPaths, setFilteredPaths] = useState([]);
  // No longer need currentEnrollment state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pathsResponse, enrollmentsResponse] = await Promise.all([
        learningPathService.getAllLearningPaths(),
        enrollmentService.getMyEnrollments()
      ]);

      const pathsData = pathsResponse.data?.data || pathsResponse.data;
      const paths = Array.isArray(pathsData) ? pathsData : (pathsData?.learningPaths || []);

      const enrollData = enrollmentsResponse.data?.data || enrollmentsResponse.data;
      const enrollments = Array.isArray(enrollData) ? enrollData : (enrollData?.enrollments || enrollData?.data || []);

      const enrolledPathIds = new Set(enrollments.map(e => e.learningPathId));
      
      const mappedPaths = paths.map(path => {
        const enrollment = enrollments.find(e => String(e.learningPathId) === String(path.id));
        return {
          ...path,
          isEnrolled: !!enrollment,
          progress: enrollment?.progress || 0,
          totalModules: path.modules?.length || path.totalModules || 0,
          estimatedHours: path.estimatedHours || 0,
          pointsReward: path.pointsReward || 0,
          enrolledCount: path.enrollmentCount || path.enrolledCount || 0,
          completionRate: enrollment ? `${Math.round(enrollment.progress)}%` : '0%',
          category: path.category || 'General',
          difficulty: path.difficulty 
            ? path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1).toLowerCase() 
            : 'Beginner',
          modules: path.modules || []
        };
      });

      setLearningPaths(mappedPaths);
      setFilteredPaths(mappedPaths);

      // No longer need singular activeEnrollment tracking

    } catch (error) {
      console.error("Failed to fetch learning path data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let results = learningPaths;
    
    if (searchQuery) {
      results = results.filter(path =>
        path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        path.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        path.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'All') {
      results = results.filter(path => path.category === selectedCategory);
    }
    
    if (selectedDifficulty !== 'All') {
      results = results.filter(path => path.difficulty === selectedDifficulty);
    }
    
    setFilteredPaths(results);
  }, [searchQuery, selectedCategory, selectedDifficulty, learningPaths]);

  const categories = ['All', ...new Set(learningPaths.map(path => path.category))];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const handleEnroll = async (pathId) => {
    try {
      await enrollmentService.enrollInPath(pathId);
      Swal.fire({
        icon: 'success',
        title: 'Enrolled!',
        text: 'You have successfully enrolled in this learning path.',
        timer: 2000,
        showConfirmButton: false
      });
      fetchData();
    } catch (error) {
      console.error("Enrollment failed:", error);
      Swal.fire({
        icon: 'error',
        title: 'Enrollment Failed',
        text: error.response?.data?.message || 'Could not enroll in this path. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 via-background to-background pt-12 pb-8 border-b border-border/40">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-foreground/90">Path Discovery</h1>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Elevate your career with curated learning journeys. Master new industry-standard skills today.
              </p>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex bg-muted p-1 rounded-xl border border-border">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <List className="h-5 w-5" />
                  </button>
               </div>
               <Button 
                variant="outline" 
                className={`gap-2 rounded-xl transition-all h-11 ${showFilters ? 'bg-primary/10 border-primary text-primary' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
               >
                 <SlidersHorizontal className="h-4 w-4" />
                 {showFilters ? 'Hide Filters' : 'Filters'}
               </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Top Control Bar */}
        <div className="py-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
             <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                   placeholder="Search paths, categories, or skills..."
                   className="h-14 pl-12 pr-4 bg-card border-border rounded-2xl text-lg shadow-sm focus-visible:ring-primary"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             
             <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                {categories.slice(0, 5).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all border ${
                      selectedCategory === cat 
                        ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20' 
                        : 'bg-card border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>

          {/* Expanded Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-card border border-border rounded-3xl p-8 mt-4 grid grid-cols-1 md:grid-cols-3 gap-10 shadow-xl border-t-4 border-t-primary">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Expertise Level</h4>
                       <div className="flex flex-wrap gap-2">
                          {difficulties.map(diff => (
                            <button
                              key={diff}
                              onClick={() => setSelectedDifficulty(diff)}
                              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                selectedDifficulty === diff 
                                  ? 'bg-primary/10 text-primary border border-primary/20' 
                                  : 'hover:bg-muted text-muted-foreground'
                              }`}
                            >
                              {diff}
                            </button>
                          ))}
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">All Categories</h4>
                       <div className="grid grid-cols-2 gap-2">
                          {categories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              className={`text-left px-3 py-1.5 rounded-lg text-sm transition-all ${
                                selectedCategory === cat 
                                  ? 'bg-primary/10 text-primary font-bold' 
                                  : 'text-muted-foreground hover:bg-muted'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="flex flex-col justify-end gap-3">
                       <Button 
                        variant="secondary" 
                        className="w-full h-12 rounded-xl font-bold gap-2 group"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('All');
                          setSelectedDifficulty('All');
                        }}
                       >
                         <X className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                         Reset All Filters
                       </Button>
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count and List */}
        <div className="mt-4">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black tracking-tight mb-1 uppercase text-muted-foreground/60">Professional Catalog</h2>
                <p className="text-sm text-muted-foreground font-medium">
                  We found {filteredPaths.length} paths tailored for your profile.
                </p>
              </div>
           </div>

           {loading ? (
             <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 gap-8' : 'grid-cols-1 gap-6'}`}>
               {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="bg-card rounded-3xl border border-border p-8 h-80 animate-pulse shadow-sm" />
               ))}
             </div>
           ) : filteredPaths.length === 0 ? (
              <div className="text-center py-32 bg-card rounded-[3rem] border border-dashed border-border">
                <div className="w-24 h-24 mx-auto mb-8 rounded-[2rem] bg-muted/50 flex items-center justify-center text-muted-foreground">
                  <Search className="h-12 w-12" />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tight">No results matched your filter</h3>
                <p className="text-muted-foreground max-w-sm mx-auto text-lg mb-10 leading-relaxed font-medium">
                  We couldn't find any learning paths matching those specific criteria.
                </p>
                <Button 
                   onClick={() => {
                     setSearchQuery('');
                     setSelectedCategory('All');
                     setSelectedDifficulty('All');
                   }}
                   className="rounded-2xl px-10 h-14 font-black text-sm uppercase tracking-widest"
                >
                  Clear all search parameters
                </Button>
              </div>
           ) : (
             <LearningPathsList 
               learningPaths={filteredPaths}
               onEnroll={handleEnroll}
               viewMode={viewMode}
             />
           )}
        </div>
      </div>
    </div>
  );
};

export default LearningPaths;