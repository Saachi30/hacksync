import React from 'react';


import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, } from 'recharts';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Heart, Sun, Moon, Coffee, Activity, Smile, Book, Award, TrendingUp, Calendar, User, PenTool, Settings, Star } from 'lucide-react';

const theme = {
    primary: '#B5838D',
    secondary: '#E5989B',
    tertiary: '#FFB4A2',
    background: '#FFCDB2',
    text: '#6D6875',
    white: '#FFFFFF',
    success: '#97B6A5',
    warning: '#E6B89C',
    error: '#E5989B',
    pastels: ['#FFB4A2', '#E5989B', '#B5838D', '#FFCDB2', '#97B6A5']
  };
const Navbar = () => {
    const location = useLocation();
    const navItems = [
      { path: '/', label: 'Dashboard', icon: TrendingUp },
      { path: '/profile', label: 'Profile', icon: User },
      { path: '/diary', label: 'Diary', icon: Book },
      {path: '/aiagents', label: 'AI Agents', icon: Star},
      { path: '/settings', label: 'Settings', icon: Settings }
    ];
    
    return (
      <nav style={{ backgroundColor: theme.white }} className="shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Heart size={24} color={theme.primary} />
              <span className="text-2xl font-bold" style={{ color: theme.primary }}>
                Wellness Journey
              </span>
            </Link>
            
            <div className="flex space-x-6">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className="flex items-center px-4 py-2 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: location.pathname === path ? theme.background : 'transparent',
                    color: theme.text
                  }}
                >
                  <Icon size={18} className="mr-2" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    );
  };
  
 export default Navbar;