import React from 'react';
import { Brain, TrendingUp, User, Book, Star, Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const theme = {
  primary: '#7C3AED',   // Updated to a rich purple
  secondary: '#9F67FF', // Lighter purple
  accent: '#F0EEFF',    // Super light purple
  text: '#1F2937',      // Dark gray for text
  lightText: '#6B7280', // Light gray for secondary text
};

const Navbar = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Dashboard', icon: TrendingUp },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/diary', label: 'Diary', icon: Book },
    { path: '/aiagents', label: 'AI Agents', icon: Star },
    { path: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
            {/* Logo and Brand Name */}
            <a href="/" className="flex items-center group">
              <div className="relative flex items-center">
                <Brain 
                  size={32} 
                  className="text-primary transform transition-transform group-hover:scale-110 duration-300" 
                  style={{ color: theme.primary }}
                />
                <div className="ml-3 flex flex-col">
                  <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-blue-800"
                    style={{ 
                      '--tw-gradient-from': theme.primary, 
                      '--tw-gradient-to': theme.secondary 
                    }}>
                    MindSync
                  </span>
                  <span className="text-xs text-lightText font-medium">Elevate Your Mind</span>
                </div>
                {/* Decorative Element */}
                <div className="absolute -top-8 -left-8 w-24 h-24 bg-primary opacity-5 rounded-full blur-2xl"></div>
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <a
                    key={path}
                    href={path}
                    className={`
                      relative group flex items-center px-4 py-2 rounded-xl
                      text-sm font-medium transition-all duration-300 ease-out
                      ${isActive 
                        ? 'text-primary bg-accent shadow-sm' 
                        : 'text-lightText hover:text-primary hover:bg-accent'
                      }
                    `}
                    style={{ 
                      backgroundColor: isActive ? theme.accent : '',
                      color: isActive ? theme.primary : ''
                    }}
                  >
                    <Icon size={18} className="mr-2" />
                    {label}
                    
                    {/* Hover Effect */}
                    <div className="absolute inset-0 rounded-xl bg-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-sm bg-white/90 border-t border-gray-100">
        <div className="grid grid-cols-5 gap-1 p-2 max-w-md mx-auto">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <a
                key={path}
                href={path}
                className={`
                  flex flex-col items-center justify-center py-2 px-1 rounded-xl
                  transition-all duration-300 ease-out text-xs font-medium
                  ${isActive 
                    ? 'text-primary bg-accent' 
                    : 'text-lightText hover:text-primary hover:bg-accent'
                  }
                `}
                style={{ 
                  backgroundColor: isActive ? theme.accent : '',
                  color: isActive ? theme.primary : ''
                }}
              >
                <Icon size={20} className="mb-1" />
                <span className="truncate w-full text-center">{label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-20"></div>
    </>
  );
};

export default Navbar;