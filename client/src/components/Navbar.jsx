// import React from 'react';
// import { Brain, TrendingUp, User, Book, Star, Settings } from 'lucide-react';
// import { useLocation } from 'react-router-dom';

// const theme = {
//   primary: '#7C3AED',   // Updated to a rich purple
//   secondary: '#9F67FF', // Lighter purple
//   accent: '#F0EEFF',    // Super light purple
//   text: '#1F2937',      // Dark gray for text
//   lightText: '#6B7280', // Light gray for secondary text
// };

// const Navbar = () => {
//   const location = useLocation();
//   const navItems = [
//     { path: '/', label: 'Dashboard', icon: TrendingUp },
//     { path: '/profile', label: 'Profile', icon: User },
//     { path: '/diary', label: 'Diary', icon: Book },
//     { path: '/aiagents', label: 'AI Agents', icon: Star },
//     { path: '/settings', label: 'Settings', icon: Settings }
//   ];

//   return (
//     <>
//       <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 backdrop-blur-sm bg-white/90">
//         <div className="max-w-7xl mx-auto">
//           <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
//             {/* Logo and Brand Name */}
//             <a href="/" className="flex items-center group">
//               <div className="relative flex items-center">
//                 <Brain 
//                   size={32} 
//                   className="text-primary transform transition-transform group-hover:scale-110 duration-300" 
//                   style={{ color: theme.primary }}
//                 />
//                 <div className="ml-3 flex flex-col">
//                   <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-blue-800"
//                     style={{ 
//                       '--tw-gradient-from': theme.primary, 
//                       '--tw-gradient-to': theme.secondary 
//                     }}>
//                     MindSync
//                   </span>
//                   <span className="text-xs text-lightText font-medium">Elevate Your Mind</span>
//                 </div>
//                 {/* Decorative Element */}
//                 <div className="absolute -top-8 -left-8 w-24 h-24 bg-primary opacity-5 rounded-full blur-2xl"></div>
//               </div>
//             </a>

//             {/* Desktop Navigation */}
//             <div className="hidden md:flex items-center space-x-2">
//               {navItems.map(({ path, label, icon: Icon }) => {
//                 const isActive = location.pathname === path;
//                 return (
//                   <a
//                     key={path}
//                     href={path}
//                     className={`
//                       relative group flex items-center px-4 py-2 rounded-xl
//                       text-sm font-medium transition-all duration-300 ease-out
//                       ${isActive 
//                         ? 'text-primary bg-accent shadow-sm' 
//                         : 'text-lightText hover:text-primary hover:bg-accent'
//                       }
//                     `}
//                     style={{ 
//                       backgroundColor: isActive ? theme.accent : '',
//                       color: isActive ? theme.primary : ''
//                     }}
//                   >
//                     <Icon size={18} className="mr-2" />
//                     {label}
                    
//                     {/* Hover Effect */}
//                     <div className="absolute inset-0 rounded-xl bg-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
//                   </a>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Mobile Navigation */}
//       <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-sm bg-white/90 border-t border-gray-100">
//         <div className="grid grid-cols-5 gap-1 p-2 max-w-md mx-auto">
//           {navItems.map(({ path, label, icon: Icon }) => {
//             const isActive = location.pathname === path;
//             return (
//               <a
//                 key={path}
//                 href={path}
//                 className={`
//                   flex flex-col items-center justify-center py-2 px-1 rounded-xl
//                   transition-all duration-300 ease-out text-xs font-medium
//                   ${isActive 
//                     ? 'text-primary bg-accent' 
//                     : 'text-lightText hover:text-primary hover:bg-accent'
//                   }
//                 `}
//                 style={{ 
//                   backgroundColor: isActive ? theme.accent : '',
//                   color: isActive ? theme.primary : ''
//                 }}
//               >
//                 <Icon size={20} className="mb-1" />
//                 <span className="truncate w-full text-center">{label}</span>
//               </a>
//             );
//           })}
//         </div>
//       </div>

//       {/* Spacer for fixed navbar */}
//       <div className="h-20"></div>
//     </>
//   );
// };

// export default Navbar;


import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Heart, Star, TrendingUp, Book, Settings, User, ChevronDown, Brain, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Make sure the path to firebase is correct

const useScramble = (text, isActive = true, duration = 1000) => {
  const [displayText, setDisplayText] = useState(text);
  
  useEffect(() => {
    if (!isActive) return;
    
    const characters = 'abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()';
    const steps = 11;
    const stepDuration = duration / steps;
    let currentStep = 0;
    let timeoutId;
    
    const scramble = () => {
      if (currentStep >= steps) {
        setDisplayText(text);
        return;
      }
      
      const scrambled = text
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (currentStep / steps > index / text.length) return char;
          return characters[Math.floor(Math.random() * characters.length)];
        })
        .join('');
      
      setDisplayText(scrambled);
      currentStep++;
      timeoutId = setTimeout(scramble, stepDuration);
    };
    
    scramble();
    return () => {
      clearTimeout(timeoutId);
      setDisplayText(text);
    };
  }, [text, isActive, duration]);
  
  return displayText;
};

const NavItem = ({ icon: Icon, label, path, isHovered, onHoverStart, onHoverEnd, onClick }) => {
  const location = useLocation();
  const scrambledText = useScramble(label, isHovered, 500);
  const isActive = location.pathname === path;

  return (
    <motion.div
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      className="relative"
    >
      {onClick ? (
        <div
          onClick={onClick}
          className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer ${
            isActive 
              ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-600' 
              : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 text-gray-700 hover:text-indigo-600'
          }`}
        >
          <Icon className="w-5 h-5 mr-2" />
          <span className="font-medium whitespace-nowrap" style={{ minWidth: `${label.length}ch` }}>
            {scrambledText}
          </span>
        </div>
      ) : (
        <Link
          to={path}
          className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
            isActive 
              ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-600' 
              : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 text-gray-700 hover:text-indigo-600'
          }`}
        >
          <Icon className="w-5 h-5 mr-2" />
          <span className="font-medium whitespace-nowrap" style={{ minWidth: `${label.length}ch` }}>
            {scrambledText}
          </span>
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500"
            />
          )}
        </Link>
      )}
    </motion.div>
  );
};

const DropdownNavItem = ({ label, items, isHovered, onHoverStart, onHoverEnd }) => {
  const scrambledText = useScramble(label, isHovered, 500);
  
  return (
    <motion.div
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      className="relative"
    >
      <div className="flex items-center px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 text-gray-700 hover:text-indigo-600">
        <span className="font-medium whitespace-nowrap mr-1" style={{ minWidth: `${label.length}ch` }}>
          {scrambledText}
        </span>
        <ChevronDown className="w-4 h-4 transition-transform duration-300" style={{ transform: isHovered ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </div>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-1 right-0 w-48 py-2 bg-white rounded-lg shadow-lg border border-indigo-100"
          >
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-indigo-600 transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Navigate to home page after logout
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const navItems = useMemo(() => [
    { label: 'Dashboard', path: '/dashboard', icon: TrendingUp },
    
    {
      label: 'Services',
      type: 'dropdown',
      icon: Star,
      items: [
        { label: 'AI Agents', path: '/aiagents' },
        { label: 'Analytics', path: '/analytics' },
        { label: 'Reports', path: '/reports' },
      ]
    },
    { label: 'Task Manager', path: '/taskmanager', icon: Book },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: "", path: '/profile', icon: User },
    { label: "Logout", icon: LogOut, onClick: handleLogout }
  ], [navigate]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed top-0 w-full z-50 bg-gradient-to-br from-indigo-50 to-purple-50 backdrop-blur-md shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-3">
                <Brain className="w-8 h-8 text-indigo-600" />
                <motion.span 
                  className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  MindSync
                </motion.span>
              </Link>

              <div className="hidden md:flex items-center space-x-2">
                {navItems.map((item) => (
                  item.type === 'dropdown' ? (
                    <DropdownNavItem
                      key={item.label}
                      {...item}
                      isHovered={hoveredItem === item.label}
                      onHoverStart={() => setHoveredItem(item.label)}
                      onHoverEnd={() => setHoveredItem(null)}
                    />
                  ) : (
                    <NavItem
                      key={item.label || item.path}
                      {...item}
                      isHovered={hoveredItem === item.label}
                      onHoverStart={() => setHoveredItem(item.label)}
                      onHoverEnd={() => setHoveredItem(null)}
                    />
                  )
                ))}
              </div>
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default Navbar;