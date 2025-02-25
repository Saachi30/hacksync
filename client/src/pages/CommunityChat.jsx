import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp, where } from 'firebase/firestore';
import { db, auth } from '../firebase';

const CommunityChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState(null);
  const chatContainerRef = useRef(null);

  // Fetch messages and activities on component mount
  useEffect(() => {
    const fetchMessagesAndActivities = async () => {
      try {
        // Fetch messages
        const messagesRef = collection(db, 'communityMessages');
        const q = query(
          messagesRef,
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        
        const querySnapshot = await getDocs(q);
        const messagesList = [];
        
        querySnapshot.forEach((doc) => {
          messagesList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setMessages(messagesList.reverse());
        
        // Fetch activities
        const activitiesRef = collection(db, 'activities');
        const activitiesQuery = query(
          activitiesRef,
          where('date', '>=', new Date().toISOString().split('T')[0]),
          orderBy('date', 'asc')
        );
        
        const activitiesSnapshot = await getDocs(activitiesQuery);
        const activitiesList = [];
        
        activitiesSnapshot.forEach((doc) => {
          activitiesList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setActivities(activitiesList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setLoading(false);
      }
    };

    fetchMessagesAndActivities();
    
    // Set up real-time listener for new messages
    const setupMessagesListener = () => {
      const messagesRef = collection(db, 'communityMessages');
      const q = query(
        messagesRef,
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const unsubscribe = getDocs(q).then((snapshot) => {
        if (!snapshot.empty) {
          const lastMessage = {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
          };
          
          setMessages(prevMessages => {
            // Check if message already exists
            if (!prevMessages.some(msg => msg.id === lastMessage.id)) {
              return [...prevMessages, lastMessage];
            }
            return prevMessages;
          });
        }
      });
      
      return unsubscribe;
    };
    
    const unsubscribe = setupMessagesListener();
    
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle message input change
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  // Get suggestions from Gemini API
  const getSuggestionsFromGemini = async (messageText, activities) => {
    try {
      // Extract activity titles and additional context
      const activityTitles = activities.map(activity => activity.title);
      
      // Prepare full context for better suggestions
      const activityContext = activities.map(activity => ({
        title: activity.title,
        type: activity.activityType,
        location: activity.location,
        description: activity.description,
        date: activity.date
      }));
      
      // In a production environment, you would call the Gemini API here
      // For example, using fetch:
      
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY; // Store your API key in environment variables
      const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
      
      const prompt = `
        Analyze this user message from a community chat: "${messageText}"
        
        Based on this message, determine which of the following activities would be most relevant to suggest to the user.
        Here are the available activities with their details:
        ${JSON.stringify(activityContext, null, 2)}
        
        Return ONLY the title of the single most relevant activity that best matches the user's interests or needs based on their message.
        If no activity is clearly relevant, return "None".
      `;
      
      const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 50,
          }
        })
      });
      
      const data = await response.json();
      
      // Extract the suggested activity title from Gemini's response
      let suggestedTitle = "None";
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        suggestedTitle = data.candidates[0].content.parts[0].text.trim();
      }
      
      // Find the matching activity from our activities list
      const suggestedActivity = activities.find(activity => 
        activity.title.toLowerCase() === suggestedTitle.toLowerCase()
      );
      
      return suggestedActivity || null;
      
    } catch (error) {
      console.error("Error getting suggestions from Gemini:", error);
      return null;
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      alert("Please log in to chat");
      return;
    }
    
    if (!newMessage.trim()) return;
    
    try {
      const messageData = {
        text: newMessage,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "Anonymous",
        userPhoto: auth.currentUser.photoURL || null,
        createdAt: Timestamp.now()
      };
      
      // Add message to Firebase
      const docRef = await addDoc(collection(db, 'communityMessages'), messageData);
      
      // Get suggestions from Gemini API if we have activities
      if (activities.length > 0) {
        const suggestedActivity = await getSuggestionsFromGemini(newMessage, activities);
        if (suggestedActivity) {
          setSuggestions(suggestedActivity);
        }
      }
      
      // Add message to state
      setMessages([
        ...messages,
        {
          id: docRef.id,
          ...messageData
        }
      ]);
      
      // Clear input
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
      alert("Failed to send message. Please try again.");
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-md flex flex-col h-[600px] w-full">
     
      
      {/* Chat messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.userId === auth.currentUser?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] ${message.userId === auth.currentUser?.uid ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {message.userPhoto ? (
                    <img src={message.userPhoto} alt={message.userName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-gray-500 text-sm">{message.userName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                
                <div className={`mx-2 ${message.userId === auth.currentUser?.uid ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-800'} rounded-lg p-3`}>
                  <div className="flex items-baseline mb-1">
                    <span className="font-medium text-sm">{message.userName}</span>
                    <span className="ml-2 text-xs text-gray-500">{formatTimestamp(message.createdAt)}</span>
                  </div>
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-xl">👋</p>
            <p>No messages yet. Be the first to chat!</p>
          </div>
        )}
      </div>
      
      {/* Activity suggestion */}
      {suggestions && (
        <div className="mx-4 my-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start">
            <div className="p-1.5 bg-amber-100 rounded-full text-amber-800">
              💡
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-amber-800">Suggested Activity</p>
              <div className="mt-1 flex items-center">
                <span className="text-amber-600 mr-1">{suggestions.activityType === 'Trekking' ? '🥾' : suggestions.activityType === 'Hiking' ? '🏔️' : suggestions.activityType === 'Clubbing' ? '🎵' : suggestions.activityType === 'Movies' ? '🎬' : suggestions.activityType === 'Dining' ? '🍽️' : suggestions.activityType === 'Sports' ? '⚽' : suggestions.activityType === 'Gaming' ? '🎮' : suggestions.activityType === 'Shopping' ? '🛍️' : suggestions.activityType === 'Beach' ? '🏖️' : suggestions.activityType === 'Concerts' ? '🎸' : '✨'}</span>
                <p className="text-sm text-amber-700">{suggestions.title} - {suggestions.location}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Message input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={handleMessageChange}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="Type your message..."
            disabled={!auth.currentUser}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
            disabled={!auth.currentUser || !newMessage.trim()}
          >
            Send
          </button>
        </div>
        {!auth.currentUser && (
          <p className="mt-2 text-xs text-red-500">Please log in to participate in the chat</p>
        )}
      </form>
    </div>
  );
};

export default CommunityChat;