import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import CommunityChat from './CommunityChat'; // Import the new chat component

const Community = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    activityType: '',
    location: '',
    date: '',
    time: '',
    maxParticipants: 5
  });
  const [showForm, setShowForm] = useState(false);
  const [similarActivities, setSimilarActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [activityTypes, setActivityTypes] = useState([
    { type: 'Trekking', icon: '🥾' },
    { type: 'Hiking', icon: '🏔️' },
    { type: 'Clubbing', icon: '🎵' },
    { type: 'Movies', icon: '🎬' },
    { type: 'Dining', icon: '🍽️' },
    { type: 'Sports', icon: '⚽' },
    { type: 'Gaming', icon: '🎮' },
    { type: 'Shopping', icon: '🛍️' },
    { type: 'Beach', icon: '🏖️' },
    { type: 'Concerts', icon: '🎸' },
    { type: 'Other', icon: '✨' }
  ]);
  const [filter, setFilter] = useState('all');
  const [showChat, setShowChat] = useState(false); // To toggle chat visibility on mobile
  const navigate = useNavigate();

  // Fetch all activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const activitiesRef = collection(db, 'activities');
        let q;
        
        if (filter === 'all') {
          q = query(
            activitiesRef,
            where('date', '>=', new Date().toISOString().split('T')[0]),
            orderBy('date', 'asc')
          );
        } else {
          q = query(
            activitiesRef,
            where('activityType', '==', filter),
            where('date', '>=', new Date().toISOString().split('T')[0]),
            orderBy('date', 'asc')
          );
        }
        
        const querySnapshot = await getDocs(q);
        const activitiesList = [];
        
        querySnapshot.forEach((doc) => {
          activitiesList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setActivities(activitiesList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching activities: ", error);
        setLoading(false);
      }
    };

    fetchActivities();
  }, [filter]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewActivity({
      ...newActivity,
      [name]: value
    });
  };

  // Submit new activity
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      alert("Please log in to create an activity");
      navigate('/login');
      return;
    }
    
    try {
      const activityData = {
        ...newActivity,
        createdBy: auth.currentUser.uid,
        creatorName: auth.currentUser.displayName || "Anonymous",
        creatorPhoto: auth.currentUser.photoURL || null,
        createdAt: Timestamp.now(),
        participants: [auth.currentUser.uid],
        status: 'open'
      };
      
      const docRef = await addDoc(collection(db, 'activities'), activityData);
      
      // Add the new activity to the state
      setActivities([
        {
          id: docRef.id,
          ...activityData
        },
        ...activities
      ]);
      
      // Reset form and hide it
      setNewActivity({
        title: '',
        description: '',
        activityType: '',
        location: '',
        date: '',
        time: '',
        maxParticipants: 5
      });
      setShowForm(false);
      
      // Find similar activities for the newly created activity
      findSimilarActivities(activityData);
      
    } catch (error) {
      console.error("Error adding activity: ", error);
      alert("Failed to create activity. Please try again.");
    }
  };

  // Find similar activities based on activity type and date range
  const findSimilarActivities = async (activity) => {
    try {
      // Get date range (7 days before and after the activity date)
      const activityDate = new Date(activity.date);
      const startDate = new Date(activityDate);
      startDate.setDate(activityDate.getDate() - 7);
      const endDate = new Date(activityDate);
      endDate.setDate(activityDate.getDate() + 7);
      
      const activitiesRef = collection(db, 'activities');
      const q = query(
        activitiesRef,
        where('activityType', '==', activity.activityType),
        where('date', '>=', startDate.toISOString().split('T')[0]),
        where('date', '<=', endDate.toISOString().split('T')[0]),
        where('createdBy', '!=', auth.currentUser?.uid || 'no-user'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      const similarActivitiesList = [];
      
      querySnapshot.forEach((doc) => {
        similarActivitiesList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setSimilarActivities(similarActivitiesList);
      setSelectedActivity(activity);
      
    } catch (error) {
      console.error("Error finding similar activities: ", error);
    }
  };

  // Send connection request
  const sendConnectionRequest = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      alert("Please log in to send a connection request");
      navigate('/login');
      return;
    }
    
    try {
      const requestData = {
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || "Anonymous",
        receiverId: selectedActivity.createdBy,
        activityId: selectedActivity.id,
        activityTitle: selectedActivity.title,
        message: requestMessage,
        status: 'pending',
        createdAt: Timestamp.now()
      };
      
      await addDoc(collection(db, 'connectionRequests'), requestData);
      
      setShowRequestModal(false);
      setRequestMessage('');
      
      // Show success message
      const successNotification = document.getElementById('success-notification');
      successNotification.classList.remove('hidden');
      setTimeout(() => {
        successNotification.classList.add('hidden');
      }, 3000);
      
    } catch (error) {
      console.error("Error sending connection request: ", error);
      alert("Failed to send connection request. Please try again.");
    }
  };

  // Get icon for activity type
  const getActivityIcon = (type) => {
    const activityType = activityTypes.find(item => item.type === type);
    return activityType ? activityType.icon : '✨';
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Convert time from 24h to 12h format
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Display activity cards
  const ActivityCard = ({ activity }) => {
    // Calculate days remaining
    const daysRemaining = () => {
      const today = new Date();
      const activityDate = new Date(activity.date);
      const diffTime = Math.abs(activityDate - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (activityDate.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (diffDays === 1 && activityDate > today) {
        return 'Tomorrow';
      } else {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ${activityDate > today ? 'left' : 'ago'}`;
      }
    };
    
    // Get random gradient for card based on activity type
    const getCardGradient = () => {
      const gradients = {
        'Trekking': 'from-green-500 to-emerald-700',
        'Hiking': 'from-emerald-500 to-teal-700',
        'Clubbing': 'from-purple-500 to-indigo-700',
        'Movies': 'from-red-500 to-rose-700',
        'Dining': 'from-amber-500 to-orange-700',
        'Sports': 'from-blue-500 to-indigo-700',
        'Gaming': 'from-indigo-500 to-violet-700',
        'Shopping': 'from-pink-500 to-rose-700',
        'Beach': 'from-cyan-500 to-blue-700',
        'Concerts': 'from-fuchsia-500 to-purple-700',
        'Other': 'from-gray-500 to-slate-700'
      };
      
      return gradients[activity.activityType] || 'from-blue-500 to-indigo-700';
    };
    
    return (
      <div className="bg-white rounded-xl w-full shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
        <div className={`h-24 bg-gradient-to-r ${getCardGradient()} p-6 flex items-center justify-between`}>
          <div>
            <span className="inline-block bg-white bg-opacity-30 text-white text-2xl rounded-full p-2 backdrop-blur-sm">
              {getActivityIcon(activity.activityType)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-white bg-white bg-opacity-20 px-3 py-1 rounded-full backdrop-blur-sm">
              {activity.activityType}
            </span>
            <p className="text-white text-sm mt-1 font-medium">{daysRemaining()}</p>
          </div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{activity.title}</h3>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{activity.description}</p>
          
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div className="flex items-center">
              <span className="text-gray-400">📍</span>
              <p className="ml-2 text-gray-700 truncate">{activity.location}</p>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400">🕒</span>
              <p className="ml-2 text-gray-700">{formatTime(activity.time)}</p>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400">📅</span>
              <p className="ml-2 text-gray-700">{formatDate(activity.date)}</p>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400">👥</span>
              <p className="ml-2 text-gray-700">
                {activity.participants.length}/{activity.maxParticipants}
              </p>
            </div>
          </div>
          
          <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {activity.creatorPhoto ? (
                  <img src={activity.creatorPhoto} alt={activity.creatorName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-500 text-sm">{activity.creatorName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <p className="ml-2 text-sm text-gray-600">{activity.creatorName}</p>
            </div>
            <button 
              onClick={() => {
                setSelectedActivity(activity);
                findSimilarActivities(activity);
                setShowRequestModal(true);
              }}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
            >
              Connect
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header Section */}
      <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl mt-12">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-grid-8"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
        
        <div className="relative px-6 py-12 sm:px-10 sm:py-16 md:py-20 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Discover & Connect
          </h1>
          <p className="mt-3 sm:mt-5 text-md sm:text-lg md:text-xl text-blue-100 max-w-xl">
            Find activities you love and connect with people who share your interests
          </p>
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center justify-center px-5 py-3 border-2 border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-blue-50 shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              {showForm ? 'Cancel Activity' : 'Create New Activity'}
            </button>
            
            <button
              onClick={() => setShowChat(!showChat)}
              className="inline-flex items-center justify-center px-5 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white/10 shadow-lg transition-all duration-300 transform hover:scale-105 md:hidden"
            >
              {showChat ? 'Show Activities' : 'Community Chat'}
            </button>
          </div>
        </div>
      </div>
     

      {/* Main Content - split into activities and chat */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Activities Column */}
        <div className={`${showChat ? 'hidden' : 'block'} md:block md:flex-1 w-full`}>
          {/* Filter Section */}
          <div className="mb-6 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-2 pb-2 min-w-full">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
              >
                All Activities
              </button>
              
              {activityTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => setFilter(type.type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center flex-shrink-0 ${
                    filter === type.type 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1">{type.icon}</span> {type.type}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10 transition-all duration-500 ease-in-out">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
                <h2 className="text-xl font-bold text-white">Create New Activity</h2>
                <p className="text-blue-100 text-sm">Share your plans and find people to join you</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={newActivity.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="Give your activity a catchy title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                    <select
                      name="activityType"
                      value={newActivity.activityType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    >
                      <option value="">Select activity type</option>
                      {activityTypes.map((type) => (
                        <option key={type.type} value={type.type}>
                          {type.icon} {type.type}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={newActivity.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="Where will this activity take place?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={newActivity.date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      name="time"
                      value={newActivity.time}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="maxParticipants"
                        value={newActivity.maxParticipants}
                        onChange={handleInputChange}
                        min="1"
                        max="50"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <span className="text-gray-500">people</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={newActivity.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    rows="4"
                    placeholder="Describe your activity, what people should expect, and any requirements..."
                    required
                  ></textarea>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition duration-300 shadow-md flex items-center"
                  >
                    <span className="mr-2">✨</span>
                    Create Activity
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Similar Activities Notification */}
          {similarActivities.length > 0 && selectedActivity && !showRequestModal && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl shadow-md p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-block p-2 bg-amber-200 text-amber-700 rounded-full">
                    💡
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-amber-800">Similar Activities Found!</h3>
                  <p className="mt-1 text-sm text-amber-700">
                    We found {similarActivities.length} similar {selectedActivity.activityType} activities around {formatDate(selectedActivity.date)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {similarActivities.map((activity, index) => (
                      <button
                        key={activity.id}
                        onClick={() => {
                          setSelectedActivity(activity);
                          setShowRequestModal(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors"
                      >
                        {activity.title} ({formatDate(activity.date)})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Connection Request Modal */}
          {showRequestModal && selectedActivity && (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="mr-2">{getActivityIcon(selectedActivity.activityType)}</span>
                    {selectedActivity.title}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Hosted by {selectedActivity.creatorName} on {formatDate(selectedActivity.date)}
                  </p>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Send Connection Request</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Introduce yourself and explain why you'd like to join this activity
                  </p>
                  
                  <form onSubmit={sendConnectionRequest}>
                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      rows="4"
                      placeholder="Hi! I'd love to join your activity because..."
                      required
                    ></textarea>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowRequestModal(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition duration-300 shadow-md"
                      >
                        Send Request
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Success Notification */}
          <div id="success-notification" className="fixed bottom-6 right-6 bg-green-100 border border-green-200 text-green-800 rounded-lg p-4 shadow-lg transform transition-all duration-500 hidden">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="inline-block p-1.5 bg-green-200 rounded-full">
                  ✓
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Connection request sent successfully!</p>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Loading activities...</p>
            </div>
          ) : activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🏞️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No activities found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "There are no upcoming activities. Be the first to create one!" 
                  : `There are no upcoming ${filter} activities. Create one or check other categories!`}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
              >
                Create New Activity
              </button>
            </div>
          )}
        </div>

        
      </div>
       {/* Chat Column */}
       <div className={`${showChat ? 'block' : 'hidden'} md:block flex-shrink-0 mt-12 w-full`}>
          <div className="bg-white rounded-xl shadow-md overflow-x-hidden h-full sticky top-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4">
              <h2 className="text-lg font-bold text-white">Community Chat</h2>
              <p className="text-blue-100 text-sm">Connect with other community members</p>
            </div>
            
            <CommunityChat />
          </div>
        </div>
    </div>
  );
};

export default Community;