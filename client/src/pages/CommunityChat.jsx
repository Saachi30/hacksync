import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

const CommunityChat = ({ onMoodDetected }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userMood, setUserMood] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch chat messages
  useEffect(() => {
    const fetchMessages = async () => {
      const messagesRef = collection(db, 'communityChat');
      const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(50));
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messagesList = [];
        querySnapshot.forEach((doc) => {
          messagesList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setMessages(messagesList.reverse());
        scrollToBottom();
      });
      
      return () => unsubscribe();
    };

    fetchMessages();
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Analyze mood using Gemini AI
  const analyzeMood = async (text) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `
        Analyze the following text and determine the user's mood or emotional state.
        Return ONLY ONE of these categories without explanation:
        - Happy
        - Excited
        - Energetic
        - Sad
        - Bored
        - Anxious
        - Relaxed
        - Curious
        - Social
        - Adventurous
        - Tired
        - Creative
        
        Text to analyze: "${text}"
      `;
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      const mood = response.text().trim();
      
      return mood;
    } catch (error) {
      console.error("Error analyzing mood:", error);
      return "Neutral";
    }
  };

  // Map mood to activity types
  const mapMoodToActivityTypes = (mood) => {
    const moodToActivityMap = {
      'Happy': ['Beach', 'Dining', 'Concerts'],
      'Excited': ['Clubbing', 'Concerts', 'Sports'],
      'Energetic': ['Sports', 'Trekking', 'Hiking'],
      'Sad': ['Movies', 'Dining', 'Shopping'],
      'Bored': ['Gaming', 'Movies', 'Shopping'],
      'Anxious': ['Hiking', 'Beach', 'Trekking'],
      'Relaxed': ['Beach', 'Dining', 'Movies'],
      'Curious': ['Trekking', 'Hiking', 'Other'],
      'Social': ['Clubbing', 'Dining', 'Concerts'],
      'Adventurous': ['Trekking', 'Hiking', 'Sports'],
      'Tired': ['Movies', 'Dining', 'Beach'],
      'Creative': ['Other', 'Shopping', 'Movies'],
      'Neutral': ['Dining', 'Movies', 'Sports']
    };
    
    return moodToActivityMap[mood] || ['Dining', 'Movies', 'Sports'];
  };

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !auth.currentUser) return;
    
    try {
      setLoading(true);
      
      // Add message to Firestore
      const messageData = {
        text: newMessage,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "Anonymous",
        userPhoto: auth.currentUser.photoURL || null,
        createdAt: Timestamp.now()
      };
      
      await addDoc(collection(db, 'communityChat'), messageData);
      
      // Analyze mood with Gemini
      const detectedMood = await analyzeMood(newMessage);
      setUserMood(detectedMood);
      
      // Get suggested activity types based on mood
      const suggestedActivityTypes = mapMoodToActivityTypes(detectedMood);
      
      // Pass mood and activity suggestions to parent component
      onMoodDetected(detectedMood, suggestedActivityTypes);
      
      setNewMessage('');
      setLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setLoading(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-[500px] flex flex-col">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="mr-2">💬</span>
          Community Chat
        </h2>
        <p className="text-blue-100 text-sm">
          Connect with the community and share your thoughts
        </p>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <span className="text-4xl mb-2">💭</span>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`mb-4 flex ${message.userId === auth.currentUser?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                message.userId === auth.currentUser?.uid 
                  ? 'bg-blue-600 text-white rounded-l-lg rounded-tr-lg' 
                  : 'bg-gray-100 text-gray-800 rounded-r-lg rounded-tl-lg'
              } px-4 py-2 shadow-sm`}>
                <div className="flex items-center mb-1">
                  <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-2">
                    {message.userPhoto ? (
                      <img src={message.userPhoto} alt={message.userName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-500 text-xs">{message.userName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${
                    message.userId === auth.currentUser?.uid ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.userName}
                  </span>
                  <span className={`text-xs ml-2 ${
                    message.userId === auth.currentUser?.uid ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    {formatTimestamp(message.createdAt)}
                  </span>
                </div>
                <p>{message.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="border-t border-gray-200 p-4">
        {userMood && (
          <div className="mb-2 text-xs text-gray-500 flex items-center">
            <span className="mr-1">Current mood:</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
              {userMood}
            </span>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            disabled={!auth.currentUser || loading}
          />
          <button
            type="submit"
            className={`px-4 py-2 ${
              loading || !auth.currentUser
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white rounded-r-lg transition-colors duration-300 flex items-center justify-center`}
            disabled={loading || !auth.currentUser}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span>Send</span>
            )}
          </button>
        </form>
        {!auth.currentUser && (
          <p className="mt-2 text-xs text-red-500">Please log in to send messages</p>
        )}
      </div>
    </div>
  );
};

export default CommunityChat;