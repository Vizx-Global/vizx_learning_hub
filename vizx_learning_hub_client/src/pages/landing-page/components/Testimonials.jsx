import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "AI Engineer at TechCorp",
      rating: 5,
      content: "This platform transformed my career. The interactive learning and gamification kept me engaged throughout my AI learning journey. The real-time feedback was incredibly helpful!",
      avatarColor: "from-purple-500 to-pink-500"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Data Scientist at DataFlow",
      rating: 5,
      content: "The AI-powered learning assistant is a game-changer. It adapted to my learning pace and provided personalized recommendations that accelerated my growth.",
      avatarColor: "from-blue-500 to-cyan-500"
    },
    {
      id: 3,
      name: "Priya Sharma",
      role: "BPO Team Lead at ServiceFirst",
      rating: 5,
      content: "The Business Process Outsourcing course was exceptional. The practical simulations and real-world scenarios prepared me perfectly for my promotion.",
      avatarColor: "from-orange-500 to-red-500"
    },
    {
      id: 4,
      name: "David Okoro",
      role: "Call Center Manager at ConnectPlus",
      rating: 4,
      content: "The streak challenges and leaderboards made learning competitive and fun. My team now uses this platform for all our training needs.",
      avatarColor: "from-green-500 to-emerald-500"
    },
    {
      id: 5,
      name: "Lisa Rodriguez",
      role: "Prompt Engineering Specialist",
      rating: 5,
      content: "As someone transitioning into AI, the structured learning paths and hands-on projects gave me the confidence to switch careers successfully.",
      avatarColor: "from-yellow-500 to-amber-500"
    },
    {
      id: 6,
      name: "James Wilson",
      role: "Learning & Development Manager",
      rating: 5,
      content: "We rolled out this platform to our entire organization. The engagement metrics and completion rates have been phenomenal compared to our previous LMS.",
      avatarColor: "from-indigo-500 to-purple-500"
    },
    {
      id: 7,
      name: "Emma Thompson",
      role: "Customer Service Director",
      rating: 4,
      content: "The call center training modules are top-notch. The interactive scenarios helped our agents handle complex customer interactions with confidence.",
      avatarColor: "from-red-500 to-pink-500"
    },
    {
      id: 8,
      name: "Ahmed Hassan",
      role: "Tech Lead at InnovateAI",
      rating: 5,
      content: "The gamification elements kept our junior developers motivated. They completed more training in 3 months than they did in the previous year.",
      avatarColor: "from-teal-500 to-blue-500"
    },
    {
      id: 9,
      name: "Sophie Williams",
      role: "HR Director",
      rating: 5,
      content: "The certificates are industry-recognized and have helped our employees advance their careers. The ROI on our training budget has been incredible.",
      avatarColor: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-muted/20 dark:to-gray-900/20">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Quote className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Learner Testimonials
            </span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            What Our <span className="text-gradient">Learners Say</span>
          </h2>
          
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of satisfied professionals who transformed their careers with our 
            AI-powered learning platform
          </p>
        </motion.div>

        {/* Double Row Testimonial Cards with Infinite Scroll */}
        <div className="relative">
          {/* First Row - Scroll Left */}
          <div className="mb-8">
            <div className="flex overflow-x-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
              <motion.div 
                className="flex gap-6 py-4"
                animate={{ 
                  x: [0, -1000] 
                }}
                transition={{ 
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 40,
                    ease: "linear"
                  }
                }}
              >
                {testimonials.slice(0, 5).map((testimonial) => (
                  <div
                    key={`first-${testimonial.id}`}
                    className="flex-shrink-0 w-80 lg:w-96"
                  >
                    <div className="bg-card rounded-2xl p-6 lg:p-8 border border-border hover-lift hover:border-primary/30 transition-all duration-300 shadow-lg">
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`w-4 h-4 ${
                              index < testimonial.rating
                                ? "fill-yellow-500 text-yellow-500"
                                : "fill-muted text-muted-foreground"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-2">
                          {testimonial.rating}.0/5.0
                        </span>
                      </div>
                      
                      {/* Content */}
                      <p className="text-foreground mb-6 italic">
                        "{testimonial.content}"
                      </p>
                      
                      {/* Author */}
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.avatarColor}`}></div>
                        <div>
                          <div className="font-semibold text-foreground">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Duplicate for seamless loop */}
                {testimonials.slice(0, 5).map((testimonial) => (
                  <div
                    key={`first-duplicate-${testimonial.id}`}
                    className="flex-shrink-0 w-80 lg:w-96"
                  >
                    <div className="bg-card rounded-2xl p-6 lg:p-8 border border-border hover-lift hover:border-primary/30 transition-all duration-300 shadow-lg">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`w-4 h-4 ${
                              index < testimonial.rating
                                ? "fill-yellow-500 text-yellow-500"
                                : "fill-muted text-muted-foreground"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-2">
                          {testimonial.rating}.0/5.0
                        </span>
                      </div>
                      
                      <p className="text-foreground mb-6 italic">
                        "{testimonial.content}"
                      </p>
                      
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.avatarColor}`}></div>
                        <div>
                          <div className="font-semibold text-foreground">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Second Row - Scroll Right */}
          <div>
            <div className="flex overflow-x-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
              <motion.div 
                className="flex gap-6 py-4"
                animate={{ 
                  x: [-1000, 0] 
                }}
                transition={{ 
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 45,
                    ease: "linear"
                  }
                }}
              >
                {testimonials.slice(4).map((testimonial) => (
                  <div
                    key={`second-${testimonial.id}`}
                    className="flex-shrink-0 w-80 lg:w-96"
                  >
                    <div className="bg-card rounded-2xl p-6 lg:p-8 border border-border hover-lift hover:border-primary/30 transition-all duration-300 shadow-lg">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`w-4 h-4 ${
                              index < testimonial.rating
                                ? "fill-yellow-500 text-yellow-500"
                                : "fill-muted text-muted-foreground"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-2">
                          {testimonial.rating}.0/5.0
                        </span>
                      </div>
                      
                      <p className="text-foreground mb-6 italic">
                        "{testimonial.content}"
                      </p>
                      
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.avatarColor}`}></div>
                        <div>
                          <div className="font-semibold text-foreground">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Duplicate for seamless loop */}
                {testimonials.slice(4).map((testimonial) => (
                  <div
                    key={`second-duplicate-${testimonial.id}`}
                    className="flex-shrink-0 w-80 lg:w-96"
                  >
                    <div className="bg-card rounded-2xl p-6 lg:p-8 border border-border hover-lift hover:border-primary/30 transition-all duration-300 shadow-lg">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`w-4 h-4 ${
                              index < testimonial.rating
                                ? "fill-yellow-500 text-yellow-500"
                                : "fill-muted text-muted-foreground"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-2">
                          {testimonial.rating}.0/5.0
                        </span>
                      </div>
                      
                      <p className="text-foreground mb-6 italic">
                        "{testimonial.content}"
                      </p>
                      
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.avatarColor}`}></div>
                        <div>
                          <div className="font-semibold text-foreground">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;