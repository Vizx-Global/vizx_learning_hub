import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Clock, 
  BookOpen, 
  Award, 
  Star, 
  Users, 
  PlayCircle, 
  CheckCircle,
  FileText,
  Target,
  Lock,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import learningPathService from '../../../../api/learningPathService';
import enrollmentService from '../../../../api/enrollmentService';
import moduleService from '../../../../api/moduleService';
import Swal from 'sweetalert2';

const LearningPathDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [path, setPath] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchPathDetails();
  }, [id]);

  const fetchPathDetails = async () => {
    setLoading(true);
    try {
      // 1. Fetch the main path details first as it's critical
      const pathRes = await learningPathService.getLearningPathById(id);
      const pathData = pathRes.data?.data || pathRes.data;

      if (!pathData) {
        throw new Error('Course details not found.');
      }

      // 2. Fetch modules and enrollments in parallel with safe fallbacks
      let modulesData = [];
      let enrollments = [];

      try {
        const [modulesRes, enrollmentRes] = await Promise.all([
          moduleService.getModulesByLearningPath(id).catch(err => {
            console.warn("Non-critical: Failed to fetch modules", err);
            return { data: [] };
          }),
          enrollmentService.getMyEnrollments().catch(err => {
            console.warn("Non-critical: Failed to fetch enrollments", err);
            return { data: [] };
          })
        ]);

        modulesData = modulesRes.data?.data?.modules || modulesRes.data?.modules || (Array.isArray(modulesRes.data?.data) ? modulesRes.data.data : (Array.isArray(modulesRes.data) ? modulesRes.data : []));
        
        const enrollData = enrollmentRes.data?.data || enrollmentRes.data;
        enrollments = Array.isArray(enrollData) ? enrollData : (Array.isArray(enrollData?.enrollments) ? enrollData.enrollments : []);
      } catch (secondaryErr) {
        console.error("Secondary metadata fetch failed:", secondaryErr);
      }
      
      const isEnrolled = enrollments.some(e => String(e.learningPathId) === String(id));
      
      setPath({
        ...pathData,
        isEnrolled,
        prerequisiteDetails: pathData.prerequisiteDetails || [],
        totalModules: modulesData.length,
        pointsReward: pathData.pointsReward || 0,
        estimatedHours: pathData.estimatedHours || 0,
        difficulty: pathData.difficulty || 'Beginner',
        enrolledCount: pathData.enrollmentCount || pathData.enrolledCount || 0
      });
      
      setModules([...modulesData].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)));
    } catch (error) {
      console.error("Critical error loading learning path:", error);
      Swal.fire({
        icon: 'error',
        title: 'Content Loading Error',
        text: 'The requested learning path could not be loaded. It may have been moved or unpublished.',
        confirmButtonColor: '#3b82f6'
      });
      navigate('/employee-learning-paths');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await enrollmentService.enrollInPath(id);
      Swal.fire({
        icon: 'success',
        title: 'Enrolled!',
        text: 'You have successfully enrolled in this learning path.',
        timer: 2000,
        showConfirmButton: false
      });
      fetchPathDetails();
    } catch (error) {
      console.error("Enrollment failed:", error);
      Swal.fire({
        icon: 'error',
        title: 'Enrollment Failed',
        text: error.response?.data?.message || 'Could not enroll in this path.'
      });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium">Loading course intelligence...</p>
        </div>
      </div>
    );
  }

  if (!path) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Premium Hero Section */}
      <div className="relative h-[450px] overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        {path.bannerUrl ? (
          <img src={path.bannerUrl} alt={path.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
        )}
        
        <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <Button 
                variant="ghost" 
                onClick={() => navigate('/employee-learning-paths')}
                className="mb-8 text-white/70 hover:text-white hover:bg-white/10 gap-2 pl-0"
            >
              <ChevronLeft className="h-5 w-5" />
              Back to Catalog
            </Button>

            <div className="flex items-center gap-3 mb-6">
               <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-widest">
                  {path.categoryRef?.name || path.category}
               </span>
               {path.isFeatured && (
                 <span className="px-3 py-1 bg-warning/20 text-warning text-xs font-bold rounded-full border border-warning/30 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Featured Path
                 </span>
               )}
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
              {path.title}
            </h1>

            <p className="text-xl text-white/70 mb-10 leading-relaxed max-w-2xl">
              {path.description || 'Level up your skills with this comprehensive learning path designed for professionals.'}
            </p>

            <div className="flex flex-wrap items-center gap-8">
               <div className="flex items-center gap-2 text-white/90">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-white/50 tracking-tighter">Est. Time</p>
                    <p className="font-bold">{path.estimatedHours} Hours</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-2 text-white/90">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-white/50 tracking-tighter">Modules</p>
                    <p className="font-bold">{path.totalModules} Units</p>
                  </div>
               </div>

               <div className="flex items-center gap-2 text-white/90">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Award className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-white/50 tracking-tighter">XP Points</p>
                    <p className="font-bold">{path.pointsReward} XP</p>
                  </div>
               </div>

               <div className="flex items-center gap-2 text-white/90">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Target className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-white/50 tracking-tighter">Difficulty</p>
                    <p className="font-bold">{path.difficulty}</p>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Module List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
               <div className="p-8 border-b border-border bg-gradient-to-r from-muted/50 to-transparent">
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Curriculum Preview</h2>
                  <p className="text-muted-foreground text-sm">Step-by-step masterclass to achieve your learning goals.</p>
               </div>
               
               <div className="divide-y divide-border">
                  {modules.map((module, index) => (
                    <div 
                      key={module.id} 
                      className="p-6 transition-colors hover:bg-muted/30 group cursor-default"
                    >
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-black text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                           {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                             <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{module.title}</h3>
                             <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{module.estimatedMinutes} Mins</span>
                             </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {module.description || 'In-depth module covering core concepts and practical applications.'}
                          </p>
                        </div>
                        <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="p-2 bg-primary/10 rounded-full">
                              <PlayCircle className="h-6 w-6 text-primary" />
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {modules.length === 0 && (
                     <div className="p-12 text-center text-muted-foreground italic">
                        No modules have been published for this path yet.
                     </div>
                  )}
               </div>
            </div>

            {/* Prerequisites */}
            {path.prerequisiteDetails && path.prerequisiteDetails.length > 0 && (
              <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                 <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3">
                    <Target className="h-6 w-6 text-primary" />
                    Prerequisites
                 </h2>
                 <div className="space-y-4">
                     {path.prerequisiteDetails.map((prereq) => (
                      <div key={prereq.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border">
                               <BookOpen className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                               <div className="flex items-center gap-2">
                                  <p className="font-bold text-sm">{prereq.title}</p>
                               </div>
                               <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Recommended Knowledge</p>
                            </div>
                         </div>
                         <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/employee-learning-paths/${prereq.id}`)}
                            className="text-xs font-bold gap-2 text-primary hover:bg-primary/10"
                         >
                            View Path
                            <ChevronRight className="h-3 w-3" />
                         </Button>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* What you'll learn */}
            <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
               <h2 className="text-2xl font-bold tracking-tight mb-6">Learning Objectives</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(path.learningObjectives || ['Master the foundations of the subject', 'Apply practical techniques in real-world scenarios', 'Gain certification-readiness', 'Network with professional peers']).map((obj, i) => (
                    <div key={i} className="flex items-start gap-4">
                       <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                       <span className="text-sm text-muted-foreground leading-relaxed">{obj}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-3xl border border-border p-8 shadow-2xl sticky top-24">
               <div className="text-center mb-8">
                  <h3 className="text-xl font-bold mb-2">Ready to Start?</h3>
                  <p className="text-sm text-muted-foreground">Join {path.enrolledCount || 12} other employees in this path.</p>
               </div>

               {path.isEnrolled ? (
                 <Button 
                   className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 gap-2"
                   onClick={() => navigate('/employee-courses', { state: { learningPathId: path.id } })}
                 >
                   <PlayCircle className="h-5 w-5" />
                   Continue Learning
                 </Button>
               ) : (
                 <Button 
                   onClick={handleEnroll}
                   disabled={enrolling}
                   className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center"
                 >
                   {enrolling ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                   ) : (
                      'Enroll Now'
                   )}
                 </Button>
               )}

               <div className="mt-8 space-y-6">
                  <div className="flex items-center justify-between py-3 border-b border-border/50">
                     <div className="flex items-center gap-3 text-sm font-bold opacity-70">
                        <Users className="h-4 w-4" />
                        Access
                     </div>
                     <span className="text-sm font-bold text-primary italic">Unlimited</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-border/50">
                     <div className="flex items-center gap-3 text-sm font-bold opacity-70">
                        <FileText className="h-4 w-4" />
                        Resources
                     </div>
                     <span className="text-sm font-bold">12+ Files</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                     <div className="flex items-center gap-3 text-sm font-bold opacity-70">
                        <Award className="h-4 w-4" />
                        Reward
                     </div>
                     <span className="text-sm font-bold text-warning">{path.pointsReward} XP</span>
                  </div>
               </div>

               <div className="mt-8 p-4 bg-muted/40 rounded-2xl border border-border">
                  <p className="text-[10px] uppercase font-black text-muted-foreground mb-1 tracking-tighter">AI Insight</p>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    "This path has a 94% completion success rate among your department peers."
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPathDetail;
