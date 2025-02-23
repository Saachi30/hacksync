import React, { useState } from 'react';
import { Calendar, Brain, Users } from 'lucide-react';
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
    <div className="bg-white rounded-xl shadow-md p-6 h-full transition-all hover:shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-6 text-blue-600">
        <Icon className="w-7 h-7" />
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
  
  const Button = ({ onClick, disabled, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all
        ${disabled 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-98'}`}
    >
      {children}
    </button>
  );
  
  const Input = ({ label, value, onChange, placeholder, type = "text" }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
      />
    </div>
  );
  
  const ResultBox = ({ children, error }) => (
    <div className={`mt-6 p-4 rounded-lg ${error ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-gray-700'}`}>
      <div className="whitespace-pre-wrap">{children}</div>
    </div>
  );

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Personal Life & Social Engagement Assistant
            </h1>
            <p className="text-lg text-gray-600">
              Optimize your schedule, track your mood, and enhance your social life
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <SchedulePredictor />
              <MoodAnalyzer />
            </div>
            <div className="space-y-8">
              <SocialSuggester />
              <Bct />
              <PersonalLifeAIAgent />
            </div>
          </div>
        </div>
      </div>
    );
  };

export default PersonalLifeAssistant;