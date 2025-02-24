import React, { useState } from 'react';
import { Calendar, Brain, Users, Mail, X } from 'lucide-react';
import { sendEmail } from '../components/email';
import PersonalLifeAIAgent from './AiAgents';
import Bct from '../components/blockchain';

// Utility function to safely handle Gemini API calls
const API_KEY = 'AIzaSyBmZcIOLIY8YfOtR4mTDi9tMuml7mFktP4'; // Replace with your actual API key

// Updated API call function
const callGeminiAPI = async (prompt) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.candidates[0].content.parts[0].text
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get response from AI'
    };
  }
};


// Reusable components remain the same as before
const Card = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-indigo-100">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-lg bg-indigo-50">
        <Icon className="w-6 h-6 text-indigo-600" />
      </div>
      <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
        {title}
      </h2>
    </div>
    {children}
  </div>
);

const Button = ({ onClick, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300
      ${disabled 
        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
        : 'bg-gradient-to-r from-indigo-600 to-purple-800 text-white hover:from-indigo-700 hover:to-indigo-900 active:transform active:scale-98 shadow-md hover:shadow-lg'}`}
  >
    {children}
  </button>
);

const Input = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="mb-3">
    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-gray-100 transition-all duration-300 text-gray-800 placeholder-gray-400"
    />
  </div>
);

const EmailModal = ({ isOpen, onClose, onSend, loading }) => {
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Send Response via Email</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <Input
          label="Your Email Address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Enter your email address"
        />
        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => onSend(email)}
            disabled={loading || !email}
          >
            {loading ? 'Sending...' : 'Send Email'}
          </Button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const ResultBox = ({ children, error, onEmail }) => {
  const [showModal, setShowModal] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ loading: false, message: null });
  const formattedResponse = error ? children : formatResponse(children);

  const handleSendEmail = async (email) => {
    setEmailStatus({ loading: true, message: null });
    const result = await sendEmail(children, email);
    setEmailStatus({ 
      loading: false, 
      message: result.success ? 'Email sent successfully!' : result.message 
    });
    if (result.success) {
      setTimeout(() => {
        setShowModal(false);
        setEmailStatus({ loading: false, message: null });
      }, 2000);
    }
  };

  return (
    <>
      {!error && (
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300"
          >
            <Mail className="w-4 h-4" />
            <span>Email this response</span>
          </button>
        </div>
      )}

      <div className={`rounded-lg transition-all duration-300 overflow-hidden ${
        error 
          ? 'bg-red-50 border border-red-200' 
          : 'bg-gradient-to-br from-purple-50 to-indigo-50 border border-indigo-200'
      }`}>
        {error ? (
          <div className="p-4 text-red-700 font-medium">{children}</div>
        ) : (
          <div className="divide-y divide-indigo-200">
            {formattedResponse.map((section, index) => (
              <div key={index} className="p-4">
                <h3 className="font-semibold text-indigo-800 mb-2">{section.title}</h3>
                <div className="text-gray-700 space-y-2">
                  {section.content.map((item, i) => (
                    <p key={i} className="leading-relaxed">{item}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EmailModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEmailStatus({ loading: false, message: null });
        }}
        onSend={handleSendEmail}
        loading={emailStatus.loading}
      />

      {emailStatus.message && (
        <div className={`mt-3 p-3 rounded-lg text-sm ${
          emailStatus.message.includes('success')
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {emailStatus.message}
        </div>
      )}
    </>
  );
};
const formatResponse = (response) => {
  if (!response) return [];
  
  // Split response into sections based on common AI response patterns
  const sections = response.split(/(?=\n[A-Z][^a-z:]*:)/g)
    .filter(section => section.trim())
    .map(section => {
      const [title, ...content] = section.split('\n').filter(line => line.trim());
      return {
        title: title.replace(':', '').trim(),
        content: content
          .filter(line => line.trim())
          .map(line => line.trim())
      };
    });

  // If no clear sections are detected, create a single "Analysis" section
  if (sections.length === 0 || (sections.length === 1 && !sections[0].title)) {
    return [{
      title: 'Analysis',
      content: response.split('\n').filter(line => line.trim())
    }];
  }

  return sections;
};

const SchedulePredictor = () => {
  const [formData, setFormData] = useState({
    workHours: '',
    energyLevel: '',
    exercisePreference: '',
    socialPreference: ''
  });
  const [result, setResult] = useState({ data: null, error: null });
  const [loading, setLoading] = useState(false);

  const predictSchedule = async () => {
    if (!formData.workHours || !formData.energyLevel) {
      setResult({ data: null, error: 'Please fill in at least work hours and energy level.' });
      return;
    }

    setLoading(true);
    const prompt = `Create an optimal daily schedule for a user with these preferences:
                   - Work hours: ${formData.workHours}
                   - Energy level: ${formData.energyLevel}
                   - Exercise preference: ${formData.exercisePreference}
                   - Social preference: ${formData.socialPreference}
                   Provide a detailed hour-by-hour schedule that optimizes their day.`;

    const response = await callGeminiAPI(prompt);
    setLoading(false);
    setResult({ 
      data: response.success ? response.data : null,
      error: response.success ? null : response.error
    });
  };

  return (
    <Card title="Schedule Predictor" icon={Calendar}>
      <Input
        label="Work Hours"
        value={formData.workHours}
        onChange={(value) => setFormData({...formData, workHours: value})}
        placeholder="e.g., 9 AM - 5 PM"
      />
      <Input
        label="Energy Level"
        value={formData.energyLevel}
        onChange={(value) => setFormData({...formData, energyLevel: value})}
        placeholder="e.g., High in mornings"
      />
      <Input
        label="Exercise Preference"
        value={formData.exercisePreference}
        onChange={(value) => setFormData({...formData, exercisePreference: value})}
        placeholder="e.g., Early morning"
      />
      <Input
        label="Social Preference"
        value={formData.socialPreference}
        onChange={(value) => setFormData({...formData, socialPreference: value})}
        placeholder="e.g., Evening activities"
      />
      <Button onClick={predictSchedule} disabled={loading}>
        {loading ? 'Generating Schedule...' : 'Generate Optimal Schedule'}
      </Button>
      {result.error && <ResultBox error>{result.error}</ResultBox>}
      {result.data && <ResultBox>{result.data}</ResultBox>}
    </Card>
  );
};

const MoodAnalyzer = () => {
  const [formData, setFormData] = useState({
    sleepHours: '',
    meetings: '',
    tasksCompleted: '',
    lastSocialInteraction: ''
  });
  const [result, setResult] = useState({ data: null, error: null });
  const [loading, setLoading] = useState(false);

  const analyzeMood = async () => {
    if (!formData.sleepHours || !formData.meetings) {
      setResult({ data: null, error: 'Please fill in at least sleep hours and meetings.' });
      return;
    }

    setLoading(true);
    const prompt = `Analyze user's current mood and stress level based on:
                   - Sleep hours: ${formData.sleepHours}
                   - Meetings today: ${formData.meetings}
                   - Tasks completed: ${formData.tasksCompleted}
                   - Last social interaction: ${formData.lastSocialInteraction}
                   Provide a detailed mood assessment and specific recommendations.`;

    const response = await callGeminiAPI(prompt);
    setLoading(false);
    setResult({ 
      data: response.success ? response.data : null,
      error: response.success ? null : response.error
    });
  };

  return (
    <Card title="Mood Analyzer" icon={Brain}>
      <Input
        label="Sleep Hours"
        type="number"
        value={formData.sleepHours}
        onChange={(value) => setFormData({...formData, sleepHours: value})}
        placeholder="e.g., 7"
      />
      <Input
        label="Number of Meetings Today"
        type="number"
        value={formData.meetings}
        onChange={(value) => setFormData({...formData, meetings: value})}
        placeholder="e.g., 3"
      />
      <Input
        label="Tasks Completed"
        value={formData.tasksCompleted}
        onChange={(value) => setFormData({...formData, tasksCompleted: value})}
        placeholder="e.g., 3/8"
      />
      <Input
        label="Last Social Interaction"
        value={formData.lastSocialInteraction}
        onChange={(value) => setFormData({...formData, lastSocialInteraction: value})}
        placeholder="e.g., 2 days ago"
      />
      <Button onClick={analyzeMood} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Current Mood'}
      </Button>
      {result.error && <ResultBox error>{result.error}</ResultBox>}
      {result.data && <ResultBox>{result.data}</ResultBox>}
    </Card>
  );
};

const SocialSuggester = () => {
  const [formData, setFormData] = useState({
    interests: '',
    availableTime: '',
    socialCircle: '',
    location: ''
  });
  const [result, setResult] = useState({ data: null, error: null });
  const [loading, setLoading] = useState(false);

  const getSuggestions = async () => {
    if (!formData.interests || !formData.availableTime) {
      setResult({ data: null, error: 'Please fill in at least interests and available time.' });
      return;
    }

    setLoading(true);
    const prompt = `Suggest social activities based on:
                   - User interests: ${formData.interests}
                   - Available time: ${formData.availableTime}
                   - Social circle: ${formData.socialCircle}
                   - Location: ${formData.location}
                   Provide specific activity suggestions and potential scheduling.`;

    const response = await callGeminiAPI(prompt);
    setLoading(false);
    setResult({ 
      data: response.success ? response.data : null,
      error: response.success ? null : response.error
    });
  };

  return (
    <Card title="Social Activity Suggester" icon={Users}>
      <Input
        label="Interests"
        value={formData.interests}
        onChange={(value) => setFormData({...formData, interests: value})}
        placeholder="e.g., reading, hiking, photography"
      />
      <Input
        label="Available Time"
        value={formData.availableTime}
        onChange={(value) => setFormData({...formData, availableTime: value})}
        placeholder="e.g., weekday evenings and weekends"
      />
      <Input
        label="Social Circle"
        value={formData.socialCircle}
        onChange={(value) => setFormData({...formData, socialCircle: value})}
        placeholder="e.g., 5 close friends, open to meeting new people"
      />
      <Input
        label="Location"
        value={formData.location}
        onChange={(value) => setFormData({...formData, location: value})}
        placeholder="e.g., urban area"
      />
      <Button onClick={getSuggestions} disabled={loading}>
        {loading ? 'Getting Suggestions...' : 'Get Social Suggestions'}
      </Button>
      {result.error && <ResultBox error>{result.error}</ResultBox>}
      {result.data && <ResultBox>{result.data}</ResultBox>}
    </Card>
  );
};
const PersonalLifeAssistant = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
            Personal Life & Social Engagement Agents
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Optimize your daily routine, understand your emotional well-being, and enhance your social connections
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <SchedulePredictor />
            <MoodAnalyzer />
          </div>
          <div className="space-y-6">
            <SocialSuggester />
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <Bct />
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <PersonalLifeAIAgent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalLifeAssistant;