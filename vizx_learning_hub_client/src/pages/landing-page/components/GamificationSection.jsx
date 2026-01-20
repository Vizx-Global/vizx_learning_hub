import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Trophy, Star, Users, Target, Zap, Flame, Brain, Puzzle, Clock, Medal, Award, ChevronRight, PlayCircle, Sparkles, TrendingUp } from "lucide-react";
import Button from "../../../components/ui/Button";

const GamificationSection = () => {
  const [activeGame, setActiveGame] = useState(0);

  const games = [
    {
      id: "trivia",
      title: "Daily Trivia Challenge",
      description: "Test your knowledge with daily AI-powered trivia questions",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      points: "Up to 500 points/day",
      players: "10+ more daily players",
      features: ["Daily rotating topics", "Difficulty levels", "Instant feedback", "Leaderboard ranking"]
    },
    {
      id: "streaks",
      title: "Learning Streaks",
      description: "Maintain daily learning streaks and compete with colleagues",
      icon: Flame,
      color: "from-orange-500 to-red-500",
      points: "50 points/day bonus",
      players: "Maintain your momentum",
      features: ["Daily login bonus", "Weekly streak rewards", "Partner challenges", "Milestone badges"]
    },
    {
      id: "memory",
      title: "AI Memory Match",
      description: "Match AI concepts with their definitions in this fast-paced game",
      icon: Puzzle,
      color: "from-blue-500 to-cyan-500",
      points: "100 points/game",
      players: "Skill-based matching",
      features: ["AI terminology", "Concept matching", "Timed challenges", "Progressive difficulty"]
    },
    {
      id: "leaderboard",
      title: "Live Leaderboards",
      description: "Compete with colleagues and climb the rankings",
      icon: Trophy,
      color: "from-yellow-500 to-amber-500",
      points: "Weekly prizes",
      players: "Company-wide competition",
      features: ["Real-time rankings", "Department battles", "Achievement tiers", "Monthly champions"]
    }
  ];

  const gameStats = [
    { icon: Users, value: "85%", label: "Higher Engagement", description: "with gamified elements" },
    { icon: Zap, value: "3x", label: "More Completion", description: "compared to traditional learning" },
    { icon: Clock, value: "40%", label: "Longer Sessions", description: "average time spent learning" },
    { icon: Target, value: "92%", label: "Skill Retention", description: "improvement with games" }
  ];

  const leaderboardSample = [
    { rank: 1, name: "Derrick Mukabwa", points: 12450, streak: 42, department: "IT" },
    { rank: 2, name: "Sophia Makau", points: 11890, streak: 38, department: "Communications" },
    { rank: 3, name: "Minnie Gicheha", points: 10560, streak: 35, department: "Operations" },
    { rank: 4, name: "Elvis Kimani", points: 9870, streak: 29, department: "R&D" },
    { rank: 5, name: "Liz Wambeti", points: 8940, streak: 31, department: "Recruitment" }
  ];

  const achievements = [
    { icon: Star, title: "First Quiz Master", description: "Complete 10 quizzes", color: "bg-yellow-500/20" },
    { icon: Flame, title: "30-Day Streak", description: "Learn for 30 consecutive days", color: "bg-orange-500/20" },
    { icon: Trophy, title: "Top Performer", description: "Reach top 10 in leaderboard", color: "bg-purple-500/20" },
    { icon: Brain, title: "AI Expert", description: "Master 5 AI learning paths", color: "bg-blue-500/20" }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-card to-background">
      <div className="container mx-auto px-4 lg:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Gamified Learning</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Learning Made <span className="text-gradient">Fun & Engaging</span></h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">Turn skill development into an exciting experience with interactive games, challenges, and rewards that keep everyone motivated</p>
        </motion.div>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12 lg:mb-16">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6">Interactive Games</h3>
            <div className="space-y-4 mb-8">
              {games.map((game, index) => (
                <motion.button key={game.id} onClick={() => setActiveGame(index)} className={`w-full text-left p-5 rounded-xl border transition-all duration-300 ${activeGame === index ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${game.color}`}><game.icon className="w-6 h-6 text-white" /></div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2"><h4 className="text-lg font-semibold text-foreground">{game.title}</h4>{activeGame === index && <div className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">Playing</div>}</div>
                      <p className="text-muted-foreground mb-3">{game.description}</p>
                      <div className="flex items-center gap-4 text-sm"><span className="flex items-center gap-1 text-foreground"><Star className="w-4 h-4 text-yellow-500" />{game.points}</span><span className="flex items-center gap-1 text-muted-foreground"><Users className="w-4 h-4" />{game.players}</span></div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">Game Features</h4>
              <div className="grid grid-cols-2 gap-3">
                {games[activeGame].features.map((feature, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: index * 0.05 }} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                    <div className="w-2 h-2 rounded-full bg-primary"></div><span className="text-sm text-foreground">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4"><h3 className="text-2xl font-bold text-foreground">{games[activeGame].title}</h3><div className="px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-primary to-ring text-primary-foreground">Live Demo</div></div>
              <div className="relative rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-card to-popover">
                <div className="p-4 border-b border-border bg-muted/50 flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div><div className="ml-4 text-sm text-muted-foreground">{games[activeGame].title} • Play Now</div></div>
                <div className="p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-ring/10 mb-4">{(() => { const GameIcon = games[activeGame].icon; return <GameIcon className="w-12 h-12 text-primary" />; })()}</div>
                    <h4 className="text-xl font-bold text-foreground mb-2">Ready to Play?</h4>
                    <p className="text-muted-foreground">{games[activeGame].description}</p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">Your Points</span><span className="text-sm font-semibold text-foreground">+{games[activeGame].points.split(" ")[0]}</span></div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-primary to-ring" initial={{ width: "0%" }} animate={{ width: "75%" }} transition={{ duration: 1, delay: 0.5 }} /></div>
                  </div>
                  <Button className="w-full py-3 bg-gradient-to-r from-primary to-ring text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"><PlayCircle className="w-5 h-5 mr-2" />Play Demo Game</Button>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Live Leaderboard</h3>
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/50"><div className="flex items-center justify-between"><span className="font-semibold text-foreground">Top Performers</span><span className="text-sm text-muted-foreground">This Week</span></div></div>
                <div className="p-4">
                  {leaderboardSample.map((player, index) => (
                    <motion.div key={player.rank} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} className={`flex items-center gap-4 p-3 rounded-lg mb-2 ${index === 0 ? "bg-gradient-to-r from-primary/10 to-ring/10 border border-primary/20" : "hover:bg-muted/30"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${player.rank === 1 ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white" : player.rank === 2 ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white" : player.rank === 3 ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white" : "bg-muted text-foreground"}`}>{player.rank}</div>
                      <div className="flex-1"><div className="font-semibold text-foreground">{player.name}</div><div className="text-xs text-muted-foreground">{player.department}</div></div>
                      <div className="text-right"><div className="font-bold text-foreground">{player.points.toLocaleString()}</div><div className="flex items-center gap-1 text-xs text-muted-foreground"><Flame className="w-3 h-3" />{player.streak} days</div></div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }} className="mb-12 lg:mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Earn Achievements & Rewards</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: index * 0.1 }} className="bg-card rounded-xl p-6 border border-border text-center hover-lift">
                <div className={`inline-flex p-3 rounded-lg ${achievement.color} mb-3`}><achievement.icon className="w-6 h-6 text-primary" /></div>
                <h4 className="font-semibold text-foreground mb-2">{achievement.title}</h4>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} viewport={{ once: true }} className="text-center">
          <div className="bg-gradient-to-r from-primary/5 to-ring/5 rounded-2xl p-8 border border-primary/10 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4"><Sparkles className="w-6 h-6 text-primary" /><h3 className="text-2xl font-bold text-foreground">Ready to Level Up Your Learning?</h3></div>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">Transform traditional training into an engaging experience with games, challenges, and rewards that actually work</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => window.location.href = '/register'} className="px-8 py-3 bg-gradient-to-r from-primary to-ring text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300">Start Playing<Gamepad2 className="w-5 h-5 ml-2" /></Button>
              <Button onClick={() => window.location.href = '/demo'} variant="outline" className="px-8 py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/10 transition-all duration-300"><TrendingUp className="w-5 h-5 mr-2" />See Case Studies</Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GamificationSection;