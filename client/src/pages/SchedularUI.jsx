// src/components/AISchedulerUI.js
import React from 'react';
import { Calendar, Mail, Send, Plus } from 'lucide-react';
import emailjs from '@emailjs/browser';


// Replace these with your actual EmailJS credentials
const EMAIL_SERVICE_ID = 'service_i3t8r4m';  // Get this from your EmailJS dashboard
const EMAIL_TEMPLATE_ID = 'template_ob48nmp'; // Get this from your EmailJS dashboard
const EMAIL_USER_ID = 'hfx--3KcbLgX-EWIv';       // Get this from your EmailJS dashboard

// Initialize EmailJS with your user ID
emailjs.init(EMAIL_USER_ID);

// Confirmation Modal Component
export const ConfirmModal = ({ show, event, onCancel, onConfirm }) => {
  if (!show || !event) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
        <h3 className="text-xl font-bold mb-4">Confirm Event</h3>
        <div className="mb-4 bg-gray-50 p-4 rounded-md">
          <p className="mb-2"><strong>Title:</strong> {event.title}</p>
          <p className="mb-2"><strong>Date:</strong> {event.date.toLocaleDateString()}</p>
          <p className="mb-2"><strong>Time:</strong> {event.date.toLocaleTimeString()}</p>
          <p className="mb-2"><strong>Description:</strong> {event.description || "No description provided"}</p>
          <p><strong>Priority:</strong> 
            <span className={event.priority === 'high' ? 'text-red-600 font-bold ml-2' : 'text-blue-600 ml-2'}>
              {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}
            </span>
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
          >
            Add to Calendar
          </button>
        </div>
      </div>
    </div>
  );
};


// Calendar View Component
export const CalendarView = ({ selectedDate, setSelectedDate, events }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentMonth = selectedDate.toLocaleString('default', { month: 'long' });
  const currentYear = selectedDate.getFullYear();
  
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Create calendar grid
  let calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null); // Empty cells for days before the 1st of the month
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }
  
  // Find events for each day
  const getEventsForDay = (day) => {
    if (!day) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === selectedDate.getMonth() &&
             eventDate.getFullYear() === selectedDate.getFullYear();
    });
  };
  
  // Check if date is today
  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           selectedDate.getMonth() === today.getMonth() && 
           selectedDate.getFullYear() === today.getFullYear();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <button 
          className="text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition"
          onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
        >
          &lt;
        </button>
        <h2 className="text-xl font-bold text-gray-800">{currentMonth} {currentYear}</h2>
        <button 
          className="text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition"
          onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
        >
          &gt;
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => (
          <div key={day} className="text-center font-medium text-gray-500 text-sm py-1">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, index) => (
          <div 
            key={index} 
            className={`min-h-12 border rounded-md ${
              day 
                ? isToday(day)
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-white hover:bg-gray-50'
                : 'bg-gray-100'
            } transition duration-200`}
          >
            {day && (
              <div className="p-1">
                <div className={`text-right text-sm ${isToday(day) ? 'font-bold text-blue-600' : ''}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {getEventsForDay(day).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`text-xs p-1 truncate rounded ${
                        event.priority === 'high' 
                          ? 'bg-red-100 text-red-800 border-l-2 border-red-500' 
                          : 'bg-blue-100 text-blue-800 border-l-2 border-blue-500'
                      }`}
                      title={`${event.title} - ${event.date.toLocaleTimeString()}`}
                    >
                      {event.date.getHours().toString().padStart(2, '0')}:
                      {event.date.getMinutes().toString().padStart(2, '0')} {event.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Message Display Component
export const MessagesList = ({ messages, isLoading, messagesEndRef }) => {
  return (
    <div className="flex-grow p-4 overflow-y-auto">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`max-w-3/4 mb-3 ${
            message.sender === 'user' ? 'ml-auto' : 'mr-auto'
          }`}
        >
          <div
            className={`px-4 py-2 rounded-lg ${
              message.sender === 'user'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-800 shadow-sm'
            }`}
          >
            {message.text}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start mb-3">
          <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg shadow-sm flex items-center">
            <span className="animate-pulse mr-2">●</span>
            <span className="animate-pulse mr-2 animation-delay-200">●</span>
            <span className="animate-pulse animation-delay-400">●</span>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

// Add Event Button Component
export const AddEventButton = ({ onAddEvent }) => (
  <button
    onClick={onAddEvent}
    className="flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-600 transition-colors fixed bottom-20 right-6 z-10"
  >
    <Plus size={20} />
    New Event
  </button>
);

// Email Notification Component
export const EmailNotification = ({ show }) => {
  if (!show) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center animate-slideIn">
      <Mail className="mr-2" size={16} />
      Email sent successfully!
    </div>
  );
};

// Input Area Component
export const InputArea = ({ input, setInput, handleSendMessage, isLoading }) => {
  return (
    <div className="p-4 bg-gray-50 border-t">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          className="border rounded-full py-2 px-4 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || input.trim() === ''}
          className="bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 disabled:bg-blue-300 shadow-sm flex items-center"
        >
          <Send size={16} className="mr-1" />
          Send
        </button>
      </div>
    </div>
  );
};