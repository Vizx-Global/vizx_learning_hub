import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, Award, Users, TrendingUp, Sparkles, ArrowRight, CheckCircle2, Star, ChevronRight, BookOpen, Gamepad2, Trophy, Zap } from "lucide-react";
import Button from "../../../components/ui/Button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [currentMetric, setCurrentMetric] = useState(0);
  const navigate = useNavigate();

  const metrics = [
    { number: "100+", label: "Active Learners", icon: Users, color: "blue-500" },
    { number: "50+", label: "Learning Paths", icon: BookOpen, color: "green-500" },
    { number: "98%", label: "Satisfaction Rate", icon: Star, color: "yellow-500" },
    { number: "24/7", label: "Support Available", icon: Zap, color: "purple-500" }
  ];

  const features = [
    { text: "Interactive Video Lessons", icon: PlayCircle },
    { text: "Gamified Learning Experience", icon: Gamepad2 },
    { text: "Real-time Progress Tracking", icon: TrendingUp },
    { text: "Industry Recognized Certificates", icon: Award },
    { text: "Streak Challenges & Leaderboards", icon: Trophy },
    { text: "AI-Powered Learning Assistant", icon: Sparkles }
  ];

  const learningPaths = [
    { title: "AI & Prompt Engineering", category: "Technology", students: "50+", color: "from-purple-500 to-pink-500" },
    { title: "Business Process Outsourcing", category: "Business", students: "100++", color: "from-blue-500 to-cyan-500" },
    { title: "Call Center Excellence", category: "Customer Service", students: "50++", color: "from-orange-500 to-red-500" },
    { title: "Data Analytics Fundamentals", category: "Analytics", students: "10+", color: "from-green-500 to-emerald-500" }
  ];

  useEffect(() => {
    const interval = setInterval(() => setCurrentMetric((prev) => (prev + 1) % metrics.length), 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => navigate("/register");
  const handleExploreCourses = () => navigate("/browse");

  const getColorClass = (color) => ({
    "blue-500": "bg-blue-500/10 text-blue-500",
    "green-500": "bg-green-500/10 text-green-500",
    "yellow-500": "bg-yellow-500/10 text-yellow-500",
    "purple-500": "bg-purple-500/10 text-purple-500"
  })[color] || "bg-primary/10 text-primary";

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 dark:to-gray-900/30 pt-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-60 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-1/3 w-60 h-60 bg-ring/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] opacity-5"></div>
      </div>
      <div className="container relative mx-auto px-4 lg:px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-accent/30">
                <Sparkles className="w-4 h-4 text-accent-foreground" /><span className="text-sm font-medium text-accent-foreground">Vizx Learning Hub</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">Master <span className="text-gradient bg-gradient-to-r from-primary to-ring">In-Demand Skills</span><br /><span className="relative">with Interactive <span className="relative">Learning<div className="absolute -bottom-2 left-0 right-0 h-3 bg-primary/20 -rotate-1"></div></span></span></h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl">Join thousands of professionals advancing their careers with our immersive AI-driven learning platform. Experience education reimagined with gamification, real-time feedback, and personalized pathways.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-3">
              {features.map((feature, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 * index }} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" /><span className="text-foreground font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleGetStarted} className="group px-8 py-3 text-lg font-semibold rounded-xl bg-primary hover:bg-ring text-primary-foreground transition-all duration-300 hover:shadow-xl hover:shadow-primary/25">Start Learning Free<ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></Button>
              <Button onClick={handleExploreCourses} variant="outline" className="px-8 py-3 text-lg font-semibold rounded-xl border-2 border-primary/30 hover:border-primary hover:bg-primary/10"><PlayCircle className="mr-2 w-5 h-5" />Explore Courses</Button>
            </motion.div>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute -top-6 -left-6 lg:-top-12 lg:-left-12 z-10">
              <div className="relative bg-card rounded-2xl shadow-2xl border border-border p-6 w-64">
                <AnimatePresence mode="wait">
                  <motion.div key={currentMetric} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className={`p-2 rounded-lg ${getColorClass(metrics[currentMetric].color).split(' ')[0]}`}>
                        <div className={`w-6 h-6 ${getColorClass(metrics[currentMetric].color).split(' ')[1]}`}>
                          {metrics[currentMetric].icon === Users && <Users className="w-6 h-6" />}
                          {metrics[currentMetric].icon === BookOpen && <BookOpen className="w-6 h-6" />}
                          {metrics[currentMetric].icon === Star && <Star className="w-6 h-6" />}
                          {metrics[currentMetric].icon === Zap && <Zap className="w-6 h-6" />}
                        </div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-foreground">{metrics[currentMetric].number}</div><div className="text-sm text-muted-foreground">{metrics[currentMetric].label}</div>
                  </motion.div>
                </AnimatePresence>
                <div className="flex justify-center mt-4 space-x-1">
                  {metrics.map((_, index) => (
                    <button key={index} onClick={() => setCurrentMetric(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentMetric ? "bg-primary w-4" : "bg-muted-foreground/30"}`} />
                  ))}
                </div>
              </div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.3 }} className="relative rounded-3xl overflow-hidden shadow-2xl border border-border bg-gradient-to-br from-card to-popover">
              <div className="aspect-[4/3] relative"><img src="https://res.cloudinary.com/dtrad03yv/image/upload/v1758214719/rpo-improvement_lokryy.jpg" alt="RPO Improvement" className="w-full h-full object-cover" /></div>
              <div className="hidden lg:block absolute -bottom-6 -right-6 lg:-bottom-12 lg:-right-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-card rounded-2xl shadow-2xl border border-border p-4 w-64">
                  <h3 className="font-semibold text-foreground mb-3">Popular Learning Paths</h3>
                  <div className="space-y-3">
                    {learningPaths.map((path, index) => (
                      <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer group" onClick={() => navigate(`/category/${path.category.toLowerCase()}`)}>
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${path.color}`}></div>
                        <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{path.title}</p><p className="text-xs text-muted-foreground">{path.students} students</p></div><ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="mt-8 lg:mt-12">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { value: "4.9/5", label: "Platform Rating", icon: Star },
                  { value: "50+", label: "Hours of Content", icon: PlayCircle },
                  { value: "89%", label: "Career Advancement", icon: TrendingUp },
                  { value: "20+", label: "Expert Instructors", icon: Users }
                ].map((stat, index) => (
                  <div key={index} className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-4 h-4 text-primary">
                        {stat.icon === Star && <Star className="w-4 h-4" />}
                        {stat.icon === PlayCircle && <PlayCircle className="w-4 h-4" />}
                        {stat.icon === TrendingUp && <TrendingUp className="w-4 h-4" />}
                        {stat.icon === Users && <Users className="w-4 h-4" />}
                      </div>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-20 left-10 animate-float"><div className="w-6 h-6 rounded-full bg-primary/20"></div></div>
      <div className="absolute top-40 right-20 animate-float-delayed"><div className="w-8 h-8 rounded-full bg-ring/20"></div></div>
    </section>
  );
};

export default HeroSection;