import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

const RecommendedModules = ({ userRole = 'employee' }) => {
  const [modules, setModules] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');

  const recommendedModules = [
    {
      id: 1,
      title: "Implementing AI Solutions",
      description: "Learn how to implement AI solutions in your business processes with practical examples and case studies.",
      difficulty: "Intermediate",
      estimatedTime: 45,
      category: "Implementation",
      provider: "Microsoft Learn",
      rating: 4.8,
      enrolledCount: 1247,
      tags: ["AI", "Business", "Implementation"],
      thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop",
      isNew: false,
      isTrending: true,
      completionRate: 87,
      prerequisites: ["AI Fundamentals", "Business Context"],
      learningObjectives: [
        "Identify AI implementation opportunities",
        "Design AI solution architecture",
        "Manage AI project lifecycle"
      ]
    },
    {
      id: 2,
      title: "AI Project Management",
      description: "Master the art of managing AI projects from conception to deployment with agile methodologies.",
      difficulty: "Advanced",
      estimatedTime: 60,
      category: "Management",
      provider: "Microsoft Learn",
      rating: 4.9,
      enrolledCount: 892,
      tags: ["Project Management", "AI", "Leadership"],
      thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop",
      isNew: true,
      isTrending: false,
      completionRate: 92,
      prerequisites: ["AI Fundamentals", "Project Management Basics"],
      learningObjectives: [
        "Plan AI project timelines",
        "Manage AI development teams",
        "Ensure project success metrics"
      ]
    },
    {
      id: 3,
      title: "Future of AI in Business",
      description: "Explore emerging AI trends and their potential impact on various business sectors and industries.",
      difficulty: "Beginner",
      estimatedTime: 30,
      category: "Trends",
      provider: "Microsoft Learn",
      rating: 4.7,
      enrolledCount: 2156,
      tags: ["Future", "Trends", "Business Strategy"],
      thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop",
      isNew: false,
      isTrending: true,
      completionRate: 94,
      prerequisites: [],
      learningObjectives: [
        "Understand AI future trends",
        "Identify business opportunities",
        "Prepare for AI transformation"
      ]
    },
    {
      id: 4,
      title: "AI Ethics and Governance",
      description: "Understand the ethical implications of AI and learn to implement responsible AI governance frameworks.",
      difficulty: "Intermediate",
      estimatedTime: 50,
      category: "Ethics",
      provider: "Microsoft Learn",
      rating: 4.6,
      enrolledCount: 1543,
      tags: ["Ethics", "Governance", "Responsibility"],
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop",
      isNew: false,
      isTrending: false,
      completionRate: 89,
      prerequisites: ["AI Fundamentals"],
      learningObjectives: [
        "Apply ethical AI principles",
        "Design governance frameworks",
        "Ensure responsible AI deployment"
      ]
    },
    {
      id: 5,
      title: "Machine Learning for Managers",
      description: "A manager\'s guide to understanding machine learning concepts without deep technical complexity.",
      difficulty: "Beginner",
      estimatedTime: 40,
      category: "Management",
      provider: "Microsoft Learn",
      rating: 4.8,
      enrolledCount: 987,
      tags: ["Machine Learning", "Management", "Non-Technical"],
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
      isNew: true,
      isTrending: true,
      completionRate: 91,
      prerequisites: [],
      learningObjectives: [
        "Understand ML concepts",
        "Make informed ML decisions",
        "Lead ML initiatives"
      ]
    },
    {
      id: 6,
      title: "Data Science Fundamentals",
      description: "Build a solid foundation in data science concepts essential for AI understanding and implementation.",
      difficulty: "Intermediate",
      estimatedTime: 55,
      category: "Data Science",
      provider: "Microsoft Learn",
      rating: 4.7,
      enrolledCount: 1876,
      tags: ["Data Science", "Analytics", "Fundamentals"],
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
      isNew: false,
      isTrending: false,
      completionRate: 85,
      prerequisites: ["Basic Statistics"],
      learningObjectives: [
        "Master data analysis techniques",
        "Understand statistical concepts",
        "Apply data science methods"
      ]
    }
  ];

  useEffect(() => {
    setModules(recommendedModules);
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'text-success bg-success/10';
      case 'intermediate': return 'text-warning bg-warning/10';
      case 'advanced': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'implementation': return 'Settings';
      case 'management': return 'Users';
      case 'trends': return 'TrendingUp';
      case 'ethics': return 'Shield';
      case 'data science': return 'BarChart3';
      default: return 'BookOpen';
    }
  };

  const filteredModules = modules?.filter(module => {
    if (filter === 'all') return true;
    if (filter === 'new') return module.isNew;
    if (filter === 'trending') return module.isTrending;
    return module.difficulty?.toLowerCase() === filter;
  });

  const sortedModules = [...filteredModules]?.sort((a, b) => {
    switch (sortBy) {
      case 'rating': return b?.rating - a?.rating;
      case 'time': return a?.estimatedTime - b?.estimatedTime;
      case 'popularity': return b?.enrolledCount - a?.enrolledCount;
      default: return 0; // recommended order
    }
  });

  const handleStartModule = (moduleId) => {
    console.log(`Starting module ${moduleId}`);
    // Navigation logic would go here
  };

  const handleBookmark = (moduleId) => {
    console.log(`Bookmarking module ${moduleId}`);
    // Bookmark logic would go here
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Recommended for You</h2>
          <p className="text-sm text-muted-foreground">
            Personalized learning modules based on your progress and role
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <select 
            value={filter}
            onChange={(e) => setFilter(e?.target?.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Modules</option>
            <option value="new">New</option>
            <option value="trending">Trending</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Sort Dropdown */}
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e?.target?.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="recommended">Recommended</option>
            <option value="rating">Highest Rated</option>
            <option value="time">Shortest Time</option>
            <option value="popularity">Most Popular</option>
          </select>
        </div>
      </div>
      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedModules?.map((module) => (
          <div key={module.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 group">
            {/* Module Thumbnail */}
            <div className="relative h-48 overflow-hidden">
              <img 
                src={module.thumbnail} 
                alt={module.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {module.isNew && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                    New
                  </span>
                )}
                {module.isTrending && (
                  <span className="bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full font-medium">
                    Trending
                  </span>
                )}
              </div>

              {/* Bookmark Button */}
              <button
                onClick={() => handleBookmark(module.id)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/40 transition-colors"
              >
                <Icon name="Bookmark" size={16} className="text-white" />
              </button>

              {/* Category Icon */}
              <div className="absolute bottom-3 left-3 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Icon name={getCategoryIcon(module.category)} size={20} className="text-white" />
              </div>
            </div>

            {/* Module Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2">
                    {module.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {module.description}
                  </p>
                </div>
              </div>

              {/* Module Meta */}
              <div className="flex items-center gap-4 mb-4 text-xs">
                <span className={`px-2 py-1 rounded-full font-medium ${getDifficultyColor(module.difficulty)}`}>
                  {module.difficulty}
                </span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Icon name="Clock" size={14} />
                  <span>{module.estimatedTime} min</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Icon name="Star" size={14} />
                  <span>{module.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Icon name="Users" size={14} />
                  <span>{module.enrolledCount?.toLocaleString()}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Completion Rate</span>
                  <span className="text-xs font-medium text-foreground">{module.completionRate}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-full bg-gradient-to-r from-success to-success/80 rounded-full"
                    style={{ width: `${module.completionRate}%` }}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {module.tags?.slice(0, 3)?.map((tag, index) => (
                  <span key={index} className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="default" 
                  className="flex-1"
                  iconName="Play"
                  iconPosition="left"
                  onClick={() => handleStartModule(module.id)}
                >
                  Start Learning
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  iconName="Info"
                  onClick={() => console.log(`View details for ${module.id}`)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Load More Button */}
      {sortedModules?.length >= 6 && (
        <div className="text-center">
          <Button variant="outline" iconName="ChevronDown" iconPosition="right">
            Load More Modules
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecommendedModules;