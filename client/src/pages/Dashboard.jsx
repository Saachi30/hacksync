// import React, { useState, useEffect } from 'react';
// import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, } from 'recharts';
// import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
// import { Heart, Sun, Moon, Coffee, Activity, Smile, Book, Award, TrendingUp, Calendar, User, PenTool, Settings, Star } from 'lucide-react';

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

// const Dashboard = () => {
//     const [metrics, setMetrics] = useState({
//         sleep: { current: 0, predicted: 0, status: 'maintain' },
//         exercise: { current: 0, predicted: 0, status: 'maintain' },
//         stress: { current: 0, predicted: 0, status: 'maintain' },
//         nutrition: { current: 0, predicted: 0, status: 'maintain' }
//       });
    
//   const [recommendations, setRecommendations] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [trendData] = useState([
//     { name: 'Mon', wellness: 85, stress: 45 },
//     { name: 'Tue', wellness: 88, stress: 42 },
//     { name: 'Wed', wellness: 82, stress: 48 },
//     { name: 'Thu', wellness: 89, stress: 38 },
//     { name: 'Fri', wellness: 90, stress: 35 },
//     { name: 'Sat', wellness: 92, stress: 32 },
//     { name: 'Sun', wellness: 91, stress: 34 },
//   ]);

//   const [activityData] = useState([
//     { name: 'Exercise', value: 35 },
//     { name: 'Meditation', value: 25 },
//     { name: 'Sleep', value: 25 },
//     { name: 'Nutrition', value: 15 }
//   ]);

//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

//   useEffect(() => {
//     const savedMetrics = localStorage.getItem('latestMetrics');
//     if (savedMetrics) {
//       try {
//         const parsedMetrics = JSON.parse(savedMetrics);
//         // Transform metrics to match the dashboard format with safety checks
//         const formattedMetrics = {};
//         Object.entries(parsedMetrics).forEach(([key, value]) => {
//           formattedMetrics[key.toLowerCase()] = {
//             current: typeof value.current === 'number' ? value.current : 0,
//             predicted: typeof value.target === 'number' ? value.target : 0,
//             status: value.status || 'maintain'
//           };
//         });
//         setMetrics(formattedMetrics);
//       } catch (error) {
//         console.error('Error parsing metrics:', error);
//       }
//     }

//     const savedRecommendations = localStorage.getItem('latestRecommendations');
//     if (savedRecommendations) {
//       try {
//         setRecommendations(JSON.parse(savedRecommendations));
//       } catch (error) {
//         console.error('Error parsing recommendations:', error);
//         setRecommendations([]);
//       }
//     }
//   }, []);

//   const Calendar = () => {
//     const daysInMonth = new Date(
//       selectedDate.getFullYear(),
//       selectedDate.getMonth() + 1,
//       0
//     ).getDate();
    
//     const firstDayOfMonth = new Date(
//       selectedDate.getFullYear(),
//       selectedDate.getMonth(),
//       1
//     ).getDay();

//     const renderCalendarDays = () => {
//       const days = [];
//       const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

//       weekDays.forEach(day => {
//         days.push(
//           <div key={`weekday-${day}`} className="w-12 h-8 flex items-center justify-center font-semibold text-gray-600">
//             {day}
//           </div>
//         );
//       });

//       for (let i = 0; i < firstDayOfMonth; i++) {
//         days.push(
//           <div key={`empty-${i}`} className="w-12 h-12" />
//         );
//       }

//       for (let day = 1; day <= daysInMonth; day++) {
//         const isToday = new Date().getDate() === day &&
//                        new Date().getMonth() === selectedDate.getMonth() &&
//                        new Date().getFullYear() === selectedDate.getFullYear();

//         days.push(
//           <div
//             key={`day-${day}`}
//             className={`w-12 h-12 flex items-center justify-center rounded-full cursor-pointer
//               ${isToday ? 'bg-blue-500 text-white' : 'hover:bg-blue-100'}`}
//             onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
//           >
//             {day}
//           </div>
//         );
//       }

//       return days;
//     };

//     return (
//       <div className="bg-white p-6 rounded-xl shadow-md">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-xl font-semibold text-gray-800">
//             {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
//           </h3>
//           <div className="flex gap-2">
//             <button
//               className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
//               onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
//             >
//               ←
//             </button>
//             <button
//               className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
//               onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
//             >
//               →
//             </button>
//           </div>
//         </div>
//         <div className="grid grid-cols-7 gap-1">
//           {renderCalendarDays()}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="p-8 space-y-8 bg-gray-50">
//       {/* <h1 className="text-4xl font-bold mb-8 text-blue-600">Wellness Dashboard</h1> */}

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <div className="bg-white p-6 rounded-xl shadow-md">
//           <h3 className="text-xl font-semibold mb-4 text-gray-800">
//             Weekly Wellness Trend
//           </h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <AreaChart data={trendData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Area 
//                 type="monotone" 
//                 dataKey="wellness" 
//                 stroke="#0088FE" 
//                 fill="#0088FE" 
//                 fillOpacity={0.3}
//               />
//               <Area 
//                 type="monotone" 
//                 dataKey="stress" 
//                 stroke="#FF8042" 
//                 fill="#FF8042" 
//                 fillOpacity={0.3}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>

//         <Calendar />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <div className="bg-white p-6 rounded-xl shadow-md">
//           <h3 className="text-xl font-semibold mb-4 text-gray-800">
//             Activity Distribution
//           </h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={activityData}
//                 cx="50%"
//                 cy="50%"
//                 labelLine={false}
//                 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                 outerRadius={100}
//                 fill="#8884d8"
//                 dataKey="value"
//               >
//                 {activityData.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         {metrics && (
//             <div className="grid grid-cols-2 gap-4">
//           {Object.entries(metrics).map(([key, value]) => (
//             <div 
//               key={key} 
//               className="bg-white p-4 rounded-xl shadow-md border-l-4 border-blue-500"
//             >
//               <h3 className="text-lg font-semibold text-gray-800">
//                 {key.replace(/_/g, ' ')}
//               </h3>
//               <div className="mt-2">
//                 <div className="text-sm text-blue-600">
//                   Current: {(value?.current ?? 0).toFixed(1)}
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   Target: {(value?.predicted ?? 0).toFixed(1)}
//                 </div>
//                 <div 
//                   className={`text-sm font-medium mt-1 ${
//                     value?.status === 'good' ? 'text-green-500' : 
//                     value?.status === 'maintain' ? 'text-yellow-500' : 
//                     'text-red-500'
//                   }`}
//                 >
//                   Status: {value?.status || 'maintain'}
//                 </div>
//               </div>
//             </div>
      
//             ))}
//           </div>
//         )}
//       </div>

//       <div className="bg-white p-6 rounded-xl shadow-md">
//         <h2 className="text-2xl font-bold mb-6 text-blue-600">
//           Personalized Recommendations
//         </h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {recommendations.map((rec, index) => (
//             <div 
//               key={index} 
//               className="p-4 rounded-lg bg-gray-50"
//             >
//               <h3 className="text-lg font-semibold text-gray-800">
//                 {rec.category}
//               </h3>
//               <div className="text-sm mt-1 text-blue-600">
//                 Priority: {rec.priority}
//               </div>
//               <ul className="mt-3 space-y-2">
//                 {rec.suggestions.map((suggestion, i) => (
//                   <li 
//                     key={i} 
//                     className="flex items-center text-gray-700"
//                   >
//                     <span className="mr-2">•</span>
//                     {suggestion}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Heart, Sun, Moon, Coffee, Activity, Smile, Book, Award, TrendingUp, Calendar, User, PenTool, Settings, Star, X } from 'lucide-react';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    sleep: { current: 0, predicted: 0, status: 'maintain' },
    exercise: { current: 0, predicted: 0, status: 'maintain' },
    stress: { current: 0, predicted: 0, status: 'maintain' },
    nutrition: { current: 0, predicted: 0, status: 'maintain' }
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskList, setShowTaskList] = useState(false);
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    time: '',
    priority: 'medium'
  });

  const [recommendations, setRecommendations] = useState([
    {
      category: 'Sleep',
      priority: 'High',
      suggestions: [
        'Maintain a consistent sleep schedule',
        'Create a relaxing bedtime routine',
        'Aim for 7-8 hours of sleep'
      ]
    },
    {
      category: 'Exercise',
      priority: 'Medium',
      suggestions: [
        'Include 30 minutes of cardio',
        'Add strength training twice a week',
        'Take regular movement breaks'
      ]
    },
    {
      category: 'Nutrition',
      priority: 'High',
      suggestions: [
        'Increase protein intake',
        'Add more vegetables to meals',
        'Stay hydrated throughout the day'
      ]
    },
    {
      category: 'Stress Management',
      priority: 'Medium',
      suggestions: [
        'Practice daily meditation',
        'Take regular breaks',
        'Implement deep breathing exercises'
      ]
    }
  ]);
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

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];
  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const deleteTask = (dateKey, taskIndex) => {
    const updatedTasks = { ...tasks };
    updatedTasks[dateKey].splice(taskIndex, 1);
    if (updatedTasks[dateKey].length === 0) {
      delete updatedTasks[dateKey];
    }
    setTasks(updatedTasks);
    localStorage.setItem('calendarTasks', JSON.stringify(updatedTasks));
  };
  useEffect(() => {
    const savedTasks = localStorage.getItem('calendarTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  const saveTask = () => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    const updatedTasks = {
      ...tasks,
      [dateKey]: [...(tasks[dateKey] || []), newTask]
    };
    setTasks(updatedTasks);
    localStorage.setItem('calendarTasks', JSON.stringify(updatedTasks));
    setShowTaskModal(false);
    setNewTask({ title: '', description: '', time: '', priority: 'medium' });
  };

  const renderCalendar = () => {
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

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = [];

    // Render week days
    weekDays.forEach(day => {
      days.push(
        <div key={`weekday-${day}`} className="w-12 h-8 flex items-center justify-center font-semibold text-gray-600">
          {day}
        </div>
      );
    });

    // Empty cells for days before start of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-12 h-12" />);
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const dateKey = date.toISOString().split('T')[0];
      const hasTask = tasks[dateKey]?.length > 0;
      
      const isToday = new Date().getDate() === day &&
                     new Date().getMonth() === selectedDate.getMonth() &&
                     new Date().getFullYear() === selectedDate.getFullYear();

      days.push(
        <div
          key={`day-${day}`}
          className={`relative w-12 h-12 flex flex-col items-center justify-center rounded-lg cursor-pointer
            transition-all duration-200 hover:scale-110
            ${isToday ? 'bg-indigo-500 text-white' : 'hover:bg-indigo-100'}`}
          onClick={() => {
            setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
            setShowTaskModal(true);
          }}
        >
          {day}
          {hasTask && (
            <div className="absolute bottom-1 w-2 h-2 rounded-full bg-green-500" />
          )}
        </div>
      );
    }

    return days;
  };

  const renderTasksForDate = (date) => {
    const dateKey = date.toISOString().split('T')[0];
    const dateTasks = tasks[dateKey] || [];

    return (
      <div className="mt-4">
        <h4 className="text-lg font-semibold mb-2">
          Tasks for {date.toLocaleDateString()}
        </h4>
        {dateTasks.length === 0 ? (
          <p className="text-gray-500">No tasks scheduled for this date</p>
        ) : (
          <div className="space-y-2">
            {dateTasks.map((task, index) => (
              <div
                key={index}
                className={`${
                  priorityColors[task.priority]
                } p-3 rounded-lg flex justify-between items-start`}
              >
                <div>
                  <h5 className="font-semibold">{task.title}</h5>
                  <p className="text-sm">{task.description}</p>
                  <p className="text-sm mt-1">Time: {task.time}</p>
                </div>
                <button
                  onClick={() => deleteTask(dateKey, index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-indigo-900">Wellness Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg transform hover:scale-[1.02] transition-transform">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
              Weekly Wellness Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="wellness" 
                  stroke="#6366f1" 
                  fill="#6366f1" 
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="stress" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <button
                  className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-600 transition-colors"
                  onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
                >
                  ←
                </button>
                <button
                  className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-600 transition-colors"
                  onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
                >
                  →
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {renderCalendar()}
            </div>
            {renderTasksForDate(selectedDate)}
          </div>
        </div>

        {/* ... [Previous metrics grid section remains the same] ... */}

        {/* Recommendations Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-indigo-900 flex items-center">
            <Award className="w-6 h-6 mr-2 text-indigo-600" />
            Personalized Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 transform hover:scale-[1.02] transition-transform"
              >
                <h3 className="text-lg font-semibold text-indigo-900 flex items-center">
                  {rec.category === 'Sleep' && <Moon className="w-5 h-5 mr-2" />}
                  {rec.category === 'Exercise' && <Activity className="w-5 h-5 mr-2" />}
                  {rec.category === 'Nutrition' && <Coffee className="w-5 h-5 mr-2" />}
                  {rec.category === 'Stress Management' && <Heart className="w-5 h-5 mr-2" />}
                  {rec.category}
                </h3>
                <div className="text-sm mt-1 text-indigo-600 font-medium">
                  Priority: {rec.priority}
                </div>
                <ul className="mt-3 space-y-2">
                  {rec.suggestions.map((suggestion, i) => (
                    <li 
                      key={i}
                      className="flex items-center text-gray-700"
                    >
                      <Star className="w-4 h-4 mr-2 text-indigo-400" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Add Task for {selectedDate.toLocaleDateString()}
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task title"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              />
              <textarea
                placeholder="Description"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              />
              <input
                type="time"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newTask.time}
                onChange={(e) => setNewTask({...newTask, time: e.target.value})}
              />
              <select
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  onClick={() => setShowTaskModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  onClick={saveTask}
                >
                  Save Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;