// import React, { useState, useEffect } from 'react';
// import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, } from 'recharts';
// import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
// import { Heart, Sun, Moon, Coffee, Activity, Smile, Book, Award, TrendingUp, Calendar, User, PenTool, Settings, Star } from 'lucide-react';
// import DiaryEntry from './components/DiaryEntry';
// import Profile from './pages/Profile';
// import Dashboard from './pages/Dashboard';
// import Navbar from './components/Navbar';
// import PersonalLifeAssistant from './pages/Agents';
// import WellnessBot from './components/wellnessbot';
// import HomePage from './pages/Homepage';
// // Theme colors
// const theme = {
//   primary: '#B5838D',
//   secondary: '#E5989B',
//   tertiary: '#FFB4A2',
//   background: '#FFCDB2',
//   text: '#6D6875',
//   white: '#FFFFFF',
//   success: '#97B6A5',
//   warning: '#E6B89C',
//   error: '#E5989B',
//   pastels: ['#FFB4A2', '#E5989B', '#B5838D', '#FFCDB2', '#97B6A5']
// };


// // Navbar Component




// const App = () => {
//   return (
//     <Router>
//       <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
//         <Navbar />
//         <div className="container mx-auto py-8">
//           <Routes>
//             <Route path='/' element={<HomePage/>}/>
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/profile" element={<Profile />} />
//             <Route path="/diary" element={<DiaryEntry />} />
//             <Route path="/aiagents" element={<PersonalLifeAssistant />} />
//             <Route path="/settings" element={<Profile />} /> {/* Temporary redirect to Profile */}
//           </Routes>
//         </div>
//       </div>
//     </Router>
//   );
// };

// export default App;

import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, } from 'recharts';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Heart, Sun, Moon, Coffee, Activity, Smile, Book, Award, TrendingUp, Calendar, User, PenTool, Settings, Star } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import DiaryEntry from './components/DiaryEntry';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import PersonalLifeAssistant from './pages/Agents';
import WellnessBot from './components/wellnessbot';
import HomePage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import Task from './pages/Task';
import GTranslate from './components/GTranslate';
import FacialRecognition from './components/FacialRecognition';
import Analytics from './pages/Analytics';


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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    // Show loading spinner or placeholder while auth state is being checked
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
        {/* Only render Navbar if user is logged in */}
        {currentUser && <Navbar />}
        <GTranslate />
        <div className={`${currentUser ? 'container mx-auto py-8' : ''}`}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/facial" element={<FacialRecognition />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/diary" element={
              <ProtectedRoute>
                <DiaryEntry />
              </ProtectedRoute>
            } />
            <Route path="/aiagents" element={
              <ProtectedRoute>
                <PersonalLifeAssistant />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
             <Route path="/dairy" element={
              <ProtectedRoute>
                <DiaryEntry />
              </ProtectedRoute>
            } />
            <Route path="/taskmanager" element={
              <ProtectedRoute>
                <Task />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            {/* Add a catch-all route to redirect to homepage if route doesn't exist */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;