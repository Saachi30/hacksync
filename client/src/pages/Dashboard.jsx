import React, { useState, useEffect } from 'react';
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

const Dashboard = () => {
    const [metrics, setMetrics] = useState({
        sleep: { current: 0, predicted: 0, status: 'maintain' },
        exercise: { current: 0, predicted: 0, status: 'maintain' },
        stress: { current: 0, predicted: 0, status: 'maintain' },
        nutrition: { current: 0, predicted: 0, status: 'maintain' }
      });
    
  const [recommendations, setRecommendations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [trendData] = useState([
    { name: 'Mon', wellness: 85, stress: 45 },
    { name: 'Tue', wellness: 88, stress: 42 },
    { name: 'Wed', wellness: 82, stress: 48 },
    { name: 'Thu', wellness: 89, stress: 38 },
    { name: 'Fri', wellness: 90, stress: 35 },
    { name: 'Sat', wellness: 92, stress: 32 },
    { name: 'Sun', wellness: 91, stress: 34 },
  ]);

  const [activityData] = useState([
    { name: 'Exercise', value: 35 },
    { name: 'Meditation', value: 25 },
    { name: 'Sleep', value: 25 },
    { name: 'Nutrition', value: 15 }
  ]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    const savedMetrics = localStorage.getItem('latestMetrics');
    if (savedMetrics) {
      try {
        const parsedMetrics = JSON.parse(savedMetrics);
        // Transform metrics to match the dashboard format with safety checks
        const formattedMetrics = {};
        Object.entries(parsedMetrics).forEach(([key, value]) => {
          formattedMetrics[key.toLowerCase()] = {
            current: typeof value.current === 'number' ? value.current : 0,
            predicted: typeof value.target === 'number' ? value.target : 0,
            status: value.status || 'maintain'
          };
        });
        setMetrics(formattedMetrics);
      } catch (error) {
        console.error('Error parsing metrics:', error);
      }
    }

    const savedRecommendations = localStorage.getItem('latestRecommendations');
    if (savedRecommendations) {
      try {
        setRecommendations(JSON.parse(savedRecommendations));
      } catch (error) {
        console.error('Error parsing recommendations:', error);
        setRecommendations([]);
      }
    }
  }, []);

  const Calendar = () => {
    const daysInMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0
    ).getDate();
    
    const firstDayOfMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    ).getDay();

    const renderCalendarDays = () => {
      const days = [];
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      weekDays.forEach(day => {
        days.push(
          <div key={`weekday-${day}`} className="w-12 h-8 flex items-center justify-center font-semibold text-gray-600">
            {day}
          </div>
        );
      });

      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(
          <div key={`empty-${i}`} className="w-12 h-12" />
        );
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const isToday = new Date().getDate() === day &&
                       new Date().getMonth() === selectedDate.getMonth() &&
                       new Date().getFullYear() === selectedDate.getFullYear();

        days.push(
          <div
            key={`day-${day}`}
            className={`w-12 h-12 flex items-center justify-center rounded-full cursor-pointer
              ${isToday ? 'bg-blue-500 text-white' : 'hover:bg-blue-100'}`}
            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
          >
            {day}
          </div>
        );
      }

      return days;
    };

    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
            >
              ←
            </button>
            <button
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
            >
              →
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50">
      {/* <h1 className="text-4xl font-bold mb-8 text-blue-600">Wellness Dashboard</h1> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Weekly Wellness Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="wellness" 
                stroke="#0088FE" 
                fill="#0088FE" 
                fillOpacity={0.3}
              />
              <Area 
                type="monotone" 
                dataKey="stress" 
                stroke="#FF8042" 
                fill="#FF8042" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <Calendar />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Activity Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={activityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {activityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {metrics && (
            <div className="grid grid-cols-2 gap-4">
          {Object.entries(metrics).map(([key, value]) => (
            <div 
              key={key} 
              className="bg-white p-4 rounded-xl shadow-md border-l-4 border-blue-500"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {key.replace(/_/g, ' ')}
              </h3>
              <div className="mt-2">
                <div className="text-sm text-blue-600">
                  Current: {(value?.current ?? 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">
                  Target: {(value?.predicted ?? 0).toFixed(1)}
                </div>
                <div 
                  className={`text-sm font-medium mt-1 ${
                    value?.status === 'good' ? 'text-green-500' : 
                    value?.status === 'maintain' ? 'text-yellow-500' : 
                    'text-red-500'
                  }`}
                >
                  Status: {value?.status || 'maintain'}
                </div>
              </div>
            </div>
      
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-blue-600">
          Personalized Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec, index) => (
            <div 
              key={index} 
              className="p-4 rounded-lg bg-gray-50"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {rec.category}
              </h3>
              <div className="text-sm mt-1 text-blue-600">
                Priority: {rec.priority}
              </div>
              <ul className="mt-3 space-y-2">
                {rec.suggestions.map((suggestion, i) => (
                  <li 
                    key={i} 
                    className="flex items-center text-gray-700"
                  >
                    <span className="mr-2">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;