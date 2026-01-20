import { useState } from "react";
import Button from "../../../components/ui/Button";
import { Menu, X, ChevronDown } from "lucide-react";
import { ThemeToggle } from "../../../components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const navigate = useNavigate();

  const navItems = [
    { href: "/", label: "Home" },
    { 
      href: "/browse", label: "Browse Learning Paths", 
      subMenu: [
        { href: "/category/ai-ml", label: "AI & Machine Learning" },
        { href: "/category/development", label: "Prompt Engineering" },
        { href: "/category/business", label: "BPO Associate" },
        { href: "/category/call-center", label: "Call Center" },
        { href: "/categories", label: "All Categories" }
      ]
    },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/enterprise", label: "For Companies" },
  ];

  const handleSignIn = () => { navigate("/login"); setIsMenuOpen(false); };
  const handleSignUp = () => { navigate("/register"); setIsMenuOpen(false); };
  const toggleSubmenu = (name) => setActiveSubmenu(activeSubmenu === name ? null : name);

  return (
    <motion.nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300" initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.3 }}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <motion.div className="flex items-center" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <img src="https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767653109/vizx_academy_upy2x1.jpg" alt="Vizx Academy Logo" className="h-16 lg:h-16 object-contain cursor-pointer" onClick={() => navigate("/")} />
          </motion.div>
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item, index) => (
              <motion.div key={item.label} className="relative group" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                <motion.a href={item.href} className="flex items-center text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 font-medium text-sm lg:text-base relative py-2 px-3 rounded-lg" whileHover={{ scale: 1.05 }}>{item.label}{item.subMenu && <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />}</motion.a>
                {item.subMenu && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="py-2">{item.subMenu.map((subItem) => (<a key={subItem.label} href={subItem.href} className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">{subItem.label}</a>))}</div>
                  </div>
                )}
              </motion.div>
            ))}
            <ThemeToggle />
            <div className="flex items-center space-x-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Button onClick={handleSignIn} className="font-semibold bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700" size="sm">Sign In</Button></motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Button onClick={handleSignUp} className="font-semibold bg-orange-500 hover:bg-orange-600 text-white border-0" size="sm">Sign Up</Button></motion.div>
            </div>
          </div>
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <motion.div animate={{ rotate: isMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>{isMenuOpen ? <X /> : <Menu />}</motion.div>
            </Button>
          </div>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
              <div className="flex flex-col space-y-2">
                {navItems.map((item, index) => (
                  <motion.div key={item.label} className="relative" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                    {item.subMenu ? (
                      <div className="py-2">
                        <button className="flex items-center justify-between w-full text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 font-medium p-2 rounded-lg" onClick={() => toggleSubmenu(item.label)}><span>{item.label}</span><ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeSubmenu === item.label ? 'rotate-180' : ''}`} /></button>
                        <AnimatePresence>
                          {activeSubmenu === item.label && (
                            <motion.div className="pl-4 mt-2 space-y-2 border-l border-gray-200 dark:border-gray-800 ml-2" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                              {item.subMenu.map((subItem) => (<a key={subItem.label} href={subItem.href} className="block py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 p-2 rounded-lg" onClick={() => setIsMenuOpen(false)}>{subItem.label}</a>))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <a href={item.href} className="block py-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 font-medium p-2 rounded-lg" onClick={() => setIsMenuOpen(false)}>{item.label}</a>
                    )}
                  </motion.div>
                ))}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }} className="pt-4 space-y-3">
                  <Button onClick={handleSignIn} className="w-full font-semibold bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Sign In</Button>
                  <Button onClick={handleSignUp} className="w-full font-semibold bg-orange-500 hover:bg-orange-600 text-white border-0">Sign Up</Button>
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