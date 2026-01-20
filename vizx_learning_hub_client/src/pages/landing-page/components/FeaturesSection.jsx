import { motion } from "framer-motion";
import { PlayCircle, Trophy, Gamepad2, BookOpen, Target, Zap, Sparkles, Star, Clock, CheckCircle2 } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: PlayCircle,
      title: "Interactive Learning Modules",
      description: "Engaging video lessons, step-by-step tutorials, and hands-on projects that make learning practical and effective.",
      color: "from-blue-500 to-cyan-500",
      highlights: ["Video Content", "Textual Learning", "Documentation", "Practical Exercises"]
    },
    {
      icon: BookOpen,
      title: "Structured Learning Paths",
      description: "Curated learning journeys designed by industry experts to build skills systematically from beginner to advanced.",
      color: "from-purple-500 to-pink-500",
      highlights: ["Expert-Curated", "Skill Progression", "Industry-Relevant", "Certification Ready"]
    },
    {
      icon: Gamepad2,
      title: "Gamified Experience",
      description: "Earn points, maintain streaks, and climb leaderboards through interactive games, quizzes, and challenges.",
      color: "from-green-500 to-emerald-500",
      highlights: ["Points System", "Streak Tracking", "Leaderboards", "Achievements"]
    },
    {
      icon: Trophy,
      title: "Progress & Certification",
      description: "Track your learning journey, earn verifiable certificates, and showcase your skills to employers.",
      color: "from-yellow-500 to-amber-500",
      highlights: ["Progress Tracking", "Skill Assessment", "Certificates", "Badge System"]
    },
  ];

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } } };

  return (
    <section className="py-16 lg:py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-60 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-60 h-60 bg-ring/5 rounded-full blur-3xl"></div>
      </div>
      <div className="container relative mx-auto px-4 lg:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-center max-w-4xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"><Sparkles className="w-4 h-4 text-primary" /><span className="text-sm font-medium text-primary">Platform Features</span></div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Everything You Need to <span className="text-gradient">Accelerate Learning</span></h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">A comprehensive AI-powered learning platform designed for modern workforce development, combining the best of Udemy's course structure with innovative engagement features.</p>
        </motion.div>
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants} className="relative group">
              <div className="bg-card rounded-xl border border-border p-6 h-full transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover-lift">
                <div className="mb-5">
                  <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-3 flex items-center justify-center`}><feature.icon className="w-7 h-7 text-white" /><div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div></div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <div className="space-y-2">
                  {feature.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" /><span className="text-sm text-foreground font-medium">{highlight}</span></div>
                  ))}
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;