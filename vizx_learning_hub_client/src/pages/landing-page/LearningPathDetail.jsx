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
  ChevronRight,
  LogIn
} from 'lucide-react';
import Button from '../../components/ui/Button';
import learningPathService from '../../api/learningPathService';
import moduleService from '../../api/moduleService';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const PublicLearningPathDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [path, setPath] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPathDetails = async () => {
      setLoading(true);
      try {
        let pathData = null;
        try {
            const response = await learningPathService.getLearningPathById(id);
            pathData = response.data?.data || response.data;
        } catch (e) {
            const slugResponse = await learningPathService.getLearningPathBySlug(id);
            pathData = slugResponse.data?.data || slugResponse.data;
        }

        if (!pathData) throw new Error('Learning path not found');

        // Fetch modules
        let modulesData = [];
        try {
          const modulesRes = await moduleService.getModulesByLearningPath(pathData.id);
          modulesData = modulesRes.data?.data?.modules || modulesRes.data?.data || modulesRes.data?.modules || [];
        } catch (err) {
          console.warn("Failed to fetch modules", err);
        }

        setPath({
           ...pathData,
           learningObjectives: pathData.learningObjectives || [],
           totalModules: modulesData.length,
           pointsReward: pathData.pointsReward || 0,
           estimatedHours: pathData.estimatedHours || 0,
           difficulty: pathData.difficulty || 'Beginner',
           enrolledCount: pathData.enrollmentCount || pathData.enrolledCount || 0
        });
        
        setModules([...modulesData].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)));

      } catch (err) {
        console.error("Error fetching path:", err);
        setError("Could not load the learning path content.");
      } finally {
        setLoading(false);
      }
    };

    fetchPathDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black font-sans">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] pt-20">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !path) {
     return (
        <div className="min-h-screen bg-white dark:bg-black font-sans">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] pt-20 px-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Content Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "This learning path does not exist."}</p>
          <Button onClick={() => navigate('/')} className="bg-orange-500 text-white">Back to Home</Button>
        </div>
        <Footer />
      </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black font-sans selection:bg-orange-100 selection:text-orange-900">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 to-black z-10" />
          {path.bannerUrl ? (
             <img src={path.bannerUrl} alt={path.title} className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full bg-gray-900" />
          )}
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
             <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                  {path.category}
                </span>
                {path.isFeatured && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/30 flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> Featured
                  </span>
                )}
             </div>

             <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
               {path.title}
             </h1>
             
             <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
               {path.description}
             </p>

             <div className="flex flex-wrap gap-8 text-white/90">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/10 rounded-lg"><Clock size={20} className="text-orange-400" /></div>
                   <div>
                      <p className="text-[10px] uppercase font-bold text-white/40">Duration</p>
                      <p className="font-bold">{path.estimatedHours} Hours</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/10 rounded-lg"><BookOpen size={20} className="text-orange-400" /></div>
                   <div>
                      <p className="text-[10px] uppercase font-bold text-white/40">Modules</p>
                      <p className="font-bold">{path.totalModules}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/10 rounded-lg"><Award size={20} className="text-orange-400" /></div>
                   <div>
                      <p className="text-[10px] uppercase font-bold text-white/40">Reward</p>
                      <p className="font-bold">{path.pointsReward} XP</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/10 rounded-lg"><Target size={20} className="text-orange-400" /></div>
                   <div>
                      <p className="text-[10px] uppercase font-bold text-white/40">Level</p>
                      <p className="font-bold">{path.difficulty}</p>
                   </div>
                </div>
             </div>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 -mt-20 relative z-30 pb-20">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
               
               {/* Learning Objectives */}
               {path.learningObjectives && path.learningObjectives.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                      <div className="p-8 border-b border-gray-100 dark:border-gray-800">
                         <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What You'll Learn</h2>
                      </div>
                      <div className="p-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {path.learningObjectives.map((objective, idx) => (
                                  <div key={idx} className="flex items-start gap-3">
                                      <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={18} />
                                      <span className="text-gray-700 dark:text-gray-300">{objective}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
               )}

               {/* Modules List */}
               <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                  <div className="p-8 border-b border-gray-100 dark:border-gray-800">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Path Curriculum</h2>
                     <p className="text-gray-500 dark:text-gray-400 mt-1">What you will learn in this path</p>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                     {modules.map((module, idx) => (
                        <div key={module.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                           <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center font-bold text-orange-600 dark:text-orange-400 flex-shrink-0">
                                 {idx + 1}
                              </div>
                              <div className="flex-1">
                                 <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-bold text-gray-900 dark:text-white">{module.title}</h3>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                       {module.estimatedMinutes} mins
                                    </span>
                                 </div>
                                 <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {module.description}
                                 </p>
                              </div>
                              <div className="self-center">
                                 {isAdminOrEnrolled(isAuthenticated) ? (
                                     <div className="bg-green-100 text-green-700 p-2 rounded-full"><PlayCircle size={20} /></div>
                                 ) : (
                                     <div className="bg-gray-100 text-gray-400 p-2 rounded-full"><Target size={20} /></div>
                                 )}
                              </div>
                           </div>
                        </div>
                     ))}
                     {modules.length === 0 && (
                        <div className="p-8 text-center text-gray-500">No modules available yet.</div>
                     )}
                  </div>
               </div>

                {/* Prerequisites */}
                {path.prerequisiteDetails && path.prerequisiteDetails.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Prerequisites</h3>
                     <div className="space-y-4">
                        {path.prerequisiteDetails.map((prereq) => (
                           <div key={prereq.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                              <div className="flex items-center gap-4">
                                 <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                                    <BookOpen size={18} className="text-gray-500 dark:text-gray-300" />
                                 </div>
                                 <span className="font-semibold text-gray-900 dark:text-white">{prereq.title}</span>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/learning-paths/${prereq.id || prereq.slug}`)} className="text-orange-600 dark:text-orange-400">
                                 View <ChevronRight size={16} />
                              </Button>
                           </div>
                        ))}
                     </div>
                  </div>
                )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
               <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 sticky top-24">
                  <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Start Learning</h3>
                  <div className="text-center text-sm text-gray-500 mb-8">{path.enrolledCount} students enrolled</div>

                  {isAuthenticated ? (
                     <Button 
                       className="w-full py-4 text-base font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20"
                       onClick={() => navigate('/employee-learning-paths')} // Ideally direct enroll logic
                     >
                       Enroll Now
                     </Button>
                  ) : (
                     <Button 
                       className="w-full py-4 text-base font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                       onClick={() => navigate('/login', { state: { from: `/learning-paths/${id}` } })}
                     >
                        <LogIn size={20} /> Sign in to Enroll
                     </Button>
                  )}
                  
                  <div className="mt-8 space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 flex items-center gap-2"><Users size={16} /> Access</span>
                        <span className="font-bold text-gray-900 dark:text-white">Lifetime</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 flex items-center gap-2"><FileText size={16} /> Resources</span>
                        <span className="font-bold text-gray-900 dark:text-white">Included</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 flex items-center gap-2"><Award size={16} /> Certificate</span>
                        <span className="font-bold text-gray-900 dark:text-white">Yes</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
      <Footer />
    </div>
  );
};

// Helper to pretend check access for UI only
const isAdminOrEnrolled = (auth) => {
   return false; // For public page, usually they can't play until enrolled/logged in
};

export default PublicLearningPathDetail;
