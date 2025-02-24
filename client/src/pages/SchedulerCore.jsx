// src/components/AISchedulerCore.js
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createTFIDF, classifyQuery } from '../components/vector';


// Initialize the Gemini API
const GEMINI_API_KEY = 'AIzaSyCFKswhga9q7KF-qZ4ZzwcTxZRtrg6sb7Y'; 
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const AISchedulerCore = ({ 
  addEvent, 
  queryTypes, 
  onSetShowCalendar, 
  onSetShowEmailPreview, 
  onSetIsLoading 
}) => {
  // State management
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [queryType, setQueryType] = useState('general');
  const [vectorModel, setVectorModel] = useState(null);
  const messagesEndRef = useRef(null);
  const initializedRef = useRef(false);

  // Initialize vector model and welcome message only once
  useEffect(() => {
    if (!initializedRef.current) {
      try {
        // Initialize the vector model
        const model = createTFIDF(queryTypes);
        setVectorModel(model);
        
        // Add welcome message only once
        setMessages([{ 
          sender: 'bot', 
          text: "Hello! I'm your AI scheduler assistant. I can help you schedule events and email your calendar. How can I assist you today?" 
        }]);
        
        initializedRef.current = true;
      } catch (error) {
        console.error("Error during initialization:", error);
        setMessages([{ 
          sender: 'bot', 
          text: "Hello! I'm your AI scheduler assistant. I encountered an error during initialization, but I'll try to help you as best I can." 
        }]);
        initializedRef.current = true;
      }
    }
  }, [queryTypes]);

  // Scroll to bottom of chat
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update parent loading state
  useEffect(() => {
    onSetIsLoading(isLoading);
  }, [isLoading, onSetIsLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add a bot message to the chat
  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { sender: 'bot', text }]);
  };

  // Add a user message to the chat
  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { sender: 'user', text }]);
  };

  // More robust event details extraction from AI response or user input
  const extractEventDetails = (text, userQuery) => {
    console.log("Extracting event details from:", text);
    
    // Try structured format first
    const dateRegex = /date:\s*([^\n,]+)/i;
    const timeRegex = /time:\s*([^\n,]+)/i;
    const titleRegex = /title:\s*([^\n,]+)/i;
    const descriptionRegex = /description:\s*([^\n,]+)/i;
    
    let dateMatch = text.match(dateRegex);
    let timeMatch = text.match(timeRegex);
    let titleMatch = text.match(titleRegex);
    let descriptionMatch = text.match(descriptionRegex);
    
    console.log("Initial matches:", { dateMatch, timeMatch, titleMatch, descriptionMatch });
    
    // If structured format failed, try natural language parsing
    if (!dateMatch || !timeMatch) {
      // Look for date patterns (e.g., tomorrow, next Friday, Feb 28)
      const naturalDateRegex = /(today|tomorrow|next\s+\w+|on\s+\w+|\w+\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i;
      const naturalDateMatch = text.match(naturalDateRegex) || userQuery.match(naturalDateRegex);
      
      if (naturalDateMatch) {
        dateMatch = [null, naturalDateMatch[1]];
      }
      
      // Look for time patterns (e.g., 3pm, 15:00, at 9)
      const naturalTimeRegex = /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2}\s*o'clock|at\s+\d{1,2})/i;
      const naturalTimeMatch = text.match(naturalTimeRegex) || userQuery.match(naturalTimeRegex);
      
      if (naturalTimeMatch) {
        timeMatch = [null, naturalTimeMatch[1]];
      }
    }
    
    // Extract event title from context if not explicitly found
    if (!titleMatch) {
      // Try to find a relevant phrase in the user query first
      const queryTitleMatch = userQuery.match(/(?:schedule|create|add|plan|set up|organize)\s+(?:a|an)\s+([^.?!]+)/i);
      if (queryTitleMatch) {
        titleMatch = [null, queryTitleMatch[1].trim()];
      } else {
        // Look for meeting/event keywords
        const meetingTypes = ['meeting', 'call', 'appointment', 'event', 'session', 'conference'];
        for (const type of meetingTypes) {
          const contextTitleRegex = new RegExp(`((?:\\w+\\s+){0,3}${type}(?:\\s+\\w+){0,3})`, 'i');
          const contextMatch = userQuery.match(contextTitleRegex);
          if (contextMatch) {
            titleMatch = [null, contextMatch[1]];
            break;
          }
        }
        
        // If still no title, use first sentence of user query
        if (!titleMatch) {
          titleMatch = [null, userQuery.split(/[.!?]/)[0]];
        }
      }
    }
    
    const date = dateMatch ? dateMatch[1].trim() : null;
    const time = timeMatch ? timeMatch[1].trim() : null;
    const title = titleMatch ? titleMatch[1].trim() : "Untitled Event";
    const description = descriptionMatch ? descriptionMatch[1].trim() : "";
    
    console.log("Extracted raw details:", { date, time, title, description });
    
    // Improved date parsing using natural language
    let eventDate = new Date();
    if (date) {
      try {
        // Handle relative dates
        if (date.toLowerCase().includes('tomorrow')) {
          eventDate = new Date();
          eventDate.setDate(eventDate.getDate() + 1);
        } else if (date.toLowerCase().includes('next')) {
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const dayMatch = date.toLowerCase().match(/next\s+(\w+)/i);
          if (dayMatch) {
            const targetDay = dayNames.indexOf(dayMatch[1].toLowerCase());
            if (targetDay !== -1) {
              eventDate = new Date();
              const current = eventDate.getDay();
              eventDate.setDate(eventDate.getDate() + (targetDay + 7 - current) % 7);
            }
          } else {
            // "Next week" type of expressions
            eventDate = new Date();
            eventDate.setDate(eventDate.getDate() + 7);
          }
        } else if (date.toLowerCase().includes('today')) {
          eventDate = new Date();
        } else {
          // Try standard date parsing
          const parsedDate = new Date(date);
          if (!isNaN(parsedDate.getTime())) {
            eventDate = parsedDate;
          }
        }
        
        // Parse time if available
        if (time) {
          const timeStr = time.toLowerCase();
          if (timeStr.includes('am') || timeStr.includes('pm')) {
            // Handle "3pm" format
            const hourMatch = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
            if (hourMatch) {
              let hours = parseInt(hourMatch[1]);
              const minutes = hourMatch[2] ? parseInt(hourMatch[2]) : 0;
              if (hourMatch[3].toLowerCase() === 'pm' && hours < 12) hours += 12;
              if (hourMatch[3].toLowerCase() === 'am' && hours === 12) hours = 0;
              eventDate.setHours(hours, minutes, 0);
            }
          } else {
            // Handle "15:00" or "3" format
            const hourMatch = timeStr.match(/(\d{1,2})(?::(\d{2}))?/);
            if (hourMatch) {
              const hours = parseInt(hourMatch[1]);
              const minutes = hourMatch[2] ? parseInt(hourMatch[2]) : 0;
              eventDate.setHours(hours, minutes, 0);
            }
          }
        } else {
          // Default to 9 AM if no time specified
          eventDate.setHours(9, 0, 0);
        }
      } catch (e) {
        console.error("Error parsing date:", e);
        // Keep the current date but set it to 9 AM as fallback
        eventDate = new Date();
        eventDate.setHours(9, 0, 0);
      }
    }
    
    console.log("Final event date:", eventDate);
    
    return {
      title,
      description,
      date: eventDate,
      priority: queryType.includes('priority') ? 'high' : 'normal'
    };
  };

  // Handle sending a message to the AI
  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    const userMessage = input.trim();
    setInput('');
    addUserMessage(userMessage);
    setIsLoading(true);
    
    try {
      // Classify query using vector embeddings
      let classification = 'general';
      if (vectorModel) {
        try {
          classification = classifyQuery(userMessage, vectorModel);
          setQueryType(classification);
        } catch (error) {
          console.error("Error classifying query:", error);
          // If classification fails, continue with a default classification
          setQueryType('general');
        }
      }
      
      // Direct handling for easily recognizable scheduling requests
      const isDirectSchedulingRequest = /schedule|create|add|set up|plan|organize|book|meeting|appointment|event/i.test(userMessage);
      
      // Check if it's an email request first
      if (vectorModel && classification.includes('email')) {
        addBotMessage("I'll prepare an email with your schedule. Let me know if you want to make any changes before sending.");
        onSetShowEmailPreview(true);
        setIsLoading(false);
        return;
      }
      
      // Generate response from Gemini
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `You are an AI scheduling assistant. The user says: "${userMessage}"
      
      If this is a scheduling request, please extract the following details:
      - date: [date]
      - time: [time]
      - title: [event title]
      - description: [event description]
      
      Be specific with the extracted details. If any detail is not mentioned, make a reasonable assumption.
      
      If it's not a scheduling request, respond naturally and helpfully.
      
      Keep your response concise and focused.`;
      
      const result = await geminiModel.generateContent(prompt);
      const response = result.response.text();
      
      // Add the AI response to chat
      addBotMessage(response);
      
      // Detect if this is a scheduling request
      if (
        isDirectSchedulingRequest || 
        (vectorModel && classification.includes('schedule')) || 
        response.toLowerCase().includes('date:')
      ) {
        console.log("Scheduling request detected");
        const eventDetails = extractEventDetails(response, userMessage);
        setCurrentEvent(eventDetails);
        setTimeout(() => {
          setShowConfirmModal(true);
        }, 500); // Small delay to ensure UI updates properly
      }
      
    } catch (error) {
      console.error("Error generating response:", error);
      addBotMessage("I'm sorry, I encountered an error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm and add event to calendar
  const confirmEvent = () => {
    if (!currentEvent) return;
    
    try {
      addEvent(currentEvent);
      setShowConfirmModal(false);
      addBotMessage(`Great! I've added "${currentEvent.title}" to your calendar on ${currentEvent.date.toLocaleDateString()} at ${currentEvent.date.toLocaleTimeString()}.`);
      onSetShowCalendar(true);
    } catch (error) {
      console.error("Error confirming event:", error);
      addBotMessage("I'm sorry, I encountered an error adding the event to your calendar. Please try again.");
      setShowConfirmModal(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    showConfirmModal,
    setShowConfirmModal,
    currentEvent,
    handleSendMessage,
    confirmEvent,
    messagesEndRef,
  };
};

export default AISchedulerCore;