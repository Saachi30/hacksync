import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Circle, Clock, Bell, X, Filter, Plus, Calendar, AlertCircle } from 'lucide-react';

const TodoList = () => {
  // State for todo list
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    dueTime: '',
    category: 'personal',
    priority: 'medium',
    completed: false
  });
  const [filter, setFilter] = useState('all');
  const [showAddTodoForm, setShowAddTodoForm] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Notification sound
  const notificationSound = useRef(null);
  
  // Load todos from localStorage
  useEffect(() => {
    const savedTodos = localStorage.getItem('dailyTodos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
    
    // Set up notification sound
    notificationSound.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-alert-2573.mp3');
    
    // Set up notification checker interval (every minute)
    const intervalId = setInterval(checkUpcomingTodos, 60000);
    
    // Initial check
    checkUpcomingTodos();
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Save todos to localStorage when they change
  useEffect(() => {
    localStorage.setItem('dailyTodos', JSON.stringify(todos));
  }, [todos]);
  
  // Check for upcoming todos and create notifications
  const checkUpcomingTodos = () => {
    const now = new Date();
    const upcoming = [];
    let newUnreadCount = unreadCount;
    
    todos.forEach((todo, index) => {
      if (todo.completed) return;
      
      if (todo.dueTime) {
        const [hours, minutes] = todo.dueTime.split(':').map(Number);
        const todoTime = new Date();
        todoTime.setHours(hours, minutes, 0, 0);
        
        // Todo due in the next 15 minutes
        const timeDiff = (todoTime - now) / (1000 * 60); // difference in minutes
        
        if (timeDiff >= 0 && timeDiff <= 15) {
          const notification = {
            id: Date.now() + Math.random().toString(),
            title: `Upcoming Task: ${todo.title}`,
            message: `Due in ${Math.floor(timeDiff)} minutes`,
            time: now.toLocaleTimeString(),
            read: false,
            todoIndex: index
          };
          
          // Check if we already have this notification
          const exists = notifications.some(n => 
            n.title === notification.title && 
            n.message === notification.message
          );
          
          if (!exists) {
            upcoming.push(notification);
            newUnreadCount++;
            
            // Play notification sound
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
  
  // Add new todo
  const addTodo = (e) => {
    e.preventDefault();
    
    if (!newTodo.title) {
      alert('Task title is required!');
      return;
    }
    
    const updatedTodos = [...todos, { ...newTodo, id: Date.now() }];
    setTodos(updatedTodos);
    
    // Reset form
    setNewTodo({
      title: '',
      description: '',
      dueTime: '',
      category: 'personal',
      priority: 'medium',
      completed: false
    });
    
    setShowAddTodoForm(false);
    
    // Add a notification about the new todo
    const notification = {
      id: Date.now(),
      title: 'Task Added',
      message: `"${newTodo.title}" added to your daily list`,
      time: new Date().toLocaleTimeString(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };
  
  // Toggle todo completion
  const toggleTodoCompletion = (id) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    
    setTodos(updatedTodos);
    
    // Find the toggled todo
    const toggledTodo = updatedTodos.find(todo => todo.id === id);
    
    // Add notification about todo completion
    if (toggledTodo.completed) {
      const notification = {
        id: Date.now(),
        title: 'Task Completed',
        message: `"${toggledTodo.title}" marked as completed`,
        time: new Date().toLocaleTimeString(),
        read: false
      };
      
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    }
  };
  
  // Delete todo
  const deleteTodo = (id) => {
    const todoToDelete = todos.find(todo => todo.id === id);
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    
    // Add notification about deleted todo
    const notification = {
      id: Date.now(),
      title: 'Task Deleted',
      message: `"${todoToDelete.title}" has been removed`,
      time: new Date().toLocaleTimeString(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
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
  
  // Get filtered todos
  const getFilteredTodos = () => {
    switch (filter) {
      case 'completed':
        return todos.filter(todo => todo.completed);
      case 'pending':
        return todos.filter(todo => !todo.completed);
      default:
        return todos;
    }
  };
  
  // Priority badges
  const priorityBadges = {
    low: 'bg-blue-100 text-blue-800 border-blue-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-red-100 text-red-800 border-red-300'
  };
  
  // Category badges
  const categoryBadges = {
    personal: 'bg-purple-100 text-purple-800 border-purple-300',
    work: 'bg-green-100 text-green-800 border-green-300',
    errands: 'bg-orange-100 text-orange-800 border-orange-300',
    health: 'bg-pink-100 text-pink-800 border-pink-300'
  };
  
  return (
    <div className="min-h-screen w-screen pr-52 p-4">
      {/* Notification sound */}
      <audio ref={notificationSound} preload="auto" />
      
      {/* Navbar with notification bell */}
      <div className="fixed top-24  right-24  z-50 py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
       
          
          <div className="relative">
            <button 
              className="relative rounded-full p-2 bg-indigo-100 hover:bg-indigo-200 transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5 text-indigo-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b flex justify-between items-center">
                  <h3 className="font-semibold">Notifications</h3>
                  <div className="flex space-x-2">
                    <button 
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </button>
                    <button 
                      className="text-xs text-gray-500 hover:text-gray-700"
                      onClick={clearAllNotifications}
                    >
                      Clear all
                    </button>
                  </div>
                </div>
                
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={`p-3 border-b hover:bg-gray-50 ${!notification.read ? 'bg-indigo-50' : ''}`}
                      onClick={() => {
                        // Mark as read
                        setNotifications(notifications.map(n => 
                          n.id === notification.id ? { ...n, read: true } : n
                        ));
                        if (!notification.read) {
                          setUnreadCount(prev => prev - 1);
                        }
                        
                        // If notification is about an upcoming todo, highlight it
                        if (notification.todoIndex !== undefined) {
                          setShowNotifications(false);
                        }
                      }}
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto pt-16">
        {/* Header and filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">
              Today's Tasks
            </h2>
            
            <div className="flex space-x-2">
              <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                <button 
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filter === 'all' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filter === 'pending' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setFilter('pending')}
                >
                  Pending
                </button>
                <button 
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filter === 'completed' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setFilter('completed')}
                >
                  Completed
                </button>
              </div>
              
              <button 
                className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
                onClick={() => setShowAddTodoForm(true)}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Task
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="text-sm text-gray-500">Category:</div>
            <span className="px-2 py-0.5 text-xs rounded-full border bg-purple-100 text-purple-800 border-purple-300">Personal</span>
            <span className="px-2 py-0.5 text-xs rounded-full border bg-green-100 text-green-800 border-green-300">Work</span>
            <span className="px-2 py-0.5 text-xs rounded-full border bg-orange-100 text-orange-800 border-orange-300">Errands</span>
            <span className="px-2 py-0.5 text-xs rounded-full border bg-pink-100 text-pink-800 border-pink-300">Health</span>
          </div>
        </div>
        
        {/* Todo list */}
        <div className="bg-white rounded-lg shadow-md">
          {getFilteredTodos().length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <CheckCircle className="mx-auto mb-2 w-12 h-12 text-gray-300" />
              <p className="text-lg font-medium">No tasks found</p>
              <p className="text-sm mt-1">
                {filter === 'all' 
                  ? "You don't have any tasks yet. Add one to get started!" 
                  : filter === 'completed' 
                    ? "You haven't completed any tasks yet."
                    : "You don't have any pending tasks."}
              </p>
              {filter !== 'all' && (
                <button 
                  className="mt-4 text-indigo-600 hover:text-indigo-800"
                  onClick={() => setFilter('all')}
                >
                  View all tasks
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {getFilteredTodos().map(todo => (
                <li key={todo.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <button 
                        onClick={() => toggleTodoCompletion(todo.id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {todo.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 hover:text-indigo-500" />
                        )}
                      </button>
                      
                      <div>
                        <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {todo.title}
                        </h3>
                        
                        {todo.description && (
                          <p className={`text-sm mt-1 ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                            {todo.description}
                          </p>
                        )}
                        
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {todo.dueTime && (
                            <span className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {todo.dueTime}
                            </span>
                          )}
                          
                          <span className={`px-2 py-0.5 text-xs rounded-full border ${categoryBadges[todo.category]}`}>
                            {todo.category.charAt(0).toUpperCase() + todo.category.slice(1)}
                          </span>
                          
                          <span className={`px-2 py-0.5 text-xs rounded-full border ${priorityBadges[todo.priority]}`}>
                            {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                          </span>
                          
                          {todo.completed && (
                            <span className="px-2 py-0.5 text-xs rounded-full border bg-green-100 text-green-800 border-green-300">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => deleteTodo(todo.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Add Todo Modal */}
      {showAddTodoForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Add New Task
              </h3>
              <button 
                onClick={() => setShowAddTodoForm(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={addTodo}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Task Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter task title"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                    rows={2}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter task description (optional)"
                  />
                </div>
                
                <div>
                  <label htmlFor="dueTime" className="block text-sm font-medium text-gray-700">
                    Due Time
                  </label>
                  <input
                    type="time"
                    id="dueTime"
                    value={newTodo.dueTime}
                    onChange={(e) => setNewTodo({ ...newTodo, dueTime: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    You'll receive a notification 15 minutes before the due time
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="category"
                      value={newTodo.category}
                      onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                      className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                      <option value="errands">Errands</option>
                      <option value="health">Health</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                      Priority
                    </label>
                    <select
                      id="priority"
                      value={newTodo.priority}
                      onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
                      className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddTodoForm(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;