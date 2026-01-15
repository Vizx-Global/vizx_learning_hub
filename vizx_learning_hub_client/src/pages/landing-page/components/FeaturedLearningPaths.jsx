import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  PlayCircle, 
  Clock, 
  Users, 
  Star, 
  ChevronRight,
  TrendingUp,
  BookOpen,
  RefreshCw
} from "lucide-react";
import Button from "../../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import learningPathService from "../../Administrator/admin-learning-path-management/services/learningPathService";

const FeaturedLearningPaths = () => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  const categories = [
    { id: "all", name: "All Categories", count: 0 },
    { id: "ai", name: "AI & Machine Learning", count: 0 },
    { id: "prompt-engineering", name: "Prompt Engineering", count: 0 },
    { id: "bpo", name: "Business Process", count: 0 },
    { id: "call-center", name: "Call Center", count: 0 },
    { id: "data-analytics", name: "Data Analytics", count: 0 },
    { id: "leadership", name: "Leadership", count: 0 }
  ];

  const difficultyColors = {
    BEGINNER: "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20",
    INTERMEDIATE: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20",
    ADVANCED: "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
  };

  const difficultyLabels = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced"
  };

  const categoryColors = {
    "ai": "from-purple-500 to-pink-500",
    "prompt-engineering": "from-blue-500 to-cyan-500",
    "bpo": "from-green-500 to-emerald-500",
    "call-center": "from-orange-500 to-red-500",
    "data-analytics": "from-indigo-500 to-blue-500",
    "leadership": "from-yellow-500 to-amber-500"
  };

  // Default thumbnail if none provided
  const getThumbnailUrl = (path) => {
    if (path.thumbnailUrl) return path.thumbnailUrl;
    if (path.bannerUrl) return path.bannerUrl;
    
    // Fallback based on category
    const categoryLower = path.category?.toLowerCase() || '';
    
    const categoryMap = {
      'ai': 'https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767722789/Futuristic_AI_Robots_and_Cyborgs_Shaping_Tomorrow_s_Technology_hkucfp.jpg',
      'ai & machine learning': 'https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767722789/Futuristic_AI_Robots_and_Cyborgs_Shaping_Tomorrow_s_Technology_hkucfp.jpg',
      'prompt-engineering': 'https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767722935/Prompt_Engineering_Services_k693il.jpg',
      'prompt engineering': 'https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767722935/Prompt_Engineering_Services_k693il.jpg',
      'bpo': 'https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767723130/Lead_Generation_and_Appointment_Setting_xbkgcy.jpg',
      'business process': 'https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767723130/Lead_Generation_and_Appointment_Setting_xbkgcy.jpg',
      'call-center': 'https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767723333/5_Ways_a_Call_Center_Can_Help_Your_Business_Grow__s0sor3.jpg',
      'call center': 'https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767723333/5_Ways_a_Call_Center_Can_Help_Your_Business_Grow__s0sor3.jpg',
      'data-analytics': 'https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767723435/The_Human_Side_of_Real-Time_Data_Analytics_in_Newsrooms_w4shvp.jpg',
      'data analytics': 'https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767723435/The_Human_Side_of_Real-Time_Data_Analytics_in_Newsrooms_w4shvp.jpg',
      'leadership': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop'
    };
    
    return categoryMap[categoryLower] || 
           'https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767722789/Futuristic_AI_Robots_and_Cyborgs_Shaping_Tomorrow_s_Technology_hkucfp.jpg';
  };

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  const fetchLearningPaths = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch featured learning paths (public endpoint) to avoid redirect on landing page
      const response = await learningPathService.getFeaturedLearningPaths({
        limit: 20 // Fetch more than we need to display to handle counts and featured logic
      });
      
      console.log("API Response (All Paths):", response);
      
      if (response.data.success && response.data.data) {
        // Correctly handle nested structure: response.data.data.learningPaths
        let allPaths = [];
        if (response.data.data.learningPaths && Array.isArray(response.data.data.learningPaths)) {
          allPaths = response.data.data.learningPaths;
        } else if (Array.isArray(response.data.data)) {
          allPaths = response.data.data;
        }
        
        console.log("Extracted Paths:", allPaths);
        
        // Update category counts based on all paths
        const categoryCounts = {};
        allPaths.forEach(path => {
          const category = path.category?.toLowerCase() || 'uncategorized';
          // Match main category IDs
          const matchedCategory = categories.find(cat => 
            cat.id === category || 
            cat.name.toLowerCase() === category ||
            (category.includes('ai') && cat.id === 'ai') ||
            (category.includes('bpo') && cat.id === 'bpo')
          );
          
          if (matchedCategory) {
            categoryCounts[matchedCategory.id] = (categoryCounts[matchedCategory.id] || 0) + 1;
          }
        });
        
        // Update categories with counts
        categories.forEach(cat => {
          if (cat.id === 'all') {
            cat.count = allPaths.length;
          } else {
            cat.count = categoryCounts[cat.id] || 0;
          }
        });
        
        // Select what to display: favor featured, then most enrolled
        const sortedPaths = [...allPaths].sort((a, b) => {
          // Put featured first
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          // Then by enrollment
          return (b.enrollmentCount || 0) - (a.enrollmentCount || 0);
        });
        
        setLearningPaths(sortedPaths); // Store all fetched paths to allow effective filtering
        
      } else {
        const errorMessage = response.data.message || 'Failed to fetch learning paths';
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("Error fetching learning paths:", err);
      setError(err.message || "Failed to load learning paths. Please try again.");
      
      if (process.env.NODE_ENV === 'development') {
        setLearningPaths(getMockLearningPaths());
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const getMockLearningPaths = () => {
    return [
      {
        id: "1",
        title: "AI & Prompt Engineering Mastery",
        slug: "ai-prompt-engineering-mastery",
        description: "Master AI fundamentals and advanced prompt engineering techniques",
        category: "AI",
        difficulty: "INTERMEDIATE",
        estimatedHours: 42,
        enrollmentCount: 2540,
        averageRating: 4.8,
        ratingCount: 124,
        isFeatured: true,
        thumbnailUrl: "https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767722789/Futuristic_AI_Robots_and_Cyborgs_Shaping_Tomorrow_s_Technology_hkucfp.jpg",
        provider: "Internal"
      },
      {
        id: "2",
        title: "Business Process Outsourcing Excellence",
        slug: "business-process-outsourcing-excellence",
        description: "Complete guide to BPO operations and management",
        category: "BPO",
        difficulty: "BEGINNER",
        estimatedHours: 36,
        enrollmentCount: 1890,
        averageRating: 4.6,
        ratingCount: 89,
        isFeatured: true,
        thumbnailUrl: "https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767723130/Lead_Generation_and_Appointment_Setting_xbkgcy.jpg",
        provider: "Internal"
      }
    ];
  };

  const handleViewDetails = (path) => {
    if (path.slug) {
      navigate(`/learning-path/${path.slug}`);
    } else {
      navigate(`/learning-path/${path.id}`);
    }
  };

  const handleBrowseAll = () => {
    navigate("/browse");
  };

  const filteredPaths = (selectedCategory === "all" 
    ? learningPaths 
    : learningPaths.filter(path => 
        path.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        (path.category?.toLowerCase().includes('ai') && selectedCategory === 'ai') ||
        (path.category?.toLowerCase().includes('bpo') && selectedCategory === 'bpo')
      )).slice(0, 8);

  const formatDuration = (hours) => {
    if (!hours) return "Flexible";
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
    return `${hours}h`;
  };

  // Calculate average hours for display
  const getDisplayHours = (path) => {
    if (path.estimatedHours) return path.estimatedHours;
    if (path.minEstimatedHours && path.maxEstimatedHours) {
      return `${path.minEstimatedHours}-${path.maxEstimatedHours}`;
    }
    return "Flexible";
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-muted/10 dark:to-gray-900/10">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-8 lg:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Featured Learning Paths
            </span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Master In-Demand <span className="text-gradient">Skills</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Explore our most popular learning paths designed by industry experts to accelerate your career growth
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-8 lg:mb-12"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground"
                }`}
              >
                {category.name}
                {category.count > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                    {category.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-card rounded-xl border border-border p-6 animate-pulse">
                <div className="h-48 bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4 w-3/4"></div>
                <div className="h-3 bg-muted rounded mb-2 w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="mb-4 text-muted-foreground">{error}</div>
            <Button
              onClick={fetchLearningPaths}
              variant="outline"
              className="inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        )}

        {/* Learning Paths Grid */}
        {!loading && !error && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {filteredPaths.map((path, index) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="bg-card rounded-xl border border-border overflow-hidden hover-lift hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    {/* Thumbnail */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getThumbnailUrl(path)}
                        alt={path.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767722789/Futuristic_AI_Robots_and_Cyborgs_Shaping_Tomorrow_s_Technology_hkucfp.jpg`;
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${difficultyColors[path.difficulty] || difficultyColors.BEGINNER}`}>
                          {difficultyLabels[path.difficulty] || "Beginner"}
                        </span>
                      </div>
                      {path.isFeatured && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-primary text-primary-foreground backdrop-blur-sm">
                            FEATURED
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-lg font-bold text-white line-clamp-2">
                          {path.title}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      {/* Category & Provider */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-medium">
                            {path.category || "Uncategorized"}
                          </span>
                          <span className="text-muted-foreground">
                            {path.provider || "Internal"}
                          </span>
                        </div>
                        {path.subcategory && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {path.subcategory}
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
                        {path.description || path.shortDescription || "No description available"}
                      </p>

                      {/* Stats */}
                      <div className="space-y-3 mb-4">
                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            <span className="ml-1 font-bold text-foreground">
                              {path.averageRating ? path.averageRating.toFixed(1) : "New"}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({path.ratingCount || 0} ratings)
                          </span>
                        </div>

                        {/* Duration & Students */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{formatDuration(getDisplayHours(path))}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{(path.enrollmentCount || 0).toLocaleString()}+ enrolled</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => handleViewDetails(path)}
                        variant="outline"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Empty State */}
            {filteredPaths.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No featured learning paths found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {selectedCategory === "all" 
                    ? "No featured learning paths available yet." 
                    : `No featured courses available in ${categories.find(c => c.id === selectedCategory)?.name} yet.`}
                </p>
                <div className="flex gap-3 justify-center">
                  {selectedCategory !== "all" && (
                    <Button
                      onClick={() => setSelectedCategory("all")}
                      variant="outline"
                    >
                      View All Categories
                    </Button>
                  )}
                  <Button
                    onClick={handleBrowseAll}
                    className="bg-primary text-primary-foreground"
                  >
                    Browse All Courses
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* CTA - Only show if we have learning paths */}
        {learningPaths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <div className="bg-gradient-to-r from-primary/5 to-ring/5 rounded-2xl p-8 border border-primary/10">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Ready to Start Your Learning Journey?
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Explore our complete library of learning paths and advance your career today
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleBrowseAll}
                    className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-ring transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
                  >
                    Browse All Courses
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    onClick={() => navigate("/register")}
                    variant="outline"
                    className="px-8 py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/10 transition-all duration-300"
                  >
                    Sign Up Free
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FeaturedLearningPaths;