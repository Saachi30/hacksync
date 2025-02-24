import React, { useState, useCallback } from 'react';
import { Calendar, Mail, Camera } from 'lucide-react';

// Import core functionality and UI components
import AISchedulerCore from './SchedulerCore';
import { 
  ConfirmModal, 
  EmailPreview, 
  CalendarView, 
  MessagesList, 
  AddEventButton, 
  EmailNotification, 
  InputArea 
} from './SchedularUI';

// Vector embeddings data for query classification
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

// Main AI Scheduler Component
const AISchedulerChatbot = () => {
  // State management
  const [events, setEvents] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  
  // Memoized event handler to prevent unnecessary re-renders
  const addEvent = useCallback((event) => {
    console.log("Adding event:", event);
    setEvents(prev => [...prev, event]);
  }, []);

  // Handle email sending
  const handleEmailSent = useCallback(() => {
    setEmailSent(true);
    setShowEmailPreview(false);
    
    // Hide email notification after 3 seconds
    setTimeout(() => {
      setEmailSent(false);
    }, 3000);
  }, []);

  // Get core functionality with memoized callbacks
  const core = AISchedulerCore({
    addEvent,
    queryTypes: QUERY_TYPES,
    onSetShowCalendar: setShowCalendar,
    onSetShowEmailPreview: setShowEmailPreview,
    onSetIsLoading: setIsLoading
  });

  // Auto-schedule event handler
  const handleAddEvent = useCallback(() => {
    core.setInput("Schedule a meeting");
    // Use a short timeout to ensure the input is set before sending
    setTimeout(() => core.handleSendMessage(), 100);
  }, [core]);

  // Navigate to facial recognition page
  const navigateToFacial = () => {
    window.location.href = '/facial';
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-800 flex items-center">
          <Calendar className="mr-2" size={24} />
          AI Scheduler Assistant
        </h1>
        
        <a 
          onClick={navigateToFacial}
          className="flex items-center gap-1 text-purple-600 hover:text-purple-800 cursor-pointer transition-colors"
        >
          <Camera size={16} className="inline" />
          <span className="text-sm">Wanna have a glimpse of yours?</span>
        </a>
      </div>
      
      {/* Calendar Toggle Button */}
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="flex items-center gap-2 bg-blue-100 text-blue-800 py-2 px-4 rounded-md hover:bg-blue-200 transition"
        >
          <Calendar size={16} />
          {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
        </button>
        
        <button
          onClick={() => setShowEmailPreview(true)}
          className="flex items-center gap-2 bg-green-100 text-green-800 py-2 px-4 rounded-md hover:bg-green-200 transition"
          disabled={events.length === 0}
        >
          <Mail size={16} />
          Email Schedule
        </button>
      </div>
      
      {/* Calendar View */}
      {showCalendar && (
        <CalendarView 
          selectedDate={selectedDate} 
          setSelectedDate={setSelectedDate} 
          events={events} 
        />
      )}
      
      {/* Chat Container */}
      <div className="flex flex-col flex-grow bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Messages Display */}
        <MessagesList 
          messages={core.messages}
          isLoading={isLoading}
          messagesEndRef={core.messagesEndRef}
        />
        
        {/* Input Area */}
        <InputArea
          input={core.input}
          setInput={core.setInput}
          handleSendMessage={core.handleSendMessage}
          isLoading={isLoading}
        />
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmModal
        show={core.showConfirmModal}
        event={core.currentEvent}
        onCancel={() => core.setShowConfirmModal(false)}
        onConfirm={core.confirmEvent}
      />
      
      {/* Email Preview */}
      <EmailPreview
        show={showEmailPreview}
        events={events}
        onCancel={() => setShowEmailPreview(false)}
        onSend={handleEmailSent}
      />
      
      {/* Email notification */}
      <EmailNotification show={emailSent} />
      
      {/* Add Event Button */}
      <AddEventButton onAddEvent={handleAddEvent} />
    </div>
  );
};

export default AISchedulerChatbot;