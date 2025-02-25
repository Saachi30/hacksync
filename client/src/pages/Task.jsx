// import React, { useState, useEffect, useRef } from 'react';
// import { Calendar, Moon, Sun, Coffee, Activity, Heart, Smile, Book, Award, 
//   TrendingUp, User, PenTool, Settings, Star, X, Bell, Clock, Brain, AlertTriangle } from 'lucide-react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import TodoList from '../components/ToDo';
// import AISchedulerChatbot from './Schedular';
// const Task = () => {
//   // State for calendar and tasks
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [showTaskModal, setShowTaskModal] = useState(false);
//   const [tasks, setTasks] = useState({});
//   const [newTask, setNewTask] = useState({
//     title: '',
//     description: '',
//     startTime: '',
//     endTime: '',
//     priority: 'medium',
//     completed: false
//   });
  
//   // Notifications state
//   const [notifications, setNotifications] = useState([]);
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [unreadCount, setUnreadCount] = useState(0);
  
//   // AI Recommendations state
//   const [recommendations, setRecommendations] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [taskStats, setTaskStats] = useState({
//     total: 0,
//     completed: 0,
//     overdue: 0,
//     upcoming: 0,
//     highPriority: 0
//   });
  
//   // Task analytics data
//   const [analyticsData, setAnalyticsData] = useState([]);
  
//   // Notification sound
//   const notificationSound = useRef(null);
  
//   // Mock Gemini API call for recommendations
//   const getAIRecommendations = async () => {
//     setIsLoading(true);
    
//     try {
//       // In a real implementation, this would be an API call to Gemini
//       // Here we'll simulate the response with a delay
//       await new Promise(resolve => setTimeout(resolve, 1500));
      
//       // Generate recommendations based on task stats
//       const newRecommendations = [];
      
//       if (taskStats.overdue > 3) {
//         newRecommendations.push({
//           type: 'warning',
//           title: 'Task Overload Detected',
//           message: 'You have several overdue tasks. Consider rescheduling or delegating some of them.',
//           actions: ['Reschedule Tasks', 'View Overdue Tasks']
//         });
//       }
      
//       if (taskStats.highPriority > 5) {
//         newRecommendations.push({
//           type: 'priority',
//           title: 'High Priority Task Management',
//           message: 'You have multiple high-priority tasks. Consider spreading them throughout the week instead of concentrating them on specific days.',
//           actions: ['Rebalance Tasks', 'View High Priority']
//         });
//       }
      
//       if (taskStats.completed / taskStats.total < 0.4 && taskStats.total > 10) {
//         newRecommendations.push({
//           type: 'productivity',
//           title: 'Productivity Enhancement',
//           message: 'Your task completion rate is below 40%. Consider using time-blocking techniques or breaking down larger tasks into smaller, manageable chunks.',
//           actions: ['Learn Time-Blocking', 'Task Breakdown Guide']
//         });
//       }
      
//       // Default recommendation if no conditions are met
//       if (newRecommendations.length === 0) {
//         newRecommendations.push({
//           type: 'productivity',
//           title: 'Maintain Your Productivity',
//           message: 'Your task management looks good. Continue with your current approach and consider adding time for breaks between intensive tasks.',
//           actions: ['Schedule Breaks', 'View Task Analytics']
//         });
//       }
      
//       setRecommendations(newRecommendations);
//     } catch (error) {
//       console.error('Error getting AI recommendations:', error);
//       setRecommendations([{
//         type: 'error',
//         title: 'Recommendation Error',
//         message: 'Unable to generate recommendations at this time. Please try again later.',
//         actions: ['Retry']
//       }]);
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   // Check for upcoming tasks and create notifications
//   const checkUpcomingTasks = () => {
//     const now = new Date();
//     const upcoming = [];
//     let newUnreadCount = unreadCount;
    
//     // Check all tasks for the current day
//     const todayKey = now.toISOString().split('T')[0];
//     const todayTasks = tasks[todayKey] || [];
    
//     todayTasks.forEach(task => {
//       if (task.completed) return;
      
//       if (task.startTime) {
//         const [hours, minutes] = task.startTime.split(':').map(Number);
//         const taskTime = new Date();
//         taskTime.setHours(hours, minutes, 0, 0);
        
//         // Task starting in the next 30 minutes
//         const timeDiff = (taskTime - now) / (1000 * 60); // difference in minutes
        
//         if (timeDiff >= 0 && timeDiff <= 30) {
//           const notification = {
//             id: Date.now() + Math.random().toString(),
//             title: `Upcoming Task: ${task.title}`,
//             message: `Starting in ${Math.floor(timeDiff)} minutes`,
//             time: now.toLocaleTimeString(),
//             read: false,
//             task: task
//           };
          
//           // Check if we already have this notification
//           const exists = notifications.some(n => 
//             n.title === notification.title && 
//             n.message === notification.message
//           );
          
//           if (!exists) {
//             upcoming.push(notification);
//             newUnreadCount++;
            
//             // Play notification sound
//             if (notificationSound.current) {
//               notificationSound.current.play().catch(e => console.log('Audio play failed:', e));
//             }
//           }
//         }
//       }
//     });
    
//     if (upcoming.length > 0) {
//       setNotifications(prev => [...upcoming, ...prev]);
//       setUnreadCount(newUnreadCount);
//     }
//   };
  
//   // Load tasks from localStorage on component mount
//   useEffect(() => {
//     const savedTasks = localStorage.getItem('calendarTasks');
//     if (savedTasks) {
//       setTasks(JSON.parse(savedTasks));
//     }
    
//     // Set up notification sound
//     notificationSound.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-alert-2573.mp3');
    
//     // Set up task checker interval (every minute)
//     const intervalId = setInterval(checkUpcomingTasks, 60000);
    
//     // Initial check
//     checkUpcomingTasks();
    
//     return () => clearInterval(intervalId);
//   }, []);
  
//   // Update localStorage when tasks change
//   useEffect(() => {
//     localStorage.setItem('calendarTasks', JSON.stringify(tasks));
    
//     // Calculate task statistics when tasks change
//     calculateTaskStats();
//     updateAnalyticsData();
//   }, [tasks]);
  
//   // Get AI recommendations when task stats change
//   useEffect(() => {
//     if (taskStats.total > 0) {
//       getAIRecommendations();
//     }
//   }, [taskStats]);
  
//   // Calculate task statistics
//   const calculateTaskStats = () => {
//     const now = new Date();
//     const today = now.toISOString().split('T')[0];
    
//     let total = 0;
//     let completed = 0;
//     let overdue = 0;
//     let upcoming = 0;
//     let highPriority = 0;
    
//     Object.entries(tasks).forEach(([dateKey, dateTasks]) => {
//       dateTasks.forEach(task => {
//         total++;
        
//         if (task.completed) {
//           completed++;
//         } else if (dateKey < today) {
//           overdue++;
//         } else if (dateKey === today) {
//           upcoming++;
//         }
        
//         if (task.priority === 'high') {
//           highPriority++;
//         }
//       });
//     });
    
//     setTaskStats({
//       total,
//       completed,
//       overdue,
//       upcoming,
//       highPriority
//     });
//   };
  
//   // Update analytics data for the chart
//   const updateAnalyticsData = () => {
//     const data = [];
//     const today = new Date();
    
//     // Create data for the past week
//     for (let i = 6; i >= 0; i--) {
//       const date = new Date(today);
//       date.setDate(today.getDate() - i);
//       const dateKey = date.toISOString().split('T')[0];
//       const dateTasks = tasks[dateKey] || [];
      
//       const completed = dateTasks.filter(task => task.completed).length;
//       const total = dateTasks.length;
      
//       data.push({
//         date: date.toLocaleDateString('en-US', { weekday: 'short' }),
//         total,
//         completed,
//         completion: total > 0 ? Math.round((completed / total) * 100) : 0
//       });
//     }
    
//     setAnalyticsData(data);
//   };
  
//   // Save task to state and localStorage
//   const saveTask = () => {
//     if (!newTask.title || !newTask.startTime) {
//       alert('Task title and start time are required!');
//       return;
//     }
    
//     const dateKey = selectedDate.toISOString().split('T')[0];
//     const updatedTasks = {
//       ...tasks,
//       [dateKey]: [...(tasks[dateKey] || []), newTask]
//     };
    
//     setTasks(updatedTasks);
//     setShowTaskModal(false);
//     setNewTask({
//       title: '',
//       description: '',
//       startTime: '',
//       endTime: '',
//       priority: 'medium',
//       completed: false
//     });
    
//     // Add a notification about the new task
//     const notification = {
//       id: Date.now(),
//       title: 'Task Created',
//       message: `"${newTask.title}" scheduled for ${selectedDate.toLocaleDateString()}`,
//       time: new Date().toLocaleTimeString(),
//       read: false
//     };
    
//     setNotifications(prev => [notification, ...prev]);
//     setUnreadCount(prev => prev + 1);
//   };
  
//   // Delete task
//   const deleteTask = (dateKey, taskIndex) => {
//     const updatedTasks = { ...tasks };
//     updatedTasks[dateKey].splice(taskIndex, 1);
    
//     if (updatedTasks[dateKey].length === 0) {
//       delete updatedTasks[dateKey];
//     }
    
//     setTasks(updatedTasks);
    
//     // Add notification about deleted task
//     const notification = {
//       id: Date.now(),
//       title: 'Task Deleted',
//       message: `Task removed from ${new Date(dateKey).toLocaleDateString()}`,
//       time: new Date().toLocaleTimeString(),
//       read: false
//     };
    
//     setNotifications(prev => [notification, ...prev]);
//     setUnreadCount(prev => prev + 1);
//   };
  
//   // Toggle task completion
//   const toggleTaskCompletion = (dateKey, taskIndex) => {
//     const updatedTasks = { ...tasks };
//     const task = updatedTasks[dateKey][taskIndex];
//     task.completed = !task.completed;
    
//     setTasks(updatedTasks);
    
//     // Add notification about task completion
//     if (task.completed) {
//       const notification = {
//         id: Date.now(),
//         title: 'Task Completed',
//         message: `"${task.title}" marked as completed`,
//         time: new Date().toLocaleTimeString(),
//         read: false
//       };
      
//       setNotifications(prev => [notification, ...prev]);
//       setUnreadCount(prev => prev + 1);
//     }
//   };
  
//   // Mark all notifications as read
//   const markAllAsRead = () => {
//     setNotifications(notifications.map(notification => ({
//       ...notification,
//       read: true
//     })));
//     setUnreadCount(0);
//   };
  
//   // Clear all notifications
//   const clearAllNotifications = () => {
//     setNotifications([]);
//     setUnreadCount(0);
//   };
  
//   // Previous month
//   const prevMonth = () => {
//     setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
//   };
  
//   // Next month
//   const nextMonth = () => {
//     setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
//   };
  
//   // Today button
//   const goToToday = () => {
//     const today = new Date();
//     setCurrentMonth(today);
//     setSelectedDate(today);
//   };
  
//   // Calendar rendering
//   const renderCalendar = () => {
//     const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
//     const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
//     const startDate = new Date(monthStart);
//     const endDate = new Date(monthEnd);
    
//     // Adjust the start date to be the beginning of the week
//     const day = startDate.getDay();
//     startDate.setDate(startDate.getDate() - day);
    
//     // Adjust the end date to be the end of the week
//     const endDay = endDate.getDay();
//     endDate.setDate(endDate.getDate() + (6 - endDay));
    
//     const rows = [];
//     let days = [];
//     let currentDate = new Date(startDate);
    
//     // Days of the week
//     const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//     const headerCells = weekDays.map(day => (
//       <div key={`weekday-${day}`} className="w-12 h-8 flex items-center justify-center font-semibold text-gray-600">
//         {day}
//       </div>
//     ));
    
//     // Build the days
//     while (currentDate <= endDate) {
//       for (let i = 0; i < 7; i++) {
//         const dateKey = currentDate.toISOString().split('T')[0];
//         const hasTask = tasks[dateKey]?.length > 0;
//         const isDifferentMonth = currentDate.getMonth() !== currentMonth.getMonth();
//         const isToday = new Date().toDateString() === currentDate.toDateString();
//         const isSelected = selectedDate.toDateString() === currentDate.toDateString();
        
//         // Calculate completion for the day
//         const dayTasks = tasks[dateKey] || [];
//         const completedTasks = dayTasks.filter(task => task.completed).length;
//         const completionPercentage = dayTasks.length ? completedTasks / dayTasks.length : 0;
        
//         days.push(
//           <div
//             key={currentDate.toDateString()}
//             className={`relative w-12 h-12 flex flex-col items-center justify-center rounded-lg cursor-pointer
//               transition-all duration-200 hover:scale-110
//               ${isToday ? 'bg-indigo-500 text-white' : ''}
//               ${isSelected && !isToday ? 'bg-indigo-200' : ''}
//               ${isDifferentMonth ? 'text-gray-400' : 'hover:bg-indigo-100'}`}
//             onClick={() => {
//               setSelectedDate(new Date(currentDate));
//               if (dayTasks.length > 0) {
//                 setShowTaskModal(false); // Don't open task modal if there are already tasks
//               } else {
//                 setShowTaskModal(true);
//               }
//             }}
//           >
//             {currentDate.getDate()}
            
//             {/* Task indicator */}
//             {hasTask && (
//               <div className="absolute bottom-1 flex space-x-0.5">
//                 {completionPercentage > 0 && (
//                   <div 
//                     className="h-1.5 rounded-full bg-green-500" 
//                     style={{ width: `${completionPercentage * 6}px` }}
//                   />
//                 )}
//                 {completionPercentage < 1 && (
//                   <div 
//                     className="h-1.5 rounded-full bg-indigo-500" 
//                     style={{ width: `${(1 - completionPercentage) * 6}px` }}
//                   />
//                 )}
//               </div>
//             )}
//           </div>
//         );
        
//         const newDate = new Date(currentDate);
//         newDate.setDate(currentDate.getDate() + 1);
//         currentDate = newDate;
//       }
      
//       rows.push(
//         <div key={currentDate.toDateString()} className="grid grid-cols-7 gap-2">
//           {days}
//         </div>
//       );
//       days = [];
//     }
    
//     return (
//       <>
//         <div className="grid grid-cols-7 gap-2 mb-2">
//           {headerCells}
//         </div>
//         {rows}
//       </>
//     );
//   };
  
//   // Render tasks for selected date
//   const renderTasksForDate = (date) => {
//     const dateKey = date.toISOString().split('T')[0];
//     const dateTasks = tasks[dateKey] || [];
//     const sortedTasks = [...dateTasks].sort((a, b) => {
//       // Sort by time if available
//       if (a.startTime && b.startTime) {
//         return a.startTime.localeCompare(b.startTime);
//       }
//       return 0;
//     });
    
//     const priorityColors = {
//       low: 'bg-blue-100 text-blue-800 border-l-blue-500',
//       medium: 'bg-yellow-100 text-yellow-800 border-l-yellow-500',
//       high: 'bg-red-100 text-red-800 border-l-red-500'
//     };
    
//     return (
//       <div className="mt-4 overflow-y-auto max-h-[50vh]">
//         <div className="flex justify-between items-center mb-2">
//           <h4 className="text-lg font-semibold text-gray-800">
//             Tasks for {date.toLocaleDateString()}
//           </h4>
//           <button
//             onClick={() => {
//               setShowTaskModal(true);
//               setNewTask({
//                 title: '',
//                 description: '',
//                 startTime: '',
//                 endTime: '',
//                 priority: 'medium',
//                 completed: false
//               });
//             }}
//             className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
//           >
//             Add Task
//           </button>
//         </div>
        
//         {sortedTasks.length === 0 ? (
//           <p className="text-gray-500 text-center py-4">No tasks scheduled for this date</p>
//         ) : (
//           <div className="space-y-2">
//             {sortedTasks.map((task, index) => (
//               <div
//                 key={index}
//                 className={`${
//                   priorityColors[task.priority]
//                 } p-3 rounded-lg flex justify-between items-start border-l-4 ${
//                   task.completed ? 'opacity-60' : ''
//                 }`}
//               >
//                 <div className="flex items-start space-x-3">
//                   <input
//                     type="checkbox"
//                     checked={task.completed}
//                     onChange={() => toggleTaskCompletion(dateKey, index)}
//                     className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                   />
//                   <div>
//                     <h5 className={`font-semibold ${task.completed ? 'line-through' : ''}`}>
//                       {task.title}
//                     </h5>
//                     {task.description && (
//                       <p className="text-sm mt-1">{task.description}</p>
//                     )}
//                     <div className="text-sm mt-2 flex items-center space-x-3">
//                       {task.startTime && (
//                         <span className="flex items-center">
//                           <Clock className="w-4 h-4 mr-1" />
//                           {task.startTime}
//                           {task.endTime && ` - ${task.endTime}`}
//                         </span>
//                       )}
//                       <span className="capitalize">
//                         {task.priority} priority
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => deleteTask(dateKey, index)}
//                   className="text-gray-500 hover:text-red-500 ml-2"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   };
  
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8 mt-12">
//       {/* Notification sound */}
//       <audio ref={notificationSound} preload="auto" />
      
//       {/* Navbar with notification bell */}
//       <div className=" ">
//         <div className="max-w-7xl mx-auto ">
//           {/* <div className="flex items-center">
//             <Brain className="w-8 h-8 text-indigo-600 mr-2" />
//             <h1 className="text-2xl font-bold text-indigo-900">TaskSync</h1>
//           </div> */}
          
         
//         </div>
//       </div>
      
//       <div className="max-w-7xl mx-auto space-y-8">
//         <div className="flex items-center justify-between">
//           <h2 className="text-3xl font-bold text-indigo-900">Task Calendar</h2>
//           <div className="flex space-x-2">
//             <button 
//               className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
//               onClick={goToToday}
//             >
//               Today
//             </button>
//             <button 
//               className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
//               onClick={() => {
//                 setShowTaskModal(true);
//                 setNewTask({
//                   title: '',
//                   description: '',
//                   startTime: '',
//                   endTime: '',
//                   priority: 'medium',
//                   completed: false
//                 });
//               }}
//             >
//               New Task
//             </button>
//             <h1>  </h1>
//             <div className="flex items-center space-x-4">
//             <div className="relative">
//               <button 
//                 className="relative rounded-full p-2 bg-indigo-100 hover:bg-indigo-200 transition-colors"
//                 onClick={() => setShowNotifications(!showNotifications)}
//               >
//                 <Bell className="w-5 h-5 text-indigo-600" />
//                 {unreadCount > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                     {unreadCount > 9 ? '9+' : unreadCount}
//                   </span>
//                 )}
//               </button>
              
//               {/* Notifications dropdown */}
//               {showNotifications && (
//                 <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
//                   <div className="p-3 border-b flex justify-between items-center">
//                     <h3 className="font-semibold">Notifications</h3>
//                     <div className="flex space-x-2">
//                       <button 
//                         className="text-xs text-indigo-600 hover:text-indigo-800"
//                         onClick={markAllAsRead}
//                       >
//                         Mark all as read
//                       </button>
//                       <button 
//                         className="text-xs text-gray-500 hover:text-gray-700"
//                         onClick={clearAllNotifications}
//                       >
//                         Clear all
//                       </button>
//                     </div>
//                   </div>
                  
//                   {notifications.length === 0 ? (
//                     <div className="p-4 text-center text-gray-500">
//                       No notifications
//                     </div>
//                   ) : (
//                     notifications.map(notification => (
//                       <div 
//                         key={notification.id}
//                         className={`p-3 border-b hover:bg-gray-50 ${!notification.read ? 'bg-indigo-50' : ''}`}
//                         onClick={() => {
//                           // Mark as read
//                           setNotifications(notifications.map(n => 
//                             n.id === notification.id ? { ...n, read: true } : n
//                           ));
//                           if (!notification.read) {
//                             setUnreadCount(prev => prev - 1);
//                           }
                          
//                           // If notification is about an upcoming task, close dropdown
//                           if (notification.task) {
//                             setShowNotifications(false);
//                             // Select the date of the task
//                             const date = new Date();
//                             setSelectedDate(date);
//                           }
//                         }}
//                       >
//                         <div className="flex justify-between">
//                           <h4 className="font-medium text-sm">{notification.title}</h4>
//                           <span className="text-xs text-gray-500">{notification.time}</span>
//                         </div>
//                         <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               )}
//             </div>
            
//             {/* <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
//               <User className="w-5 h-5 text-indigo-600" />
//             </div> */}
//           </div>
//           </div>
//         </div>
        
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Calendar Section */}
//           <div className="bg-white p-6 rounded-2xl shadow-lg">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-xl font-semibold text-gray-800 flex items-center">
//                 <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
//                 {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
//               </h3>
//               <div className="flex gap-2">
//                 <button
//                   className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-600 transition-colors"
//                   onClick={prevMonth}
//                 >
//                   ←
//                 </button>
//                 <button
//                   className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-600 transition-colors"
//                   onClick={nextMonth}
//                 >
//                   →
//                 </button>
//               </div>
//             </div>
            
//             {renderCalendar()}
//             {renderTasksForDate(selectedDate)}
//           </div>
          
//           {/* Analytics and Recommendations */}
//           <div className="space-y-6">
//             {/* Task Analytics */}
//             <div className="bg-white p-6 rounded-2xl shadow-lg">
//               <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
//                 <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
//                 Task Completion Trend
//               </h3>
//               <div className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={analyticsData}>
//                     <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
//                     <XAxis dataKey="date" />
//                     <YAxis />
//                     <Tooltip 
//                       contentStyle={{ 
//                         backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                         borderRadius: '8px',
//                         border: 'none',
//                         boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
//                       }}
//                     />
//                     <Legend />
//                     <Line 
//                       type="monotone" 
//                       dataKey="total" 
//                       name="Total Tasks"
//                       stroke="#6366f1" 
//                       activeDot={{ r: 8 }}
//                     />
//                     <Line 
//                       type="monotone" 
//                       dataKey="completed" 
//                       name="Completed"
//                       stroke="#10b981" 
//                     />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
              
//               <div className="grid grid-cols-4 gap-2 mt-4">
//                 <div className="bg-indigo-50 p-3 rounded-lg">
//                   <div className="text-sm text-indigo-600">Total</div>
//                   <div className="text-xl font-bold">{taskStats.total}</div>
//                 </div>
//                 <div className="bg-green-50 p-3 rounded-lg">
//                   <div className="text-sm text-green-600">Completed</div>
//                   <div className="text-xl font-bold">{taskStats.completed}</div>
//                 </div>
//                 <div className="bg-red-50 p-3 rounded-lg">
//                   <div className="text-sm text-red-600">Overdue</div>
//                   <div className="text-xl font-bold">{taskStats.overdue}</div>
//                 </div>
//                 <div className="bg-yellow-50 p-3 rounded-lg">
//                   <div className="text-sm text-yellow-600">High Priority</div>
//                   <div className="text-xl font-bold">{taskStats.highPriority}</div>
//                 </div>
//               </div>
//             </div>
            
//             {/* AI Recommendations */}
//             <div className="bg-white p-6 rounded-2xl shadow-lg">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-xl font-semibold text-gray-800 flex items-center">
//                   <Brain className="w-5 h-5 mr-2 text-indigo-600" />
//                   AI Recommendations
//                 </h3>
//                 {isLoading && (
//                   <div className="text-sm text-indigo-600">Analyzing your tasks...</div>
//                 )}
//               </div>
              
//               {recommendations.length === 0 && !isLoading ? (
//                 <div className="bg-gray-50 p-4 rounded-lg text-center">
//                 <div className="text-gray-500">
//                   No recommendations available yet. Add more tasks to get started.
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {recommendations.map((rec, index) => {
//                   const iconMap = {
//                     warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
//                     priority: <Star className="w-5 h-5 text-orange-500" />,
//                     productivity: <TrendingUp className="w-5 h-5 text-green-500" />,
//                     error: <X className="w-5 h-5 text-red-500" />
//                   };
                  
//                   return (
//                     <div key={index} className="bg-indigo-50 p-4 rounded-lg">
//                       <div className="flex items-start">
//                         <div className="mr-3 mt-1">
//                           {iconMap[rec.type]}
//                         </div>
//                         <div>
//                           <h4 className="font-semibold text-indigo-900">{rec.title}</h4>
//                           <p className="text-sm text-indigo-800 mt-1">{rec.message}</p>
//                           <div className="flex mt-3 space-x-2">
//                             {rec.actions.map((action, i) => (
//                               <button 
//                                 key={i} 
//                                 className={`text-xs px-3 py-1 rounded-full ${
//                                   i === 0 
//                                     ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
//                                     : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
//                                 }`}
//                               >
//                                 {action}
//                               </button>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
          
//         </div>
//         <TodoList />
//       </div>
//     </div>
    
//     {/* New Task Modal */}
//     {showTaskModal && (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-xl p-6 w-full max-w-md">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-xl font-semibold text-gray-800">
//               {newTask.title ? 'Edit Task' : 'New Task'}
//             </h3>
//             <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-600">
//               <X className="w-5 h-5" />
//             </button>
//           </div>
          
//           <form onSubmit={(e) => {
//             e.preventDefault();
//             saveTask();
//           }}>
//             <div className="space-y-4">
//               <div>
//                 <label htmlFor="title" className="block text-sm font-medium text-gray-700">
//                   Task Title*
//                 </label>
//                 <input
//                   type="text"
//                   id="title"
//                   value={newTask.title}
//                   onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   placeholder="Enter task title"
//                   required
//                 />
//               </div>
              
//               <div>
//                 <label htmlFor="description" className="block text-sm font-medium text-gray-700">
//                   Description
//                 </label>
//                 <textarea
//                   id="description"
//                   value={newTask.description}
//                   onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
//                   rows={3}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   placeholder="Enter task description"
//                 />
//               </div>
              
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
//                     Start Time*
//                   </label>
//                   <input
//                     type="time"
//                     id="startTime"
//                     value={newTask.startTime}
//                     onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
//                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
//                     End Time
//                   </label>
//                   <input
//                     type="time"
//                     id="endTime"
//                     value={newTask.endTime}
//                     onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
//                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                 </div>
//               </div>
              
//               <div>
//                 <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
//                   Priority
//                 </label>
//                 <select
//                   id="priority"
//                   value={newTask.priority}
//                   onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
//                   className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 >
//                   <option value="low">Low</option>
//                   <option value="medium">Medium</option>
//                   <option value="high">High</option>
//                 </select>
//               </div>
//             </div>
            
//             <div className="mt-6 flex justify-end space-x-3">
//               <button
//                 type="button"
//                 onClick={() => setShowTaskModal(false)}
//                 className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               >
//                 Save Task
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     )}
//     <AISchedulerChatbot/>
//   </div>
// );
// };

// export default Task;


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Moon, Sun, Coffee, Activity, Heart, Smile, Book, Award, 
  TrendingUp, User, PenTool, Settings, Star, X, Bell, Clock, Brain, AlertTriangle, Mail, MessageCircle, Send } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TodoList from '../components/ToDo';

// Importing AI Scheduler Components
const QUERY_TYPES = {
  schedule: [
    'schedule a meeting', 'create an event', 'add to calendar', 
    'book appointment', 'set up a call', 'plan a meeting',
    'organize event', 'schedule time', 'create reminder',
    'plan lunch', 'set a meeting', 'book a time slot',
    'need to meet', 'put on calendar', 'reserve time',
    'meeting tomorrow', 'meeting next week', 'schedule for monday'
  ],
  email: [
    'send email', 'mail the schedule', 'share via email', 
    'email calendar', 'send the itinerary', 'forward schedule',
    'email my events', 'share calendar', 'send my schedule',
    'email the meetings', 'send out calendar'
  ],
  priority: [
    'high priority', 'urgent', 'important', 'critical',
    'top priority', 'essential', 'crucial', 'main focus',
    'must not miss', 'vital meeting', 'key appointment'
  ]
};

const Task = () => {
  // Original state for calendar and tasks
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    priority: 'medium',
    completed: false
  });
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // AI Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    overdue: 0,
    upcoming: 0,
    highPriority: 0
  });
  
  // Task analytics data
  const [analyticsData, setAnalyticsData] = useState([]);
  
  // Notification sound
  const notificationSound = useRef(null);
  
  // AI Scheduler state
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { type: 'bot', text: 'Hi! I can help you schedule tasks and meetings. Just tell me what you need to schedule and when.' }
  ]);
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);
  
  // Parse AI input for scheduling
  const parseScheduleInput = (input) => {
    // Simple parsing to extract date, time, and task title
    let title = input;
    let date = new Date(selectedDate);
    let startTime = '';
    let endTime = '';
    let priority = 'medium';
    
    // Check for date patterns
    const datePatterns = [
      { regex: /today/i, handler: () => new Date() },
      { regex: /tomorrow/i, handler: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; } },
      { regex: /next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, handler: (match) => {
        const days = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0 };
        const dayNum = days[match[1].toLowerCase()];
        const d = new Date();
        const diff = (dayNum - d.getDay() + 7) % 7 + 1;
        d.setDate(d.getDate() + diff);
        return d;
      }},
      { regex: /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/i, handler: (match) => {
        const month = parseInt(match[1]) - 1;
        const day = parseInt(match[2]);
        let year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
        if (year < 100) year += 2000;
        return new Date(year, month, day);
      }}
    ];
    
    for (const pattern of datePatterns) {
      const match = input.match(pattern.regex);
      if (match) {
        date = pattern.handler(match);
        break;
      }
    }
    
    // Check for time patterns
    const timePattern = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?(?:\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i;
    const timeMatch = input.match(timePattern);
    if (timeMatch) {
      let startHour = parseInt(timeMatch[1]);
      const startMinute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const startAmPm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;
      
      if (startAmPm === 'pm' && startHour < 12) startHour += 12;
      if (startAmPm === 'am' && startHour === 12) startHour = 0;
      
      startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
      
      if (timeMatch[4]) {
        let endHour = parseInt(timeMatch[4]);
        const endMinute = timeMatch[5] ? parseInt(timeMatch[5]) : 0;
        const endAmPm = timeMatch[6] ? timeMatch[6].toLowerCase() : startAmPm;
        
        if (endAmPm === 'pm' && endHour < 12) endHour += 12;
        if (endAmPm === 'am' && endHour === 12) endHour = 0;
        
        endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      }
      
      // Remove the time part from the title
      title = title.replace(timePattern, '');
    }
    
    // Check for priority patterns
    if (input.match(/high priority|urgent|important|critical/i)) {
      priority = 'high';
    } else if (input.match(/low priority|not urgent|can wait/i)) {
      priority = 'low';
    }
    
    // Clean up title
    title = title.replace(/schedule|create|add|set up|plan|tomorrow|today|next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|on \d{1,2}[\/\-]\d{1,2}([\/\-]\d{2,4})?/gi, '')
      .replace(/high priority|urgent|important|critical|low priority|not urgent|can wait/gi, '')
      .trim();
    
    if (title.match(/^(a |an |the )?meeting/i)) {
      title = "Meeting" + (title.replace(/^(a |an |the )?meeting/i, '') || '');
    }
    
    return {
      title: title || 'New Task',
      date,
      startTime,
      endTime,
      priority
    };
  };
  
  // Handle AI assistant message send
  const handleSendAiMessage = () => {
    if (!aiInput.trim()) return;
    
    // Add user message to chat
    setAiMessages(prev => [...prev, { type: 'user', text: aiInput }]);
    
    // Parse the message for scheduling intent
    const scheduleInfo = parseScheduleInput(aiInput);
    setAiInput('');
    
    // Process based on intent
    setTimeout(() => {
      setAiMessages(prev => [
        ...prev, 
        { 
          type: 'bot', 
          text: `I'll schedule "${scheduleInfo.title}" for ${scheduleInfo.date.toLocaleDateString()} ${scheduleInfo.startTime ? `at ${scheduleInfo.startTime}` : ''}.` 
        }
      ]);
      
      // Create task from AI schedule
      const task = {
        title: scheduleInfo.title,
        description: '',
        startTime: scheduleInfo.startTime,
        endTime: scheduleInfo.endTime,
        priority: scheduleInfo.priority,
        completed: false
      };
      
      // Add task to tasks
      const dateKey = scheduleInfo.date.toISOString().split('T')[0];
      const updatedTasks = {
        ...tasks,
        [dateKey]: [...(tasks[dateKey] || []), task]
      };
      
      setTasks(updatedTasks);
      setSelectedDate(scheduleInfo.date);
      
      // Add a notification about the new task
      const notification = {
        id: Date.now(),
        title: 'AI Scheduled Task',
        message: `"${task.title}" scheduled for ${scheduleInfo.date.toLocaleDateString()}`,
        time: new Date().toLocaleTimeString(),
        read: false
      };
      
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    }, 1000);
  };
  
  // Mock Gemini API call for recommendations
  const getAIRecommendations = async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newRecommendations = [];
      
      if (taskStats.overdue > 3) {
        newRecommendations.push({
          type: 'warning',
          title: 'Task Overload Detected',
          message: 'You have several overdue tasks. Consider rescheduling or delegating some of them.',
          actions: ['Reschedule Tasks', 'View Overdue Tasks']
        });
      }
      
      if (taskStats.highPriority > 5) {
        newRecommendations.push({
          type: 'priority',
          title: 'High Priority Task Management',
          message: 'You have multiple high-priority tasks. Consider spreading them throughout the week instead of concentrating them on specific days.',
          actions: ['Rebalance Tasks', 'View High Priority']
        });
      }
      
      if (taskStats.completed / taskStats.total < 0.4 && taskStats.total > 10) {
        newRecommendations.push({
          type: 'productivity',
          title: 'Productivity Enhancement',
          message: 'Your task completion rate is below 40%. Consider using time-blocking techniques or breaking down larger tasks into smaller, manageable chunks.',
          actions: ['Learn Time-Blocking', 'Task Breakdown Guide']
        });
      }
      
      if (newRecommendations.length === 0) {
        newRecommendations.push({
          type: 'productivity',
          title: 'Maintain Your Productivity',
          message: 'Your task management looks good. Continue with your current approach and consider adding time for breaks between intensive tasks.',
          actions: ['Schedule Breaks', 'View Task Analytics']
        });
      }
      
      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      setRecommendations([{
        type: 'error',
        title: 'Recommendation Error',
        message: 'Unable to generate recommendations at this time. Please try again later.',
        actions: ['Retry']
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check for upcoming tasks and create notifications
  const checkUpcomingTasks = () => {
    const now = new Date();
    const upcoming = [];
    let newUnreadCount = unreadCount;
    
    const todayKey = now.toISOString().split('T')[0];
    const todayTasks = tasks[todayKey] || [];
    
    todayTasks.forEach(task => {
      if (task.completed) return;
      
      if (task.startTime) {
        const [hours, minutes] = task.startTime.split(':').map(Number);
        const taskTime = new Date();
        taskTime.setHours(hours, minutes, 0, 0);
        
        const timeDiff = (taskTime - now) / (1000 * 60);
        
        if (timeDiff >= 0 && timeDiff <= 30) {
          const notification = {
            id: Date.now() + Math.random().toString(),
            title: `Upcoming Task: ${task.title}`,
            message: `Starting in ${Math.floor(timeDiff)} minutes`,
            time: now.toLocaleTimeString(),
            read: false,
            task: task
          };
          
          const exists = notifications.some(n => 
            n.title === notification.title && 
            n.message === notification.message
          );
          
          if (!exists) {
            upcoming.push(notification);
            newUnreadCount++;
            
            if (notificationSound.current) {
              notificationSound.current.play().catch(e => console.log('Audio play failed:', e));
            }
          }
        }
      }
    });
    
    if (upcoming.length > 0) {
      setNotifications(prev => [...upcoming, ...prev]);
      setUnreadCount(newUnreadCount);
    }
  };
  
  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('calendarTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    
    notificationSound.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-alert-2573.mp3');
    
    const intervalId = setInterval(checkUpcomingTasks, 60000);
    
    checkUpcomingTasks();
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Update localStorage when tasks change
  useEffect(() => {
    localStorage.setItem('calendarTasks', JSON.stringify(tasks));
    
    calculateTaskStats();
    updateAnalyticsData();
  }, [tasks]);
  
  // Get AI recommendations when task stats change
  useEffect(() => {
    if (taskStats.total > 0) {
      getAIRecommendations();
    }
  }, [taskStats]);
  
  // Calculate task statistics
  const calculateTaskStats = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    let total = 0;
    let completed = 0;
    let overdue = 0;
    let upcoming = 0;
    let highPriority = 0;
    
    Object.entries(tasks).forEach(([dateKey, dateTasks]) => {
      dateTasks.forEach(task => {
        total++;
        
        if (task.completed) {
          completed++;
        } else if (dateKey < today) {
          overdue++;
        } else if (dateKey === today) {
          upcoming++;
        }
        
        if (task.priority === 'high') {
          highPriority++;
        }
      });
    });
    
    setTaskStats({
      total,
      completed,
      overdue,
      upcoming,
      highPriority
    });
  };
  
  // Update analytics data for the chart
  const updateAnalyticsData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dateTasks = tasks[dateKey] || [];
      
      const completed = dateTasks.filter(task => task.completed).length;
      const total = dateTasks.length;
      
      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        total,
        completed,
        completion: total > 0 ? Math.round((completed / total) * 100) : 0
      });
    }
    
    setAnalyticsData(data);
  };
  
  // Save task to state and localStorage
  const saveTask = () => {
    if (!newTask.title || !newTask.startTime) {
      alert('Task title and start time are required!');
      return;
    }
    
    const dateKey = selectedDate.toISOString().split('T')[0];
    const updatedTasks = {
      ...tasks,
      [dateKey]: [...(tasks[dateKey] || []), newTask]
    };
    
    setTasks(updatedTasks);
    setShowTaskModal(false);
    setNewTask({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      priority: 'medium',
      completed: false
    });
    
    const notification = {
      id: Date.now(),
      title: 'Task Created',
      message: `"${newTask.title}" scheduled for ${selectedDate.toLocaleDateString()}`,
      time: new Date().toLocaleTimeString(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };
  
  // Delete task
  const deleteTask = (dateKey, taskIndex) => {
    const updatedTasks = { ...tasks };
    updatedTasks[dateKey].splice(taskIndex, 1);
    
    if (updatedTasks[dateKey].length === 0) {
      delete updatedTasks[dateKey];
    }
    
    setTasks(updatedTasks);
    
    const notification = {
      id: Date.now(),
      title: 'Task Deleted',
      message: `Task removed from ${new Date(dateKey).toLocaleDateString()}`,
      time: new Date().toLocaleTimeString(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };
  
  // Toggle task completion
  const toggleTaskCompletion = (dateKey, taskIndex) => {
    const updatedTasks = { ...tasks };
    const task = updatedTasks[dateKey][taskIndex];
    task.completed = !task.completed;
    
    setTasks(updatedTasks);
    
    if (task.completed) {
      const notification = {
        id: Date.now(),
        title: 'Task Completed',
        message: `"${task.title}" marked as completed`,
        time: new Date().toLocaleTimeString(),
        read: false
      };
      
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
    setUnreadCount(0);
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };
  
  // Email all scheduled tasks
  const handleEmailSchedule = () => {
    setShowEmailPreview(true);
  };
  
  const handleEmailSent = () => {
    setEmailSent(true);
    setShowEmailPreview(false);
    
    setTimeout(() => {
      setEmailSent(false);
    }, 3000);
    
    // Add notification about email
    const notification = {
      id: Date.now(),
      title: 'Schedule Emailed',
      message: 'Your task schedule has been sent to your email',
      time: new Date().toLocaleTimeString(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };
  
  // Previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
  };
  
  // Next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
  };
  
  // Today button
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };
  
  // Calendar rendering
  const renderCalendar = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    const endDate = new Date(monthEnd);
    
    // Adjust the start date to be the beginning of the week
    const day = startDate.getDay();
    startDate.setDate(startDate.getDate() - day);
    
    // Adjust the end date to be the end of the week
    const endDay = endDate.getDay();
    endDate.setDate(endDate.getDate() + (6 - endDay));
    
    const rows = [];
    let days = [];
    let currentDate = new Date(startDate);
    
    // Days of the week
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const headerCells = weekDays.map(day => (
      <div key={`weekday-${day}`} className="w-12 h-8 flex items-center justify-center font-semibold text-gray-600">
        {day}
      </div>
    ));
    
    // Build the days
    while (currentDate <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const hasTask = tasks[dateKey]?.length > 0;
        const isDifferentMonth = currentDate.getMonth() !== currentMonth.getMonth();
        const isToday = new Date().toDateString() === currentDate.toDateString();
        const isSelected = selectedDate.toDateString() === currentDate.toDateString();
        
        // Calculate completion for the day
        const dayTasks = tasks[dateKey] || [];
        const completedTasks = dayTasks.filter(task => task.completed).length;
        const completionPercentage = dayTasks.length ? completedTasks / dayTasks.length : 0;
        
        days.push(
          <div
            key={currentDate.toDateString()}
            className={`relative w-12 h-12 flex flex-col items-center justify-center rounded-lg cursor-pointer
              transition-all duration-200 hover:scale-110
              ${isToday ? 'bg-indigo-500 text-white' : ''}
              ${isSelected && !isToday ? 'bg-indigo-200' : ''}
              ${isDifferentMonth ? 'text-gray-400' : 'hover:bg-indigo-100'}`}
            onClick={() => {
              setSelectedDate(new Date(currentDate));
              if (dayTasks.length > 0) {
                setShowTaskModal(false); // Don't open task modal if there are already tasks
              } else {
                setShowTaskModal(true);
              }
            }}
          >
            {currentDate.getDate()}
            
            {/* Task indicator */}
            {hasTask && (
              <div className="absolute bottom-1 flex space-x-0.5">
                {completionPercentage > 0 && (
                  <div 
                    className="h-1.5 rounded-full bg-green-500" 
                    style={{ width: `${completionPercentage * 6}px` }}
                  />
                )}
                {completionPercentage < 1 && (
                  <div 
                    className="h-1.5 rounded-full bg-indigo-500" 
                    style={{ width: `${(1 - completionPercentage) * 6}px` }}
                  />
                )}
              </div>
            )}
          </div>
        );
        
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        currentDate = newDate;
      }
      
      rows.push(
        <div key={currentDate.toDateString()} className="grid grid-cols-7 gap-2">
          {days}
        </div>
      );
      days = [];
    }
    
    return (
      <>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {headerCells}
        </div>
        {rows}
      </>
    );
  };
  
  // Render tasks for selected date
  const renderTasksForDate = (date) => {
    const dateKey = date.toISOString().split('T')[0];
    const dateTasks = tasks[dateKey] || [];
    const sortedTasks = [...dateTasks].sort((a, b) => {
      // Sort by time if available
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      return 0;
    });
    
    const priorityColors = {
      low: 'bg-blue-100 text-blue-800 border-l-blue-500',
      medium: 'bg-yellow-100 text-yellow-800 border-l-yellow-500',
      high: 'bg-red-100 text-red-800 border-l-red-500'
    };
    
    return (
      <div className="mt-4 overflow-y-auto max-h-[50vh]">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-lg font-semibold text-gray-800">
            Tasks for {date.toLocaleDateString()}
          </h4>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setShowTaskModal(true);
                setNewTask({
                  title: '',
                  description: '',
                  startTime: '',
                  endTime: '',
                  priority: 'medium',
                  completed: false
                });
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              Add Task
            </button>
            <button
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center"
            >
              <Brain className="w-4 h-4 mr-1" />
              {showAIAssistant ? 'Hide AI' : 'AI Schedule'}
            </button>
          </div>
        </div>
        
        {sortedTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tasks scheduled for this date</p>
        ) : (
          <div className="space-y-2">
            {sortedTasks.map((task, index) => (
              <div
                key={index}
                className={`${
                  priorityColors[task.priority]
                } p-3 rounded-lg flex justify-between items-start border-l-4 ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(dateKey, index)}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <h5 className={`font-semibold ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </h5>
                    {task.description && (
                      <p className="text-sm mt-1">{task.description}</p>
                    )}
                    <div className="text-sm mt-2 flex items-center space-x-3">
                      {task.startTime && (
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {task.startTime}
                          {task.endTime && ` - ${task.endTime}`}
                        </span>
                      )}
                      <span className="capitalize">
                        {task.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(dateKey, index)}
                  className="text-gray-500 hover:text-red-500 ml-2"
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8 mt-12">
      {/* Notification sound */}
      <audio ref={notificationSound} preload="auto" />
      
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-indigo-900">Task Calendar</h2>
          <div className="flex space-x-2">
            <button 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              onClick={goToToday}
            >
              Today
            </button>
            <button 
              className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              onClick={() => {
                const position = window.pageYOffset;
                setShowNotifications(!showNotifications);
                setTimeout(() => window.scrollTo(0, position), 10);
              }}
            >
              <div className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
        
        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Tasks</p>
              <p className="text-2xl font-bold text-indigo-900">{taskStats.total}</p>
            </div>
            <Activity className="w-8 h-8 text-indigo-500" />
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
            </div>
            <Award className="w-8 h-8 text-green-500" />
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today's Tasks</p>
              <p className="text-2xl font-bold text-blue-600">{taskStats.upcoming}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completion Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {taskStats.total ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        {/* Main Calendar and Tasks Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="calendar-grid">
              {renderCalendar()}
            </div>
            {renderTasksForDate(selectedDate)}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Analytics */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Task Completion</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#6366F1" name="Total Tasks" />
                  <Line type="monotone" dataKey="completed" stroke="#10B981" name="Completed" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* AI Recommendations */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">AI Recommendations</h3>
                {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>}
              </div>
              
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      rec.type === 'warning' ? 'border-l-amber-500 bg-amber-50' :
                      rec.type === 'priority' ? 'border-l-red-500 bg-red-50' :
                      rec.type === 'productivity' ? 'border-l-green-500 bg-green-50' :
                      'border-l-blue-500 bg-blue-50'
                    }`}
                  >
                    <h4 className="font-semibold text-gray-800">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rec.message}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {rec.actions.map((action, idx) => (
                        <button 
                          key={idx}
                          className="text-xs px-3 py-1 bg-white rounded-full shadow-sm text-indigo-600 hover:bg-indigo-50"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                New Task for {selectedDate.toLocaleDateString()}
              </h3>
              <button onClick={() => setShowTaskModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newTask.startTime}
                    onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={newTask.endTime}
                    onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTask}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed right-8 top-24 z-50 w-96 bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex space-x-2">
              <button
                onClick={markAllAsRead}
                className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded hover:bg-opacity-30"
              >
                Mark all read
              </button>
              <button
                onClick={clearAllNotifications}
                className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded hover:bg-opacity-30"
              >
                Clear all
              </button>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${notification.read ? 'opacity-70' : ''}`}
                >
                  <div className="flex justify-between">
                    <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                    <span className="text-xs text-gray-500">{notification.time}</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {/* AI Scheduler Assistant */}
      {showAIAssistant && (
        <div className="fixed right-8 bottom-8 z-50 w-96 bg-white rounded-xl shadow-xl overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 bg-purple-600 text-white flex justify-between items-center">
            <h3 className="font-semibold flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              AI Scheduling Assistant
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={handleEmailSchedule}
                className="text-white hover:text-gray-200"
              >
                <Mail className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowAIAssistant(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiMessages.map((message, index) => (
              <div 
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t flex">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendAiMessage()}
              className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g. Schedule a meeting tomorrow at 2pm"
            />
            <button
              onClick={handleSendAiMessage}
              className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      {/* Email Preview Modal */}
      {showEmailPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Email Preview</h3>
              <button onClick={() => setShowEmailPreview(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="border rounded-lg p-4 mb-4">
              <div className="mb-2">
                <strong>To:</strong> paramgogia25@outlook.com
              </div>
              <div className="mb-2">
                <strong>Subject:</strong> Your Task Schedule
              </div>
              <div className="border-t pt-4">
                <p className="mb-4">Hello,</p>
                <p className="mb-4">Here is your task schedule:</p>
                
                <div className="border rounded-md p-3 mb-4">
                  {Object.entries(tasks).map(([dateKey, dateTasks]) => (
                    <div key={dateKey} className="mb-3">
                      <h4 className="font-semibold">{new Date(dateKey).toLocaleDateString()}</h4>
                      <ul className="pl-5 list-disc">
                        {dateTasks.map((task, index) => (
                          <li key={index} className={task.completed ? 'line-through opacity-70' : ''}>
                            {task.title} 
                            {task.startTime && ` (${task.startTime}${task.endTime ? ` - ${task.endTime}` : ''})`}
                            {task.priority !== 'medium' && ` - ${task.priority} priority`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                
                <p>Best regards,</p>
                <p>Your Task Calendar App</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={() => setShowEmailPreview(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailSent}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Email Sent Toast */}
      {emailSent && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Email sent successfully!
          </div>
        </div>
      )}
      
      <TodoList />
    </div>
  );
};

export default Task;