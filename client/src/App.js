import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, } from 'recharts';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Heart, Sun, Moon, Coffee, Activity, Smile, Book, Award, TrendingUp, Calendar, User, PenTool, Settings, Star } from 'lucide-react';
import DiaryEntry from './components/DiaryEntry';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import PersonalLifeAssistant from './pages/Agents';
import WellnessBot from './components/wellnessbot';
// Theme colors
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


// Navbar Component




const App = () => {
  return (
    <Router>
      <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
        <Navbar />
        <div className="container mx-auto py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/diary" element={<DiaryEntry />} />
            <Route path="/aiagents" element={<PersonalLifeAssistant />} />
            <Route path="/settings" element={<Profile />} /> {/* Temporary redirect to Profile */}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;