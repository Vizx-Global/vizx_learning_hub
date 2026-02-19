import { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";
import { Menu, X, ChevronDown, User, LogOut, UserCircle } from "lucide-react";
import { ThemeToggle } from "../../../components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import learningPathService from "../../../api/learningPathService";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [learningPaths, setLearningPaths] = useState([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        const response = await learningPathService.getAllLearningPaths();
        const pathsData = response.data?.data?.learningPaths || response.data?.learningPaths || response.data?.data || [];
        const filteredPaths = (Array.isArray(pathsData) ? pathsData : []).filter(path => path.status === 'PUBLISHED');
        setLearningPaths(filteredPaths);
      } catch (error) {
        console.error("Failed to fetch learning paths:", error);
      }
    };

    fetchLearningPaths();
  }, []);

  const handleLogout = async () => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    await logout(false); 
    navigate('/login');
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  const navItems = [
    { href: "/", label: "Home" },
    { 
      href: "#", 
      label: "Browse", 
      subMenu: learningPaths.map(path => ({
        href: `/learning-paths/${path.slug || path.id}`,
        label: path.title || path.name
      }))
    },
    { href: "/#features", label: "Features" },
    { href: "/#courses", label: "Courses" },
    { href: "/#how-it-works", label: "How It Works" },
  ];

  const handleSignIn = () => { navigate("/login"); setIsMenuOpen(false); };
  const handleSignUp = () => { navigate("/register"); setIsMenuOpen(false); };
  const toggleSubmenu = (name) => setActiveSubmenu(activeSubmenu === name ? null : name);

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300"
      initial={{ y: -100 }} 
      animate={{ y: 0 }} 
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <motion.div className="flex items-center" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <img 
              src="https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767738897/vizx_academy-updated_kpwfzj.png" 
              alt="Vizx Academy Logo" 
              className="hidden lg:block h-16 object-contain cursor-pointer" 
              onClick={() => navigate("/")} 
            />
            <img 
              src="https://res.cloudinary.com/dvkt0lsqb/image/upload/v1768516447/Untitled_design__4__1-removebg-preview_ivfmvy.png" 
              alt="Vizx Academy Logo" 
              className="block lg:hidden h-12 object-contain cursor-pointer" 
              onClick={() => navigate("/")} 
            />
          </motion.div>
          
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item, index) => (
              <motion.div 
                key={item.label} 
                className="relative group" 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <motion.a 
                  href={item.href} 
                  onClick={(e) => {
                    if (item.subMenu) {
                      e.preventDefault();
                    }
                  }}
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 font-medium text-sm lg:text-base relative py-2 px-3 rounded-lg cursor-pointer" 
                  whileHover={{ scale: 1.05 }}
                >
                  {item.label}
                  {item.subMenu && <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />}
                </motion.a>
                {item.subMenu && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left z-50 overflow-hidden">
                    <div className="py-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      {item.subMenu.length > 0 ? (
                        item.subMenu.map((subItem) => (
                          <a 
                            key={subItem.label} 
                            href={subItem.href} 
                            className="group flex items-center px-4 py-3.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50/80 dark:hover:bg-gray-900/80 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            {subItem.label}
                          </a>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm italic">
                          No learning paths yet
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            
            <ThemeToggle />
            
            <div className="flex items-center ml-4">
              {isAuthenticated && user ? (
                <div className="relative">
                   <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 p-1 pr-3 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                   >
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 overflow-hidden">
                        {user.avatar ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" /> : <UserCircle size={20} />}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate hidden lg:block">
                        {user.firstName || 'User'}
                      </span>
                      <ChevronDown size={14} className={`text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                   </motion.button>

                   <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 p-2"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <button 
                          onClick={() => { navigate('/profile'); setIsUserMenuOpen(false); }} 
                          className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                        >
                          <User size={16} className="mr-3" />
                          Profile
                        </button>
                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                        <button 
                          onClick={handleLogout} 
                          className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-left"
                        >
                          <LogOut size={16} className="mr-3" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                   </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={handleSignIn} className="font-semibold bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700" size="sm">
                      Sign In
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={handleSignUp} className="font-semibold bg-orange-500 hover:bg-orange-600 text-white border-0" size="sm">
                      Sign Up
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
          
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <motion.div animate={{ rotate: isMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                {isMenuOpen ? <X /> : <Menu />}
              </motion.div>
            </Button>
          </div>
        </div>
        
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black" 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              exit={{ opacity: 0, height: 0 }} 
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-2">
                {isAuthenticated && user && (
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-2 mx-2">
                     <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 overflow-hidden">
                      {user.avatar ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" /> : <UserCircle size={24} />}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                )}

                {navItems.map((item, index) => (
                  <motion.div 
                    key={item.label} 
                    className="relative" 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {item.subMenu ? (
                      <div className="py-2">
                        <button 
                          className="flex items-center justify-between w-full text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 font-medium p-2 rounded-lg" 
                          onClick={() => toggleSubmenu(item.label)}
                        >
                          <span>{item.label}</span>
                          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeSubmenu === item.label ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {activeSubmenu === item.label && (
                            <motion.div 
                              className="pl-4 mt-2 space-y-2 border-l border-gray-200 dark:border-gray-800 ml-2" 
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: "auto" }} 
                              exit={{ opacity: 0, height: 0 }} 
                              transition={{ duration: 0.2 }}
                            >
                              {item.subMenu.length > 0 ? (
                                item.subMenu.map((subItem) => (
                                  <a 
                                    key={subItem.label} 
                                    href={subItem.href} 
                                    className="block py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 p-2 rounded-lg" 
                                    onClick={() => setIsMenuOpen(false)}
                                  >
                                    {subItem.label}
                                  </a>
                                ))
                              ) : (
                                <div className="py-2 px-2 text-sm text-gray-500 dark:text-gray-400 italic">No items</div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <a 
                        href={item.href} 
                        className="block py-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 font-medium p-2 rounded-lg" 
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </a>
                    )}
                  </motion.div>
                ))}
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.3, delay: 0.3 }} 
                  className="pt-4 space-y-3 px-2"
                >
                  {isAuthenticated ? (
                     <>
                         <Button onClick={() => { navigate('/profile'); setIsMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 font-semibold bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-0">
                            <User size={18} /> Profile
                         </Button>
                         <Button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40">
                            <LogOut size={18} /> Logout
                         </Button>
                     </>
                  ) : (
                    <>
                      <Button onClick={handleSignIn} className="w-full font-semibold bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                        Sign In
                      </Button>
                      <Button onClick={handleSignUp} className="w-full font-semibold bg-orange-500 hover:bg-orange-600 text-white border-0">
                        Sign Up
                      </Button>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navigation;