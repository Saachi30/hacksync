import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

const MoodSuggestions = ({ mood, suggestedActivityTypes }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!mood || !suggestedActivityTypes || suggestedActivityTypes.length === 0) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get current date
        const currentDate = new Date().toISOString().split('T')[0];
        
        // Create a query for activities matching the suggested types and future dates
        const activitiesRef = collection(db, 'activities');
        const q = query(
          activitiesRef,
          where('activityType', 'in', suggestedActivityTypes),
          where('date', '>=', currentDate),
          orderBy('date', 'asc'),
          limit(3)
        );
        
        const querySnapshot = await getDocs(q);
        const activitiesList = [];
        
        querySnapshot.forEach((doc) => {
          activitiesList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setSuggestions(activitiesList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [mood, suggestedActivityTypes]);

  // Get emoji for mood
  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      'Happy': '😊',
      'Excited': '🤩',
      'Energetic': '⚡',
      'Sad': '😔',
      'Bored': '😒',
      'Anxious': '😰',
      'Relaxed': '😌',
      'Curious': '🧐',
      'Social': '👯',
      'Adventurous': '🧗',
      'Tired': '😴',
      'Creative': '🎨',
      'Neutral': '😐'
    };
    
    return moodEmojis[mood] || '😐';
  };
  
  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get icon for activity type
  const getActivityIcon = (type) => {
    const activityIcons = {
      'Trekking': '🥾',
      'Hiking': '🏔️',
      'Clubbing': '🎵',
      'Movies': '🎬',
      'Dining': '🍽️',
      'Sports': '⚽',
      'Gaming': '🎮',
      'Shopping': '🛍️',
      'Beach': '🏖️',
      'Concerts': '🎸',
      'Other': '✨'
    };
    
    return activityIcons[type] || '✨';
  };

  if (!mood) return null;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="mr-2">{getMoodEmoji(mood)}</span>
          Activities for your {mood} mood
        </h2>
        <p className="text-purple-100 text-sm">
          Based on how you're feeling, you might enjoy these activities
        </p>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map((activity) => (
              <div 
                key={activity.id}
                className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center"
              >
                <div className="w-10 h-10 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-xl mr-4">
                  {getActivityIcon(activity.activityType)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{activity.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="mr-3">{activity.activityType}</span>
                    <span className="mr-3">📍 {activity.location}</span>
                    <span>📅 {formatDate(activity.date)}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-center mt-2">
              <span className="text-xs text-gray-500">Activities suggested based on your mood</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <span className="text-4xl block mb-2">{getMoodEmoji(mood)}</span>
            <p className="text-gray-600">No activities found for your current mood.</p>
            <p className="text-sm text-gray-500 mt-1">Try creating a new one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodSuggestions;