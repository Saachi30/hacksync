// import React, { useState } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { Calendar, PenTool, AlertCircle } from 'lucide-react';

// const theme = {
//   primary: '#B5838D',
//   secondary: '#E5989B',
//   tertiary: '#FFB4A2',
//   background: '#FFCDB2',
//   text: '#6D6875',
//   white: '#FFFFFF',
//   success: '#97B6A5',
//   warning: '#E6B89C',
//   error: '#E5989B',
// };

// const DiaryEntry = () => {
//   const [diaryText, setDiaryText] = useState('');
//   const [mood, setMood] = useState('happy');
//   const [isLoading, setIsLoading] = useState(false);
//   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
//   const [analysisResults, setAnalysisResults] = useState(null);
//   const [error, setError] = useState(null);

//   const moods = [
//     { emoji: '😊', value: 'happy', label: 'Happy' },
//     { emoji: '😌', value: 'calm', label: 'Calm' },
//     { emoji: '😔', value: 'sad', label: 'Sad' },
//     { emoji: '😫', value: 'stressed', label: 'Stressed' },
//     { emoji: '😴', value: 'tired', label: 'Tired' }
//   ];

//   const defaultMetrics = {
//     dailyStress: 5,
//     coreCircle: 5,
//     supportingOthers: 5,
//     sleepHours: 7
//   };

//   const extractMetricsFromText = async (text) => {
//     try {
//       const response = await fetch(
//         "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBXvyQXa7LjTNqqDkm3uvubhhkQ1A5dWZs",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             contents: [{
//               parts: [{
//                 text: `Extract metrics from this diary entry. For any metrics that cannot be determined, use these default values: dailyStress=${defaultMetrics.dailyStress}, coreCircle=${defaultMetrics.coreCircle}, supportingOthers=${defaultMetrics.supportingOthers}, sleepHours=${defaultMetrics.sleepHours}. Return a valid JSON object with exactly these keys: dailyStress (1-10), coreCircle (1-10), supportingOthers (1-10), sleepHours (1-10). Diary: ${text}`
//               }]
//             }],
//             generationConfig: {
//               maxOutputTokens: 100,
//               temperature: 0.2
//             }
//           }),
//         }
//       );

//       if (!response.ok) throw new Error('Failed to analyze diary text');
      
//       const data = await response.json();
//       const metricsText = data.candidates[0].content.parts[0].text;
      
//       const jsonMatch = metricsText.match(/```json\s*({[\s\S]*?})\s*```/) || 
//                        metricsText.match(/```\s*({[\s\S]*?})\s*```/) ||
//                        metricsText.match(/({[\s\S]*?})/);
                       
//       if (!jsonMatch) {
//         throw new Error('Could not extract valid JSON from response');
//       }

//       const metrics = JSON.parse(jsonMatch[1]);

//       const validatedMetrics = {
//         dailyStress: Number(metrics.dailyStress) || defaultMetrics.dailyStress,
//         coreCircle: Number(metrics.coreCircle) || defaultMetrics.coreCircle,
//         supportingOthers: Number(metrics.supportingOthers) || defaultMetrics.supportingOthers,
//         sleepHours: Number(metrics.sleepHours) || defaultMetrics.sleepHours
//       };

//       Object.keys(validatedMetrics).forEach(key => {
//         if (key === 'sleepHours') {
//           validatedMetrics[key] = Math.max(0, Math.min(24, validatedMetrics[key]));
//         } else {
//           validatedMetrics[key] = Math.max(1, Math.min(10, validatedMetrics[key]));
//         }
//       });

//       return validatedMetrics;
//     } catch (error) {
//       console.error('Error in extractMetricsFromText:', error);
//       return defaultMetrics;
//     }
//   };

//   const submitDiary = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       const extractedMetrics = await extractMetricsFromText(diaryText);
      
//       const response = await fetch('http://localhost:5000/api/predict', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(extractedMetrics),
//       });
      
//       if (!response.ok) throw new Error('Failed to process diary entry');
      
//       const data = await response.json();
//       setAnalysisResults(data);
      
//     } catch (error) {
//       console.error('Error:', error);
//       setError('Failed to process diary entry. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderAnalysisResults = () => {
//     if (!analysisResults) return null;

//     return (
//       <div className="mt-8 space-y-6">
//         <h2 className="text-2xl font-bold" style={{ color: theme.primary }}>
//           Wellness Analysis
//         </h2>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {Object.entries(analysisResults.metrics).map(([metric, data]) => (
//             <div 
//               key={metric} 
//               className="p-4 rounded-lg"
//               style={{ backgroundColor: theme.background }}
//             >
//               <h3 className="font-semibold mb-2">{metric.replace(/_/g, ' ')}</h3>
//               <div className="space-y-1">
//                 <p>Current: {data.current.toFixed(1)}</p>
//                 <p>Target: {data.target.toFixed(1)}</p>
//                 <p style={{ color: data.status === 'improve' ? theme.error : data.status === 'good' ? theme.success : theme.warning }}>
//                   Change: {data.change.toFixed(1)}%
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="space-y-4">
//           <h3 className="text-xl font-semibold" style={{ color: theme.primary }}>
//             Personalized Recommendations
//           </h3>
//           {analysisResults.recommendations.map((rec, index) => (
//             <div 
//               key={index}
//               className="p-4 rounded-lg"
//               style={{ backgroundColor: theme.background }}
//             >
//               <h4 className="font-semibold mb-2">
//                 {rec.category} - Priority: {rec.priority}
//               </h4>
//               <ul className="list-disc pl-5 space-y-1">
//                 {rec.suggestions.map((suggestion, idx) => (
//                   <li key={idx}>{suggestion}</li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-8">
//       <div className="flex items-center justify-between mb-8">
//         <h1 className="text-4xl font-bold" style={{ color: theme.primary }}>
//           Daily Reflection
//         </h1>
//         <div className="flex items-center space-x-2">
//           <Calendar size={20} color={theme.primary} />
//           <input
//             type="date"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//             className="px-3 py-2 rounded-lg border-none"
//             style={{ backgroundColor: theme.background }}
//           />
//         </div>
//       </div>

//       {error && (
//         <div 
//           className="mb-6 p-4 rounded-lg flex items-start space-x-2"
//           style={{ backgroundColor: theme.error, color: theme.white }}
//         >
//           <AlertCircle className="h-5 w-5 mt-0.5" />
//           <div>
//             <p className="font-semibold">Error</p>
//             <p>{error}</p>
//           </div>
//         </div>
//       )}

//       <div className="bg-white p-8 rounded-xl shadow-md">
//         <div className="mb-6">
//           <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>
//             How are you feeling today?
//           </h3>
//           <div className="flex space-x-4">
//             {moods.map(({ emoji, value, label }) => (
//               <button
//                 key={value}
//                 onClick={() => setMood(value)}
//                 className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${
//                   mood === value ? 'transform scale-110' : ''
//                 }`}
//                 style={{
//                   backgroundColor: mood === value ? theme.background : theme.white,
//                   border: `2px solid ${mood === value ? theme.primary : theme.background}`
//                 }}
//               >
//                 <span className="text-2xl mb-1">{emoji}</span>
//                 <span className="text-sm" style={{ color: theme.text }}>{label}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="relative">
//           <textarea
//             value={diaryText}
//             onChange={(e) => setDiaryText(e.target.value)}
//             placeholder="Write about your day... How did you feel? What made you smile? What challenged you? How well did you sleep? Did you spend time with friends or family?"
//             rows="12"
//             className="w-full p-6 rounded-lg border-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
//             style={{ 
//               backgroundColor: theme.background,
//               color: theme.text
//             }}
//           />
//           <div 
//             className="absolute bottom-4 right-4 text-sm"
//             style={{ color: theme.primary }}
//           >
//             {diaryText.length} characters
//           </div>
//         </div>

//         <div className="flex justify-end space-x-4 mt-6">
//           <button
//             onClick={() => setDiaryText('')}
//             className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
//             style={{ 
//               backgroundColor: theme.background,
//               color: theme.text
//             }}
//           >
//             Clear
//           </button>
//           <button
//             onClick={submitDiary}
//             disabled={isLoading || !diaryText.trim()}
//             className="flex items-center px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-50"
//             style={{ backgroundColor: theme.primary }}
//           >
//             {isLoading ? (
//               <>
//                 <div className="animate-spin mr-2">⭐</div>
//                 Processing...
//               </>
//             ) : (
//               <>
//                 <PenTool size={20} className="mr-2" />
//                 Analyze Entry
//               </>
//             )}
//           </button>
//         </div>
//       </div>

//       {renderAnalysisResults()}
//     </div>
//   );
// };

// export default DiaryEntry;

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, PenTool, AlertCircle } from 'lucide-react';

const theme = {
  primary: '#6366F1',
  secondary: '#A78BFA',
  tertiary: '#DDD6FE',
  background: '#F5F3FF',
  text: '#4B5563',
  white: '#FFFFFF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

// SVG Components
// const WaveDecoration = () => (
//   <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" fill="none">
//     <path d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" 
//           fill="url(#gradient)" fillOpacity="0.4"/>
//     <defs>
//       <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
//         <stop offset="0%" stopColor="#818CF8"/>
//         <stop offset="100%" stopColor="#C084FC"/>
//       </linearGradient>
//     </defs>
//   </svg>
// );

const WaveDecoration = ({ className }) => (
  <svg className={`absolute w-full ${className}`} viewBox="0 0 1440 120" fill="none">
    <path d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" 
          fill="url(#gradient)" fillOpacity="0.4"/>
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#818CF8"/>
        <stop offset="100%" stopColor="#C084FC"/>
      </linearGradient>
    </defs>
  </svg>
);


const FloatingIllustration = () => (
  <svg className="absolute top-10 right-10 w-32 h-32 opacity-50" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" fill="url(#floating-gradient)" />
    <path d="M30 50C30 40 70 40 70 50C70 60 30 60 30 50Z" fill="#fff" fillOpacity="0.3"/>
    <defs>
      <linearGradient id="floating-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C084FC"/>
        <stop offset="100%" stopColor="#818CF8"/>
      </linearGradient>
    </defs>
  </svg>
);

const DiaryEntry = () => {
    const [diaryText, setDiaryText] = useState('');
  const [mood, setMood] = useState('happy');
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);

  const moods = [
    { emoji: '😊', value: 'happy', label: 'Happy' },
    { emoji: '😌', value: 'calm', label: 'Calm' },
    { emoji: '😔', value: 'sad', label: 'Sad' },
    { emoji: '😫', value: 'stressed', label: 'Stressed' },
    { emoji: '😴', value: 'tired', label: 'Tired' }
  ];

  const defaultMetrics = {
    dailyStress: 5,
    coreCircle: 5,
    supportingOthers: 5,
    sleepHours: 7
  };

  const extractMetricsFromText = async (text) => {
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBXvyQXa7LjTNqqDkm3uvubhhkQ1A5dWZs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Extract metrics from this diary entry. For any metrics that cannot be determined, use these default values: dailyStress=${defaultMetrics.dailyStress}, coreCircle=${defaultMetrics.coreCircle}, supportingOthers=${defaultMetrics.supportingOthers}, sleepHours=${defaultMetrics.sleepHours}. Return a valid JSON object with exactly these keys: dailyStress (1-10), coreCircle (1-10), supportingOthers (1-10), sleepHours (1-10). Diary: ${text}`
              }]
            }],
            generationConfig: {
              maxOutputTokens: 100,
              temperature: 0.2
            }
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to analyze diary text');
      
      const data = await response.json();
      const metricsText = data.candidates[0].content.parts[0].text;
      
      const jsonMatch = metricsText.match(/```json\s*({[\s\S]*?})\s*```/) || 
                       metricsText.match(/```\s*({[\s\S]*?})\s*```/) ||
                       metricsText.match(/({[\s\S]*?})/);
                       
      if (!jsonMatch) {
        throw new Error('Could not extract valid JSON from response');
      }

      const metrics = JSON.parse(jsonMatch[1]);

      const validatedMetrics = {
        dailyStress: Number(metrics.dailyStress) || defaultMetrics.dailyStress,
        coreCircle: Number(metrics.coreCircle) || defaultMetrics.coreCircle,
        supportingOthers: Number(metrics.supportingOthers) || defaultMetrics.supportingOthers,
        sleepHours: Number(metrics.sleepHours) || defaultMetrics.sleepHours
      };

      Object.keys(validatedMetrics).forEach(key => {
        if (key === 'sleepHours') {
          validatedMetrics[key] = Math.max(0, Math.min(24, validatedMetrics[key]));
        } else {
          validatedMetrics[key] = Math.max(1, Math.min(10, validatedMetrics[key]));
        }
      });

      return validatedMetrics;
    } catch (error) {
      console.error('Error in extractMetricsFromText:', error);
      return defaultMetrics;
    }
  };

  const submitDiary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const extractedMetrics = await extractMetricsFromText(diaryText);
      
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(extractedMetrics),
      });
      
      if (!response.ok) throw new Error('Failed to process diary entry');
      
      const data = await response.json();
      setAnalysisResults(data);
      
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to process diary entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAnalysisResults = () => {
    if (!analysisResults) return null;
    return (
            <div className="mt-8 space-y-6">
              <h2 className="text-2xl font-bold" style={{ color: theme.primary }}>
                Wellness Analysis
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(analysisResults.metrics).map(([metric, data]) => (
                  <div 
                    key={metric} 
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: theme.background }}
                  >
                    <h3 className="font-semibold mb-2">{metric.replace(/_/g, ' ')}</h3>
                    <div className="space-y-1">
                      <p>Current: {data.current.toFixed(1)}</p>
                      <p>Target: {data.target.toFixed(1)}</p>
                      <p style={{ color: data.status === 'improve' ? theme.error : data.status === 'good' ? theme.success : theme.warning }}>
                        Change: {data.change.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
      
              <div className="space-y-4">
                <h3 className="text-xl font-semibold" style={{ color: theme.primary }}>
                  Personalized Recommendations
                </h3>
                {analysisResults.recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: theme.background }}
                  >
                    <h4 className="font-semibold mb-2">
                      {rec.category} - Priority: {rec.priority}
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {rec.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
        };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 relative overflow-hidden">
      {/* <FloatingIllustration /> */}
      <WaveDecoration className="top-0 rotate-180 left-0" />
  <WaveDecoration className="bottom-0" />
      <div className="max-w-4xl mx-auto relative">
        <div className="flex items-center justify-between mb-8">
          <div className="relative">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Daily Reflection
            </h1>
            <div className="h-2 w-24 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2" />
          </div>
          
          <div className="flex items-center space-x-3 bg-white p-3 rounded-xl shadow-lg">
            <Calendar size={24} className="text-indigo-600" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-gray-700 font-medium"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-lg bg-opacity-90 relative">
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              How are you feeling today?
            </h3>
            <div className="flex flex-wrap gap-4">
              {moods.map(({ emoji, value, label }) => (
                <button
                  key={value}
                  onClick={() => setMood(value)}
                  className={`group flex flex-col items-center p-4 rounded-xl transition-all duration-300 hover:transform hover:scale-105 ${
                    mood === value ? 'bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md' : 'bg-gray-50'
                  }`}
                >
                  <span className={`text-3xl transform transition-transform duration-300 ${
                    mood === value ? 'scale-110' : 'group-hover:scale-110'
                  }`}>{emoji}</span>
                  <span className={`text-sm mt-2 font-medium ${
                    mood === value ? 'text-indigo-600' : 'text-gray-600'
                  }`}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <textarea
              value={diaryText}
              onChange={(e) => setDiaryText(e.target.value)}
              placeholder="Write about your day... How did you feel? What made you smile? What challenged you? How well did you sleep? Did you spend time with friends or family?"
              rows="12"
              className="w-full p-6 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-gray-700 placeholder-gray-400"
            />
            <div className="absolute bottom-4 right-4 text-sm text-indigo-600 font-medium">
              {diaryText.length} characters
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setDiaryText('')}
              className="px-6 py-3 rounded-xl font-medium transition-all duration-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
            >
              Clear
            </button>
            <button
              onClick={submitDiary}
              disabled={isLoading || !diaryText.trim()}
              className="flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin mr-2">⭐</div>
                  Processing...
                </>
              ) : (
                <>
                  <PenTool size={20} className="mr-2" />
                  Analyze Entry
                </>
              )}
            </button>
          </div>
        </div>

        {analysisResults && (
          <div className="mt-12 space-y-8">
            <div className="relative">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Wellness Analysis
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(analysisResults.metrics).map(([metric, data]) => (
                <div 
                  key={metric}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <h3 className="font-semibold text-lg mb-4 text-gray-800">
                    {metric.replace(/_/g, ' ')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current</span>
                      <span className="font-medium text-indigo-600">{data.current.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Target</span>
                      <span className="font-medium text-purple-600">{data.target.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Change</span>
                      <span className={`font-medium ${
                        data.status === 'improve' ? 'text-red-500' :
                        data.status === 'good' ? 'text-green-500' : 'text-yellow-500'
                      }`}>
                        {data.change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="relative">
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Personalized Recommendations
                </h3>
                <div className="h-1 w-16 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2" />
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {analysisResults.recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg text-gray-800">
                        {rec.category}
                      </h4>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700">
                        Priority: {rec.priority}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {rec.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start space-x-3">
                          <span className="text-indigo-500 mt-1">•</span>
                          <span className="text-gray-600">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <WaveDecoration />
    </div>
  );
};

export default DiaryEntry;