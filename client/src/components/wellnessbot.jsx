import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Minimize2, Brain } from 'lucide-react';

// Note: In a real application, store this in .env file
const GEMINI_API_KEY = 'AIzaSyBmZcIOLIY8YfOtR4mTDi9tMuml7mFktP4';

const WellnessBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hi! I'm Luna, your Personal Life and Social Engagement Assistant. I've been fine-tuned to help you maintain balance in your life and build meaningful connections. How are you feeling today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // User profile model state
  const [userProfile, setUserProfile] = useState({
    stressLevel: 'unknown',
    socialEngagement: 'unknown',
    cognitiveLoad: 'moderate',
    energyLevel: 'moderate',
    lastInteractions: [],
    preferredActivities: [],
    scheduleSuggestions: []
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update user profile based on interactions
  const updateUserProfile = (message) => {
    // In a real implementation, this would use ML to analyze user inputs
    const lowerMessage = message.toLowerCase();
    
    // Simple pattern detection to update user profile
    let updatedProfile = {...userProfile};
    
    // Update stress level based on keywords
    if (/stress|anxious|worried|tired|exhausted|overwhelmed/.test(lowerMessage)) {
      updatedProfile.stressLevel = 'high';
      updatedProfile.cognitiveLoad = 'high';
    } else if (/relaxed|calm|peaceful|rested/.test(lowerMessage)) {
      updatedProfile.stressLevel = 'low';
      updatedProfile.cognitiveLoad = 'low';
    }
    
    // Update social engagement based on keywords
    if (/lonely|alone|isolated|no friends|miss|disconnected/.test(lowerMessage)) {
      updatedProfile.socialEngagement = 'low';
    } else if (/party|gathering|social|friends|meeting|connected/.test(lowerMessage)) {
      updatedProfile.socialEngagement = 'high';
    }
    
    // Update energy level based on keywords
    if (/tired|exhausted|drained|no energy/.test(lowerMessage)) {
      updatedProfile.energyLevel = 'low';
    } else if (/energetic|active|motivated|productive/.test(lowerMessage)) {
      updatedProfile.energyLevel = 'high';
    }
    
    // Track user interactions
    updatedProfile.lastInteractions.push({
      timestamp: new Date(),
      content: message,
      inferred_mood: updatedProfile.stressLevel
    });
    
    // Keep only last 10 interactions
    if (updatedProfile.lastInteractions.length > 10) {
      updatedProfile.lastInteractions = updatedProfile.lastInteractions.slice(-10);
    }
    
    setUserProfile(updatedProfile);
    return updatedProfile;
  };

  // Fine-tuned prompt for the Gemini model
  const getFinetunePrompt = (userMessage, profile) => {
    return `
      You are Luna, a specialized Personal Intelligence Agent fine-tuned specifically for Personal Life and Social Engagement assistance.
      
      YOUR SPECIALIZED TRAINING:
      You have been fine-tuned using a dataset focused on lifestyle, wellbeing, and social engagement patterns.
      You use deep learning techniques including RNNs & LSTMs for predictive scheduling,
      reinforcement learning for time optimization, and NLP for social & emotional analysis.
      
      CURRENT USER PROFILE:
      - Stress Level: ${profile.stressLevel}
      - Social Engagement Level: ${profile.socialEngagement}
      - Cognitive Load: ${profile.cognitiveLoad}
      - Energy Level: ${profile.energyLevel}
      
      SPECIALIZED CAPABILITIES:
      1. Predictive Scheduling: You can suggest optimal times for activities based on user's energy patterns
      2. Cognitive Load Management: You can detect when the user is overwhelmed and suggest adjustments
      3. Social Connection Optimization: You recommend meaningful social interactions tailored to the user
      4. Adaptive Personalization: You continuously refine your recommendations based on user feedback
      
      RESPONSE GUIDELINES:
      1. Address the user's immediate concern or question
      2. Include ONE personalized insight based on their profile data
      3. Offer ONE practical suggestion related to personal life/social engagement balance
      4. Keep your response concise (3-4 sentences maximum)
      5. Maintain a supportive but not overly cheerful tone
      6. Focus on actionable advice related to social connections, stress management, or work-life balance
      
      USER CONTEXT:
      The user's recent engagement patterns suggest they may benefit from ${
        profile.socialEngagement === 'low' ? 'increased social interaction' : 
        profile.stressLevel === 'high' ? 'stress reduction techniques' :
        profile.cognitiveLoad === 'high' ? 'cognitive load management' :
        'general wellbeing maintenance'
      }.
      
      USER MESSAGE: "${userMessage}"
      
      Respond as Luna, the Personal Life and Social Engagement Assistant:
    `;
  };

  const getGeminiResponse = async (userMessage) => {
    // First update the user profile based on message content
    const updatedProfile = updateUserProfile(userMessage);
    
    // Generate the fine-tuned prompt
    const finetunePrompt = getFinetunePrompt(userMessage, updatedProfile);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: finetunePrompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          })
        }
      );

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return "I apologize, but my fine-tuned model is having trouble processing your message right now. Could you please try again?";
    }
  };

  // Generate fallback responses if API fails
  const generateFallbackResponse = (profile) => {
    const responses = {
      high_stress: [
        "I notice your cognitive load seems high right now. Consider taking a 5-minute break to reset - even brief pauses can improve focus and reduce stress.",
        "Based on your interaction patterns, you might benefit from some schedule adjustments. Could you identify one non-urgent task to postpone until tomorrow?"
      ],
      low_social: [
        "My social engagement analysis suggests you might benefit from a brief connection today. Even a quick message to a friend can boost your mood and sense of belonging.",
        "I've noticed patterns suggesting limited social interaction recently. Research shows even brief social connections can significantly improve wellbeing - perhaps schedule a short call with someone this week?"
      ],
      work_life: [
        "Your current activity patterns indicate potential work-life imbalance. Consider setting a clear boundary for when work ends today, even if it's just closing your laptop at a specific time.",
        "Based on your energy patterns, this might be an optimal time for a meaningful personal activity rather than extending work hours."
      ],
      general: [
        "My analysis suggests this could be a good time for a brief social connection. Would you consider reaching out to someone in your support network?",
        "Based on your recent interaction patterns, scheduling a specific self-care activity might help maintain your energy balance today."
      ]
    };
    
    // Select appropriate category
    let category = 'general';
    if (profile.stressLevel === 'high') {
      category = 'high_stress';
    } else if (profile.socialEngagement === 'low') {
      category = 'low_social';
    } else if (profile.cognitiveLoad === 'high') {
      category = 'work_life';
    }
    
    // Return random response from appropriate category
    const options = responses[category];
    return options[Math.floor(Math.random() * options.length)];
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      type: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const aiResponse = await getGeminiResponse(inputMessage);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: aiResponse
      }]);
    } catch (error) {
      console.error('Error getting response:', error);
      // Use fallback response generation if API fails
      const fallbackResponse = generateFallbackResponse(userProfile);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: fallbackResponse
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-80 h-96 flex flex-col">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-white" />
              <h3 className="font-semibold">Luna - Social & Wellness Buddy</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-indigo-700 rounded-full p-1"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg flex gap-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share how you're feeling..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <button
                onClick={handleSend}
                disabled={!inputMessage.trim()}
                className={`p-2 rounded-lg transition-colors ${
                  inputMessage.trim()
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessBot;