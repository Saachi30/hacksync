import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, } from 'recharts';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Heart, Sun, Moon, Coffee, Activity, Smile, Book, Award, TrendingUp, Calendar, User, PenTool, Settings, Star } from 'lucide-react';
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
  
  const Profile = () => {
    const [profile, setProfile] = useState({
      name: '',
      age: '',
      height: '',
      weight: '',
      goals: '',
      activityLevel: 'moderate',
      preferences: {
        notifications: true,
        dailyReminders: true,
        weeklyReports: true
      }
    });
  
    useEffect(() => {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    }, []);
  
    const handleSubmit = (e) => {
      e.preventDefault();
      localStorage.setItem('userProfile', JSON.stringify(profile));
      
      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg';
      message.style.color = theme.success;
      message.innerHTML = '✨ Profile updated successfully!';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);
    };
  
    const inputClass = `
      mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3
      focus:border-none focus:ring-2 focus:ring-offset-2
      transition-all duration-200
    `;
  
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.background }}
          >
            <User size={32} color={theme.primary} />
          </div>
          <div>
            <h1 className="text-4xl font-bold" style={{ color: theme.primary }}>
              Your Profile
            </h1>
            <p style={{ color: theme.text }}>Keep your information up to date</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md">
          <div className="space-y-6">
            {[
              { label: 'Name', key: 'name', type: 'text', icon: User },
              { label: 'Age', key: 'age', type: 'number', icon: Calendar },
              { label: 'Height (cm)', key: 'height', type: 'number', icon: TrendingUp },
              { label: 'Weight (kg)', key: 'weight', type: 'number', icon: Activity }
            ].map(({ label, key, type, icon: Icon }) => (
              <div key={key}>
                <label className="flex items-center text-sm font-medium" style={{ color: theme.text }}>
                  <Icon size={16} className="mr-2" />
                  {label}
                </label>
                <input
                  type={type}
                  value={profile[key]}
                  onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                  className={inputClass}
                  style={{ backgroundColor: theme.background }}
                />
              </div>
            ))}
            
            <div>
              <label className="flex items-center text-sm font-medium" style={{ color: theme.text }}>
                <Activity size={16} className="mr-2" />
                Activity Level
              </label>
              <select
                value={profile.activityLevel}
                onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}
                className={inputClass}
                style={{ backgroundColor: theme.background }}
              >
                {['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'].map(level => (
                  <option key={level.toLowerCase()} value={level.toLowerCase()}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="flex items-center text-sm font-medium" style={{ color: theme.text }}>
                <Star size={16} className="mr-2" />
                Wellness Goals
              </label>
              <textarea
                value={profile.goals}
                onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
                rows="4"
                className={inputClass}
                style={{ backgroundColor: theme.background }}
                placeholder="What are your wellness goals?"
              />
            </div>
  
            {/* Preferences Section */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>
                Preferences
              </h3>
              {Object.entries(profile.preferences).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <label className="flex items-center text-sm" style={{ color: theme.text }}>
                    <Settings size={16} className="mr-2" />
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => 
                      setProfile({
                        ...profile,
                        preferences: {
                          ...profile.preferences,
                          [key]: e.target.checked
                        }
                      })
                    }
                    className="w-5 h-5 rounded"
                    style={{ accentColor: theme.primary }}
                  />
                </div>
              ))}
            </div>
            
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg text-white font-medium
                       transition-all duration-200 hover:opacity-90 flex items-center justify-center"
              style={{ backgroundColor: theme.primary }}
            >
              <Award size={20} className="mr-2" />
              Save Profile
            </button>
          </div>
        </form>
      </div>
    );
  };

  export default Profile;