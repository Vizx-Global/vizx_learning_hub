import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlayCircle, Clock, Users, Star, ChevronRight, TrendingUp, BookOpen, RefreshCw } from "lucide-react";
import Button from "../../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import learningPathService from "../../../api/learningPathService";
import enrollmentService from "../../../api/enrollmentService";
import categoryService from "../../../api/categoryService";
import { useAuth } from "../../../contexts/AuthContext";

const FeaturedLearningPaths = () => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const difficultyColors = {
    BEGINNER: "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20",
    INTERMEDIATE: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20",
    ADVANCED: "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
  };

  const difficultyLabels = { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" };

  const getThumbnailUrl = (path) => {
    if (path.thumbnailUrl) return path.thumbnailUrl;
    if (path.bannerUrl) return path.bannerUrl;
    // Fallback logic based on category could be added here if desired, 
    // but a generic attractive placeholder is safer to avoid code bloat unless provided.
    return 'https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767722789/Futuristic_AI_Robots_and_Cyborgs_Shaping_Tomorrow_s_Technology_hkucfp.jpg';
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch Categories and Featured Paths in parallel
      const [categoriesResponse, pathsResponse] = await Promise.all([
        categoryService.getAllCategories().catch(err => {
          console.error("Error fetching categories:", err);
          return { data: [] };
        }),
        learningPathService.getFeaturedLearningPaths({ limit: 20 })
      ]);

      // Robustly handle categories response structure
      let allRepoCategories = [];
      const catData = categoriesResponse;
      if (catData && Array.isArray(catData.data)) {
        allRepoCategories = catData.data;
      } else if (catData && catData.data && Array.isArray(catData.data.categories)) {
        allRepoCategories = catData.data.categories;
      } else if (Array.isArray(catData)) {
        allRepoCategories = catData;
      }

      // Robustly handle paths response structure
      let fetchedPaths = [];
      const pData = pathsResponse.data?.success || pathsResponse.data ? pathsResponse.data : pathsResponse;
      const allPaths = pData?.data?.learningPaths || pData?.data || pData || [];
      if (Array.isArray(allPaths)) {
        fetchedPaths = allPaths.filter(path => path.status === 'PUBLISHED');
      }

      // Helper to resolve category name
      const getCategoryName = (path) => {
        if (path.categoryRef?.name) return path.categoryRef.name;
        if (path.category && typeof path.category === 'string') return path.category;
        if (path.categoryId && allRepoCategories.length > 0) {
          const found = allRepoCategories.find(c => String(c.id) === String(path.categoryId));
          if (found) return found.name;
        }
        return "Uncategorized";
      };

      // Map paths with resolved category names
      const paths = fetchedPaths.map(path => ({
          ...path,
          categoryDisplayName: getCategoryName(path)
      }));

      setLearningPaths(paths);

      // Extract Categories dynamically from the fetched paths
      const allCategory = { id: "all", name: "All Categories", count: paths.length };
      const categoryMap = new Map();

      paths.forEach(path => {
         const categoryName = path.categoryDisplayName;
         if (categoryName && categoryName !== "Uncategorized") {
            const catLower = categoryName.toLowerCase();
            const existing = categoryMap.get(catLower);
            if (existing) {
               existing.count++;
            } else {
               categoryMap.set(catLower, {
                  id: catLower,
                  name: categoryName,
                  count: 1
               });
            }
         }
      });

      const extractedCategories = Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
      setCategories([allCategory, ...extractedCategories]);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load content.");
    } finally {
      setLoading(false);
    }
  };

  const handlePathClick = async (path) => {
    if (!isAuthenticated) {
        // If not authenticated, user requested redirect to login
        // (or we could send them to the public Detail page first, but adhering to specific request)
        navigate('/login');
        return;
    }

    try {
        // Check enrollment status for the authenticated user
        const response = await enrollmentService.getMyEnrollments();
        const enrollData = response.data?.data || response.data;
        const enrollments = Array.isArray(enrollData) ? enrollData : (Array.isArray(enrollData?.enrollments) ? enrollData.enrollments : []);
        
        // Check if user is enrolled in this specific path
        const isEnrolled = enrollments.some(e => 
            String(e.learningPathId) === String(path.id) || 
            (e.learningPath && String(e.learningPath.id) === String(path.id))
        );

        if (isEnrolled) {
            // User is already enrolled, continue learning
            navigate('/employee-courses');
        } else {
            // User is not enrolled, go to enrollment page
            navigate('/employee-learning-paths');
        }

    } catch (error) {
        console.error("Enrollment check error:", error);
        // Fallback on error to the safe listing page
        navigate('/employee-learning-paths');
    }
  };

  const handleBrowseAll = () => navigate("/browse");

  const filteredPaths = (selectedCategory === "all" ? learningPaths : learningPaths.filter(path => path.categoryDisplayName?.toLowerCase() === selectedCategory.toLowerCase())).slice(0, 8);

  const formatDuration = (hours) => {
    if (!hours) return "Flexible";
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
    return `${hours}h`;
  };

  const getDisplayHours = (path) => {
    if (path.estimatedHours) return path.estimatedHours;
    if (path.minEstimatedHours && path.maxEstimatedHours) return `${path.minEstimatedHours}-${path.maxEstimatedHours}`;
    return "Flexible";
  };

  return (
    <section id="courses" className="py-16 lg:py-24 bg-gradient-to-b from-background to-muted/10 dark:to-gray-900/10">
      <div className="container mx-auto px-4 lg:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-center mb-8 lg:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Featured Learning Paths</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Master In-Demand <span className="text-gradient">Skills</span></h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">Explore our most popular learning paths designed by industry experts to accelerate your career growth</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true }} className="mb-8 lg:mb-12">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button 
                key={category.id} 
                onClick={() => setSelectedCategory(category.id)} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${selectedCategory === category.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-muted text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground"}`}
              >
                {category.name}
                {category.count > 0 && <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${selectedCategory === category.id ? "bg-white/20" : "bg-black/10 dark:bg-white/10"}`}>{category.count}</span>}
              </button>
            ))}
          </div>
        </motion.div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-card rounded-xl border border-border p-6 animate-pulse">
                <div className="h-48 bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4 w-3/4"></div>
                <div className="h-3 bg-muted rounded mb-2 w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12">
            <div className="mb-4 text-muted-foreground">{error}</div>
            <Button onClick={fetchData} variant="outline" className="inline-flex items-center gap-2"><RefreshCw className="w-4 h-4" />Try Again</Button>
          </div>
        )}

        {!loading && !error && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {filteredPaths.map((path, index) => (
                <motion.div key={path.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} className="group">
                  <div 
                    className="bg-card rounded-xl border border-border overflow-hidden hover-lift hover:shadow-xl transition-all duration-300 h-full flex flex-col cursor-pointer"
                    onClick={() => handlePathClick(path)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img src={getThumbnailUrl(path)} alt={path.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => { e.target.src = `https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767722789/Futuristic_AI_Robots_and_Cyborgs_Shaping_Tomorrow_s_Technology_hkucfp.jpg`; }} />
                      <div className="absolute top-3 left-3"><span className={`px-2 py-1 text-xs font-bold rounded ${difficultyColors[path.difficulty] || difficultyColors.BEGINNER}`}>{difficultyLabels[path.difficulty] || "Beginner"}</span></div>
                      {path.isFeatured && <div className="absolute top-3 right-3"><span className="px-2 py-1 text-xs font-bold rounded bg-primary text-primary-foreground backdrop-blur-sm shadow-sm">FEATURED</span></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4"><h3 className="text-lg font-bold text-white line-clamp-2 leading-tight group-hover:text-primary-foreground transition-colors">{path.title}</h3></div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col bg-card">
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm"><span className="text-primary font-medium text-xs uppercase tracking-wider">{path.categoryDisplayName || "Uncategorized"}</span><span className="text-muted-foreground text-xs">{path.provider || "Internal"}</span></div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3 leading-relaxed">{path.description || path.shortDescription || "No description available"}</p>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2"><div className="flex items-center"><Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /><span className="ml-1 font-bold text-foreground">{path.averageRating ? path.averageRating.toFixed(1) : "New"}</span></div><span className="text-xs text-muted-foreground">({path.ratingCount || 0} reviews)</span></div>
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground border-t border-border pt-3">
                          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /><span>{formatDuration(getDisplayHours(path))}</span></div>
                          <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /><span>{(path.enrollmentCount || 0).toLocaleString()} enrolled</span></div>
                        </div>
                      </div>
                      <Button onClick={(e) => { e.stopPropagation(); handlePathClick(path); }} variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 font-semibold"><PlayCircle className="w-4 h-4 mr-2" />{isAuthenticated ? "Continue Learning" : "Start Learning"}</Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            {filteredPaths.length === 0 && (
              <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border mx-auto max-w-2xl">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No learning paths found</h3>
                <p className="text-muted-foreground mb-6">We couldn't find any learning paths in this category yet. Check back soon!</p>
                <div className="flex gap-3 justify-center">
                  {selectedCategory !== "all" && <Button onClick={() => setSelectedCategory("all")} variant="outline">View All</Button>}
                  <Button onClick={handleBrowseAll} className="bg-primary text-primary-foreground">Browse Library</Button>
                </div>
              </div>
            )}
          </>
        )}
        
        {learningPaths.length > 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }} className="text-center mt-12">
            <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-2xl p-8 border border-primary/10">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-foreground mb-4">Unlock Your Potential</h3>
                <p className="text-lg text-muted-foreground mb-6">Join thousands of learners achieving their goals with Vizx Academy.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={handleBrowseAll} className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Explore All Content <ChevronRight className="w-5 h-5 ml-2" /></Button>
                  {!isAuthenticated && <Button onClick={() => navigate("/register")} variant="outline" className="px-8 py-3 border-2 font-semibold rounded-xl">Create Free Account</Button>}
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