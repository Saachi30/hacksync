import React, { useState } from 'react';
// Theme colors
const theme = {
    primary: '#B5838D',
    secondary: '#E5989B',
    tertiary: '#FFB4A2',
    background: '#FFCDB2',
    text: '#6D6875',
    white: '#FFFFFF',
    success: '#97B6A5',
    warning: '#E6B89C',
    error: '#E5989B',
    pastels: ['#FFB4A2', '#E5989B', '#B5838D', '#FFCDB2', '#97B6A5']
  };
  
const UserInput = () => {
  const [metrics, setMetrics] = useState({
    age: '',
    fruitsVeggies: '',
    dailyStress: '',
    coreCircle: '',
    supportingOthers: '',
    donation: '',
    bmiRange: '',
    dailySteps: '',
    sleepHours: '',
    weeklyMeditation: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metrics),
      });
      
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      
      // Store results in localStorage
      localStorage.setItem('latestMetrics', JSON.stringify(data.metrics));
      localStorage.setItem('latestRecommendations', JSON.stringify(data.recommendations));
      
      alert('Data submitted successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-brown-800 mb-8">Manual Metrics Input</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              value={metrics.age}
              onChange={(e) => setMetrics({ ...metrics, age: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Fruits & Vegetables Consumption (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={metrics.fruitsVeggies}
              onChange={(e) => setMetrics({ ...metrics, fruitsVeggies: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Daily Stress Level (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={metrics.dailyStress}
              onChange={(e) => setMetrics({ ...metrics, dailyStress: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500"
              required
            />
          </div>
          
          {/* Add similar input fields for remaining metrics */}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brown-600 text-white py-2 px-4 rounded-md hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Submitting...' : 'Submit Metrics'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserInput;