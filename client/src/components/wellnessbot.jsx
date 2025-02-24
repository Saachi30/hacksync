import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Minimize2, Maximize2 } from 'lucide-react';

// Note: In a real application, store this in .env file
const GEMINI_API_KEY = 'AIzaSyBmZcIOLIY8YfOtR4mTDi9tMuml7mFktP4';

const WellnessBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hi! I'm your Wellness Assistant. I'm here to help you maintain balance in your life and support your social and mental well-being. How are you feeling today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getGeminiResponse = async (userMessage) => {
    const wellnessPrompt = `
      You are a highly empathetic and knowledgeable wellness assistant named Luna, 
      dedicated to supporting users' mental health, social connections, and work-life balance.
      
      Core Capabilities:
      - Emotional Intelligence: Recognize and respond to emotional states
      - Social Support: Suggest meaningful ways to build and maintain relationships
      - Stress Management: Provide practical techniques for managing stress and anxiety
      - Work-Life Balance: Help users optimize their schedule and energy
      - Personal Growth: Guide users toward their wellness goals
      
      Guidelines:
      1. Always maintain a warm, supportive tone
      2. Provide specific, actionable advice
      3. Encourage healthy social connections
      4. Validate emotions while promoting positive change
      5. Keep responses concise but meaningful
      
      Current user message: "${userMessage}"
      
      Provide a response that:
      1. Shows understanding of their situation
      2. Offers practical support or guidance
      3. Encourages positive action
      4. Maintains a conversational, caring tone
    `;

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
                text: wellnessPrompt
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
      return "I apologize, but I'm having trouble processing your message right now. Could you please try again?";
    }
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
      setMessages(prev => [...prev, {
        type: 'bot',
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment."
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
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-80 h-96 flex flex-col">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <h3 className="font-semibold">Luna - Wellness Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 rounded-full p-1"
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
                      ? 'bg-blue-600 text-white'
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
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-600"
              />
              <button
                onClick={handleSend}
                disabled={!inputMessage.trim()}
                className={`p-2 rounded-lg transition-colors ${
                  inputMessage.trim()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
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