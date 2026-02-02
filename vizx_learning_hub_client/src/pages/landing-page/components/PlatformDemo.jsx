import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, BookOpen, Users, BarChart3, Gamepad2, Trophy, MessageSquare, Shield, Zap, CheckCircle2, Sparkles, User, Settings, TrendingUp } from "lucide-react";

const PlatformDemo = () => {
  const [activeTab, setActiveTab] = useState("employee");
  const [activeStep, setActiveStep] = useState(0);

  const tabs = [
    { id: "employee", label: "For Employees", icon: User, description: "Learn, earn points, and grow your skills", color: "from-blue-500 to-cyan-500" },
    { id: "manager", label: "For Managers", icon: Users, description: "Track progress and manage learning", color: "from-purple-500 to-pink-500" },
    { id: "admin", label: "For Super Admins", icon: Settings, description: "Oversee entire learning ecosystem", color: "from-orange-500 to-red-500" }
  ];

  const employeeSteps = [
    { step: 1, title: "Browse & Enroll", description: "Explore learning paths and enroll in courses", icon: BookOpen, color: "bg-blue-500", features: ["Browse 500+ learning paths", "Filter by category & difficulty", "Enroll with one click"] },
    { step: 2, title: "Interactive Learning", description: "Learn through videos, documents, and hands-on exercises", icon: PlayCircle, color: "bg-green-500", features: ["Video lessons", "Step-by-step guides", "Reference documents", "Practical exercises"] },
    { step: 3, title: "Earn & Engage", description: "Complete quizzes, earn points, and maintain streaks", icon: Trophy, color: "bg-yellow-500", features: ["Quiz after each module", "Points system", "Daily streak tracking", "Leaderboard ranking"] },
    { step: 4, title: "Connect & Grow", description: "Collaborate with others and track your progress", icon: TrendingUp, color: "bg-purple-500", features: ["Streak partnerships", "Direct chat with admins", "Progress analytics", "Skill certificates"] }
  ];

  const managerSteps = [
    { step: 1, title: "Team Dashboard", description: "Monitor team learning progress and engagement", icon: Users, color: "bg-purple-500", features: ["Real-time progress tracking", "Department analytics", "Skill gap analysis"] },
    { step: 2, title: "Content Management", description: "Create and manage learning paths for your department", icon: BookOpen, color: "bg-blue-500", features: ["Create custom paths", "Upload course content", "Set learning objectives"] },
    { step: 3, title: "Engagement Tools", description: "Manage games, challenges, and rewards", icon: Gamepad2, color: "bg-green-500", features: ["Setup trivia games", "Manage points system", "Track leaderboards"] },
    { step: 4, title: "Approvals & Reports", description: "Approve requests and generate insights", icon: BarChart3, color: "bg-orange-500", features: ["Department approvals", "Performance reports", "ROI analytics"] }
  ];

  const adminSteps = [
    { step: 1, title: "Platform Overview", description: "Monitor entire organization's learning activities", icon: BarChart3, color: "bg-orange-500", features: ["Platform-wide analytics", "System health monitoring", "User activity tracking"] },
    { step: 2, title: "User Management", description: "Manage all users, roles, and permissions", icon: Users, color: "bg-blue-500", features: ["User role management", "Department setup", "Bulk user operations"] },
    { step: 3, title: "Content Governance", description: "Oversee all learning content and quality", icon: Shield, color: "bg-green-500", features: ["Content approval workflow", "Quality standards", "Compliance checks"] },
    { step: 4, title: "System Configuration", description: "Configure platform settings and integrations", icon: Settings, color: "bg-purple-500", features: ["System settings", "Integration management", "Security configuration"] }
  ];

  const getCurrentSteps = () => {
    switch (activeTab) {
      case "manager": return managerSteps;
      case "admin": return adminSteps;
      default: return employeeSteps;
    }
  };

  const currentSteps = getCurrentSteps();

  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-gradient-to-b from-background to-card">
      <div className="container mx-auto px-4 lg:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"><Sparkles className="w-4 h-4 text-primary" /><span className="text-sm font-medium text-primary">Platform Overview</span></div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">How It <span className="text-gradient">Works</span></h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">A simple, powerful platform designed for everyone in your organization</p>
        </motion.div>
        <div className="mb-12 lg:mb-16">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <motion.button key={tab.id} onClick={() => { setActiveTab(tab.id); setActiveStep(0); }} className={`flex items-center gap-3 px-6 py-4 rounded-xl border transition-all duration-300 ${activeTab === tab.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${tab.color}`}><TabIcon className="w-5 h-5 text-white" /></div>
                  <div className="text-left"><div className={`font-semibold ${activeTab === tab.id ? "text-primary" : "text-foreground"}`}>{tab.label}</div><div className="text-sm text-muted-foreground">{tab.description}</div></div>
                </motion.button>
              );
            })}
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="flex gap-2 mb-8">{currentSteps.map((step, index) => (<button key={step.step} onClick={() => setActiveStep(index)} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${activeStep === index ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"}`}>Step {step.step}</button>))}</div>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab + activeStep} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="space-y-6">
                {(() => { const StepIcon = currentSteps[activeStep].icon; return (<div className="flex items-start gap-4"><div className={`p-3 rounded-xl ${currentSteps[activeStep].color} text-white`}><StepIcon className="w-6 h-6" /></div><div><h3 className="text-2xl font-bold text-foreground mb-2">{currentSteps[activeStep].title}</h3><p className="text-lg text-muted-foreground">{currentSteps[activeStep].description}</p></div></div>); })()}
                <div className="space-y-3">{currentSteps[activeStep].features.map((feature, index) => (<motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: index * 0.1 }} className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" /><span className="text-foreground">{feature}</span></motion.div>))}</div>
                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <div className="text-sm text-muted-foreground">Step {activeStep + 1} of {currentSteps.length}</div>
                  <div className="flex gap-2">
                    <button onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0} className="px-4 py-2 text-sm font-medium rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted">Previous</button>
                    <button onClick={() => setActiveStep(Math.min(currentSteps.length - 1, activeStep + 1))} disabled={activeStep === currentSteps.length - 1} className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ring">Next</button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="relative">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="relative rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-card to-popover shadow-2xl">
              <div className="p-4 border-b border-border bg-muted/50"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div><div className="ml-4 text-sm text-muted-foreground">{activeTab === "employee" && "Employee Dashboard"}{activeTab === "manager" && "Manager Dashboard"}{activeTab === "admin" && "Admin Dashboard"}</div></div></div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2"><div className="text-lg font-semibold text-foreground">{currentSteps[activeStep].title}</div><div className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">Active</div></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-primary to-ring" initial={{ width: "0%" }} animate={{ width: `${((activeStep + 1) / currentSteps.length) * 100}%` }} transition={{ duration: 0.5 }} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">{currentSteps[activeStep].features.slice(0, 4).map((feature, index) => (<motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: index * 0.1 }} className="p-3 rounded-lg bg-muted/50 border border-border"><div className="text-xs text-muted-foreground mb-1">{feature.split(":")[0]}</div><div className="text-sm font-medium text-foreground">{feature.split(":")[1] || feature}</div></motion.div>))}</div>
              </div>
              <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-ring flex items-center justify-center"><Zap className="w-5 h-5 text-white" /></div>
              <div className="absolute -bottom-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center"><MessageSquare className="w-4 h-4 text-white" /></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformDemo;