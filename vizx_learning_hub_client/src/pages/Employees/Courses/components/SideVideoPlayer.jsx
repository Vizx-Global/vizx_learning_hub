import React, { useState, useEffect } from 'react';
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
  Download,
  Target,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  MessageSquare,
  FileText,
  Info,
  CheckCircle2,
  ListVideo,
  Menu,
  BookMarked,
  ShieldCheck,
  Zap,
  HelpCircle,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import quizService from '../../../../api/quizService';
import moduleProgressService from '../../../../api/moduleProgressService';
import Swal from 'sweetalert2';
import { Button } from '../../../../components/ui/Button';
import { Progress } from '../../../../components/ui/Progress';
import { cn } from '../../../../utils/cn';

const SideVideoPlayer = ({ module, allModules = [], onClose, onSelectModule }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [moduleProgress, setModuleProgress] = useState(null);
  const [enrollmentSummary, setEnrollmentSummary] = useState([]);

  useEffect(() => {
    const handleScroll = (e) => {
      if (e.target.scrollTop > 50) setIsScrolled(true);
      else setIsScrolled(false);
    };
    const contentArea = document.getElementById('learning-content-area');
    if (contentArea) contentArea.addEventListener('scroll', handleScroll);
    return () => contentArea?.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!module?.id) return;
      setQuizLoading(true);
      try {
        const response = await quizService.getQuizByModuleId(module.id);
        if (response.data?.success && response.data.data) {
          setQuiz(response.data.data);
          setQuizCompleted(false);
          setQuizResults(null);
        } else {
          setQuiz(null);
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setQuiz(null);
      } finally {
        setQuizLoading(false);
      }
    };
    fetchQuiz();

    const fetchProgress = async () => {
      if (!module?.id) return;
      try {
        const response = await moduleProgressService.getModuleProgressByModuleId(module.id);
        if (response.data?.success) {
          setModuleProgress(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching progress:', err);
      }
    };
    fetchProgress();

    const fetchSummary = async () => {
      const enrollmentId = moduleProgress?.enrollmentId || module.enrollmentId;
      if (!enrollmentId) return;
      try {
        const response = await moduleProgressService.getProgressSummary(enrollmentId);
        if (response.data?.success) {
          setEnrollmentSummary(response.data.data.modules || []);
        }
      } catch (err) {
        console.error('Error fetching summary:', err);
      }
    };
    fetchSummary();
  }, [module?.id, moduleProgress?.enrollmentId]);

  const handleCompleteModule = async () => {
    try {
      const enrollmentId = moduleProgress?.enrollmentId || module.enrollmentId;
      if (enrollmentId) {
        await moduleProgressService.markModuleComplete(enrollmentId, module.id);
      }
      
      if (nextModule) {
        onSelectModule(nextModule);
      } else {
        onClose();
        Swal.fire({
          title: 'Pathway Completed!',
          text: 'Great job! You have reached the end of this learning path.',
          icon: 'success',
          confirmButtonText: 'View More Courses',
          confirmButtonColor: '#3085d6',
        });
      }
    } catch (err) {
      console.error('Error completing module:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to complete module. Please try again.';
      
      Swal.fire({
        title: 'Prerequisite Required',
        text: errorMessage,
        icon: 'warning',
        confirmButtonColor: '#3085d6',
      });
    }
  };

  if (!module) return null;

  const currentModuleIndex = allModules.findIndex(m => m.id === module.id);
  const nextModule = allModules[currentModuleIndex + 1];
  const prevModule = allModules[currentModuleIndex - 1];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col lg:flex-row overflow-hidden font-sans"
    >
      {/* 
        MAIN CONTENT AREA (LEFT/CENTER)
      */}
      <div className="flex-1 flex flex-col relative bg-background h-full overflow-hidden">
        
        {/* Cinematic Header (Float/Sticky) */}
        <div className={cn(
          "absolute top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300",
          (isScrolled || !module.videoUrl) ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm" : "bg-gradient-to-b from-black/60 to-transparent text-white"
        )}>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className={cn(
                "rounded-full transition-all",
                (isScrolled || !module.videoUrl) ? "hover:bg-muted" : "bg-white/10 hover:bg-white/20 text-white"
              )}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-sm font-black tracking-tight leading-none uppercase">{module.title}</h1>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">
                {module.category || 'Professional Training'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                <Zap className="h-3.5 w-3.5 text-primary fill-current" />
                <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Deep Focus Mode</span>
             </div>
             <Button 
               variant="ghost" 
               size="icon" 
               className="lg:hidden"
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             >
                <Menu className="h-5 w-5" />
             </Button>
          </div>
        </div>

        {/* Video / Content Display */}
        <div id="learning-content-area" className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pt-0">
          
          {/* Hero Player Area */}
          <div className="relative aspect-video w-full bg-[#050505] overflow-hidden">
            {module.videoUrl ? (
              <video
                src={module.videoUrl}
                poster={module.thumbnailUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                 <div className="relative">
                   <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                   <div className="relative w-24 h-24 bg-primary/10 rounded-3xl border border-primary/20 flex items-center justify-center animate-pulse">
                      <Play className="h-10 w-10 text-primary fill-current" />
                   </div>
                 </div>
                 <div className="text-center">
                    <h2 className="text-white text-xl font-black uppercase tracking-tight">Establishing Connection</h2>
                    <p className="text-white/40 text-sm font-medium italic mt-1">Preparing your cinematic learning environment...</p>
                 </div>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">
            
            {/* Tab Navigation */}
            <div className="flex border-b border-border/60 mb-10 gap-10">
               {['overview', 'resources', 'discussion', 'notes', ...(quiz ? ['quiz'] : [])].map((tab) => (
                 <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
                    activeTab === tab 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                 >
                   {tab}
                   {activeTab === tab && (
                     <motion.div 
                       layoutId="activeTabUnderline"
                       className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
                     />
                   )}
                 </button>
               ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                     <div className="md:col-span-3 space-y-6">
                        <h2 className="text-3xl font-black tracking-tighter text-foreground/90 uppercase">{module.title}</h2>
                        <p className="text-muted-foreground leading-relaxed text-lg font-medium opacity-80">
                          {module.description || "This course delivers a high-impact learning experience focused on mastering practical industry tools. Engage with the content to unlock new cognitive potential and professional mastery."}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                           {module.learningObjectives?.map((obj, i) => (
                             <div key={i} className="flex gap-4 p-5 rounded-2xl bg-muted/30 border border-border/40 group hover:border-primary/40 transition-all">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                                   <CheckCircle2 className="h-3.5 w-3.5 text-primary group-hover:text-white" />
                                </div>
                                <p className="text-sm font-bold opacity-80 leading-snug">{obj}</p>
                             </div>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Module Stats</h4>
                           <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-tighter">Time</span>
                                 </div>
                                 <span className="text-xs font-black">{module.estimatedMinutes} M</span>
                              </div>
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2 text-muted-foreground">
                                    <Award className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-tighter">XP Value</span>
                                 </div>
                                 <span className="text-xs font-black text-warning">{module.completionPoints} XP</span>
                              </div>
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2 text-muted-foreground">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-tighter">Level</span>
                                 </div>
                                 <span className="text-xs font-black text-success">{module.difficulty}</span>
                              </div>
                           </div>
                           <Button className="w-full mt-4 rounded-xl font-black text-[10px] uppercase tracking-widest h-12 shadow-lg shadow-primary/20">
                              Claim Achievement
                           </Button>
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'resources' && (
                <motion.div
                  key="resources"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {module.resources?.length > 0 ? module.resources.map((res, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-card border border-border group hover:border-primary/50 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="p-4 rounded-xl bg-blue-500/5 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                             <FileText className="h-6 w-6" />
                          </div>
                          <div>
                             <p className="font-black text-sm uppercase tracking-tight">{res.name || 'Master Resource'}</p>
                             <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{res.type || 'DOCUMENT (PDF)'}</p>
                          </div>
                       </div>
                       <Button variant="ghost" size="icon" className="rounded-xl">
                          <Download className="h-5 w-5" />
                       </Button>
                    </div>
                  )) : (
                    <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-border rounded-3xl">
                       <p className="text-muted-foreground font-black uppercase tracking-widest text-sm opacity-40">No external resources attached</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'discussion' && (
                <motion.div key="discussion" className="py-20 text-center space-y-6">
                   <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto opacity-30">
                      <MessageSquare className="h-10 w-10" />
                   </div>
                   <h3 className="text-xl font-black uppercase tracking-tighter">Pathway Collaboration</h3>
                   <p className="text-muted-foreground max-w-sm mx-auto">This community feature is being prepared across the Vizx Network. Stay tuned.</p>
                </motion.div>
              )}

              {activeTab === 'quiz' && quiz && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-3xl mx-auto"
                >
                  {!quizResults ? (
                    <QuizViewer 
                      quiz={quiz} 
                      onComplete={async (answers) => {
                        try {
                          const enrollmentId = moduleProgress?.enrollmentId || module.enrollmentId; 
                          if (!enrollmentId) {
                            throw new Error('Enrollment session not found. Please re-open the module.');
                          }
                          const response = await quizService.submitQuizAttempt(quiz.id, {
                            enrollmentId,
                            answers
                          });
                          if (response.data.success) {
                            setQuizResults(response.data.data);
                            if (response.data.data.passed) {
                              setQuizCompleted(true);
                              // Refetch summary to update sidebar
                              const enrollmentId = moduleProgress?.enrollmentId || module.enrollmentId;
                              if (enrollmentId) {
                                moduleProgressService.getProgressSummary(enrollmentId).then(res => {
                                  if (res.data?.success) setEnrollmentSummary(res.data.data.modules || []);
                                });
                              }
                              Swal.fire({
                                title: 'Congratulations!',
                                text: `You passed the quiz with ${response.data.data.percentage}%!`,
                                icon: 'success',
                                confirmButtonColor: '#32cd32'
                              });
                            } else {
                              Swal.fire({
                                title: 'Not quite there',
                                text: `You scored ${response.data.data.percentage}%. You need ${quiz.passingScore}% to pass.`,
                                icon: 'warning',
                                confirmButtonColor: '#ffcc00'
                              });
                            }
                          }
                        } catch (err) {
                          console.error('Error submitting quiz:', err);
                          Swal.fire('Error', 'Failed to submit quiz. Please try again.', 'error');
                        }
                      }}
                    />
                  ) : (
                    <div className="space-y-8 bg-card p-8 rounded-3xl border border-border shadow-xl">
                      <div className="text-center space-y-4">
                        <div className={cn(
                          "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
                          quizResults.passed ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                        )}>
                          {quizResults.passed ? <Award className="h-10 w-10" /> : <TrendingUp className="h-10 w-10" />}
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight">
                          {quizResults.passed ? "Examination Passed" : "Keep Evolving"}
                        </h3>
                        <p className="text-muted-foreground font-medium italic">
                          {quizResults.passed 
                            ? "You have demonstrated cognitive mastery of this module." 
                            : "You're getting closer. Review the content and try again."}
                        </p>
                        
                        <div className="flex justify-center gap-12 py-6">
                           <div className="text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Your Score</p>
                              <p className="text-3xl font-black text-primary">{quizResults.percentage}%</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">XP Earned</p>
                              <p className="text-3xl font-black text-warning">+{quizResults.passed ? quizResults.score : 0}</p>
                           </div>
                        </div>

                        {!quizResults.passed && (
                          <Button 
                            variant="outline" 
                            className="rounded-xl font-black uppercase tracking-widest gap-2"
                            onClick={() => setQuizResults(null)}
                          >
                            <RotateCcw className="h-4 w-4" /> Retake Quiz
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Floating Mini Player Footer */}
        <div className="p-4 bg-background border-t border-border flex items-center justify-between gap-6 relative z-50">
           <div className="flex items-center gap-4 flex-1">
              <Button 
                variant="outline" 
                onClick={() => onSelectModule(prevModule)}
                disabled={!prevModule}
                className="rounded-xl h-12 px-6 font-black text-[10px] uppercase tracking-widest"
              >
                 <ChevronLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
              <div className="hidden sm:flex flex-col">
                 <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Next Evolution</span>
                 <span className="text-xs font-bold truncate max-w-[200px]">{nextModule?.title || "Complete Pathway"}</span>
              </div>
           </div>

           <Button 
             onClick={handleCompleteModule}
             className="rounded-xl h-14 px-10 font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-primary/30 gap-2 group"
           >
              {nextModule ? "Finish & Continue" : "Complete Pathway"}
              <ChevronRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
           </Button>
        </div>
      </div>

      {/* 
        CURRICULUM SIDEBAR (RIGHT)
      */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: '100%', width: 0 }}
            animate={{ x: 0, width: 380 }}
            exit={{ x: '100%', width: 0 }}
            className="hidden lg:flex flex-col bg-card border-l border-border h-full overflow-hidden shadow-[-10px_0_30px_rgba(0,0,0,0.05)]"
          >
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
               <div>
                  <h3 className="text-sm font-black uppercase tracking-tight">Pathway Catalog</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">
                    {allModules.length} Modules in total
                  </p>
               </div>
               <div className="p-2 bg-background rounded-lg border border-border shadow-sm">
                  <ListVideo className="h-4 w-4 text-primary" />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-4 px-2 space-y-1">
               {allModules.map((m, idx) => {
                 const isActive = m.id === module.id;
                 const summaryItem = enrollmentSummary.find(s => s.moduleId === m.id);
                 const isCompleted = summaryItem?.status === 'COMPLETED';
                 return (
                   <button
                    key={m.id}
                    onClick={() => onSelectModule(m)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl transition-all group flex gap-4",
                      isActive 
                        ? "bg-primary text-white shadow-xl shadow-primary/20" 
                        : "hover:bg-muted"
                    )}
                   >
                     <div className={cn(
                       "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all shadow-sm",
                       isActive ? "bg-white/20 text-white" : "bg-card border border-border group-hover:border-primary/50"
                     )}>
                        {idx + 1}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <span className={cn(
                             "text-[9px] font-black uppercase tracking-widest",
                             isActive ? "text-white/70" : "text-primary"
                           )}>
                             Module {idx + 1}
                           </span>
                           {isCompleted && <CheckCircle2 className="h-3 w-3 text-success" />}
                        </div>
                        <h4 className={cn(
                          "text-xs font-black tracking-tight truncate",
                          isActive ? "text-white" : "text-foreground"
                        )}>
                          {m.title}
                        </h4>
                        
                        {m.contentType === 'QUIZ' && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={cn(
                              "text-[8px] font-black uppercase px-1.5 py-0.5 rounded",
                              isActive 
                                ? "bg-white/20 text-white" 
                                : isCompleted 
                                  ? "bg-success/10 text-success" 
                                  : "bg-warning/10 text-warning"
                            )}>
                              {isCompleted ? 'Quiz Passed' : summaryItem?.progress?.attempts > 0 ? 'Quiz Failed' : 'Quiz Required'}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-1.5">
                           <div className="flex items-center gap-1 opacity-60">
                              <Clock className="h-2.5 w-2.5" />
                              <span className="text-[9px] font-bold">{m.estimatedMinutes}M</span>
                           </div>
                           <div className="flex items-center gap-1 opacity-60">
                              <Award className="h-2.5 w-2.5" />
                              <span className="text-[9px] font-bold">{m.completionPoints}XP</span>
                           </div>
                        </div>
                     </div>
                   </button>
                 );
               })}
            </div>

            <div className="p-6 bg-muted/20 border-t border-border">
               <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                     <BookMarked className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Certified Outcome</p>
                     <p className="text-xs font-bold">Vizx Recognition</p>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

const QuizViewer = ({ quiz, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const questions = quiz.questions || [];

  const handleAnswerSelect = (optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-2xl">
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-muted">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="p-8 lg:p-12 space-y-10">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Time Remaining: --:--</span>
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-2xl font-black leading-tight tracking-tighter text-foreground/90 uppercase">
            {currentQuestion?.text}
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion?.options?.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                className={cn(
                  "flex items-center gap-5 p-6 rounded-2xl border-2 text-left transition-all group",
                  answers[currentQuestionIndex] === idx
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-all",
                  answers[currentQuestionIndex] === idx
                    ? "bg-primary text-white"
                    : "bg-muted group-hover:bg-primary/20 text-muted-foreground group-hover:text-primary"
                )}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="font-bold text-sm tracking-tight opacity-80">{option}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-border/60">
          <Button
            variant="ghost"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            className="rounded-xl font-black uppercase tracking-widest gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>

          {isLastQuestion ? (
            <Button
              disabled={Object.keys(answers).length < questions.length}
              onClick={() => onComplete(answers)}
              className="rounded-xl h-14 px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20"
            >
              Submit Examination
            </Button>
          ) : (
            <Button
              disabled={answers[currentQuestionIndex] === undefined}
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              className="rounded-xl h-14 px-10 font-black uppercase tracking-widest gap-2"
            >
              Next Question <ChevronRightIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SideVideoPlayer;
