import React, { useState } from 'react';
import { Calendar, Brain, Users } from 'lucide-react';
import PersonalLifeAIAgent from './AiAgents';
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
  <div className="bg-white rounded-lg shadow-md p-6 mb-6 transition-all hover:shadow-lg">
    <div className="flex items-center gap-2 mb-4 text-blue-600">
      <Icon className="w-6 h-6" />
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    </div>
    {children}
  </div>
);

const Button = ({ onClick, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-3 px-4 rounded-md text-white font-medium transition-all
      ${disabled 
        ? 'bg-gray-400 cursor-not-allowed' 
        : 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-98'}`}
  >
    {children}
  </button>
);

const Input = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

const ResultBox = ({ children, error }) => (
  <div className={`mt-4 p-4 rounded-md ${error ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'}`}>
    {children}
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
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Personal Life & Social Engagement Assistant
      </h1>
      <div className="grid gap-6">
        <SchedulePredictor />
        <MoodAnalyzer />
        <SocialSuggester />
        <PersonalLifeAIAgent />
      </div>
    </div>
  );
};

export default PersonalLifeAssistant;