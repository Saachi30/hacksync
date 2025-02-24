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

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, PenTool, AlertCircle, Mic, MicOff, FileText, SmilePlus } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

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

// Mood emoji mapping
const moodEmojis = {
  'Happy': '😊',
  'Sad': '😔',
  'Angry': '😠',
  'Anxious': '😰',
  'Neutral': '😐'
};

const DiaryEntry = () => {
  const [diaryText, setDiaryText] = useState('');
  const [mood, setMood] = useState('happy');
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState(null);
  const [isMoodAnalyzing, setIsMoodAnalyzing] = useState(false);

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

  // Speech recognition setup
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Update diary text when transcript changes
  useEffect(() => {
    if (transcript) {
      setDiaryText(prevText => {
        // If there's already text, add a space before the new transcript
        const separator = prevText.length > 0 ? ' ' : '';
        return prevText + separator + transcript;
      });
    }
  }, [transcript]);

  // Analyze mood whenever diary text changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (diaryText.length > 20) {
        analyzeMood(diaryText);
      } else if (diaryText.length === 0) {
        setMoodAnalysis(null);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [diaryText]);

  // Toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      setIsSpeechActive(false);
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
      setIsSpeechActive(true);
    }
  };

  // Analyze mood with the ML model
  const analyzeMood = async (text) => {
    try {
      setIsMoodAnalyzing(true);
      const response = await fetch('http://localhost:5002/api/predict_mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) throw new Error('Failed to analyze mood');
      
      const data = await response.json();
      setMoodAnalysis(data);
    } catch (error) {
      console.error('Error analyzing mood:', error);
      // Don't set error state to avoid interfering with the main UI
    } finally {
      setIsMoodAnalyzing(false);
    }
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
      // Stop speech recognition if it's active
      if (listening) {
        SpeechRecognition.stopListening();
        setIsSpeechActive(false);
      }
      
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

  // Generate PDF from analysis results
  const generatePDF = () => {
    if (!analysisResults) return;
    
    // Create a hidden form for POST request to a PDF generation service
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://api.html2pdf.app/v1/generate';
    form.target = '_blank'; // Open in new tab
    
    // Create HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Wellness Report - ${date}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #4B5563; }
          h1 { color: #6366F1; border-bottom: 2px solid #A78BFA; padding-bottom: 10px; }
          h2 { color: #6366F1; margin-top: 30px; }
          .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
          .metric-card { border: 1px solid #DDD6FE; border-radius: 10px; padding: 15px; background-color: #F5F3FF; }
          .metric-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .recommendation { border: 1px solid #DDD6FE; border-radius: 10px; padding: 15px; margin-top: 15px; background-color: #F5F3FF; }
          .recommendation-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .priority { background-color: #EDE9FE; color: #6366F1; padding: 3px 10px; border-radius: 12px; font-size: 0.9em; }
          ul { padding-left: 20px; }
          li { margin-bottom: 5px; }
          .footer { margin-top: 40px; text-align: center; font-size: 0.8em; color: #9CA3AF; }
          .mood-analysis { background-color: #F0FDFA; border: 1px solid #5EEAD4; border-radius: 10px; padding: 15px; margin-top: 20px; }
          .mood-flex { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .mood-chart { margin-top: 15px; height: 20px; border-radius: 10px; overflow: hidden; background-color: #E5E7EB; }
          .mood-bar { height: 20px; float: left; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Wellness Report - ${date}</h1>
        <p>Selected Mood: ${mood}</p>
        
        ${moodAnalysis ? `
        <div class="mood-analysis">
          <h3>AI Mood Analysis</h3>
          <div class="mood-flex">
            <span>Detected Mood: ${moodAnalysis.primary_mood}</span>
            <span>Confidence: ${(moodAnalysis.confidence * 100).toFixed(1)}%</span>
          </div>
          <div class="mood-chart">
            ${moodAnalysis.mood_ranking.map(m => `
              <div class="mood-bar" style="width: ${m.score}%; background-color: ${
                m.mood === 'Happy' ? '#10B981' : 
                m.mood === 'Sad' ? '#6366F1' : 
                m.mood === 'Angry' ? '#EF4444' : 
                m.mood === 'Anxious' ? '#F59E0B' : 
                '#9CA3AF'
              };">
                ${m.score > 15 ? `${m.mood} ${m.score}%` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <div class="diary-content">
          <h2>Journal Entry</h2>
          <p>${diaryText.replace(/\n/g, '<br>')}</p>
        </div>
        
        <h2>Wellness Metrics</h2>
        <div class="metrics">
          ${Object.entries(analysisResults.metrics).map(([metric, data]) => `
            <div class="metric-card">
              <h3>${metric.replace(/_/g, ' ')}</h3>
              <div class="metric-row">
                <span>Current:</span>
                <span>${data.current.toFixed(1)}</span>
              </div>
              <div class="metric-row">
                <span>Target:</span>
                <span>${data.target.toFixed(1)}</span>
              </div>
              <div class="metric-row">
                <span>Change:</span>
                <span style="color: ${
                  data.status === 'improve' ? '#EF4444' : 
                  data.status === 'good' ? '#10B981' : '#F59E0B'
                };">${data.change.toFixed(1)}%</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <h2>Personalized Recommendations</h2>
        ${analysisResults.recommendations.map((rec, index) => `
          <div class="recommendation">
            <div class="recommendation-header">
              <h3>${rec.category}</h3>
              <span class="priority">Priority: ${rec.priority}</span>
            </div>
            <ul>
              ${rec.suggestions.map(suggestion => `
                <li>${suggestion}</li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
        
        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} with Daily Reflection App</p>
        </div>
      </body>
      </html>
    `;
    
    // Add hidden fields to the form
    const apiKeyField = document.createElement('input');
    apiKeyField.type = 'hidden';
    apiKeyField.name = 'apiKey';
    apiKeyField.value = 'your-html2pdf-api-key'; // You would need to replace this with an actual API key
    
    const htmlField = document.createElement('input');
    htmlField.type = 'hidden';
    htmlField.name = 'html';
    htmlField.value = htmlContent;
    
    const filenameField = document.createElement('input');
    filenameField.type = 'hidden';
    filenameField.name = 'fileName';
    filenameField.value = `Wellness_Report_${date.replace(/-/g, '')}.pdf`;
    
    form.appendChild(apiKeyField);
    form.appendChild(htmlField);
    form.appendChild(filenameField);
    
    // Since we can't use a real HTML2PDF API in this example, we'll create a simpler backup method
    // that uses browser's print functionality
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const renderMoodAnalysisBox = () => {
    if (!moodAnalysis) return null;
    
    return (
      <div className="absolute top-4 right-14 bg-white p-3 rounded-lg shadow-md z-10 w-64 border-l-4 border-indigo-500">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold flex items-center">
            {moodEmojis[moodAnalysis.primary_mood] || '🤔'} {moodAnalysis.primary_mood}
          </span>
          <span className="text-xs bg-indigo-100 text-indigo-800 rounded-full px-2 py-1">
            {(moodAnalysis.confidence * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          {moodAnalysis.mood_ranking.map((moodItem, index) => (
            <div
              key={index}
              className="h-full float-left"
              style={{
                width: `${moodItem.score}%`, 
                backgroundColor: 
                  moodItem.mood === 'Happy' ? theme.success : 
                  moodItem.mood === 'Sad' ? theme.primary : 
                  moodItem.mood === 'Angry' ? theme.error : 
                  moodItem.mood === 'Anxious' ? theme.warning : 
                  '#9CA3AF'
              }}
              title={`${moodItem.mood}: ${moodItem.score}%`}
            ></div>
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          AI-detected mood based on your writing
        </div>
      </div>
    );
  };

  // Speech recognition not supported message
  if (!browserSupportsSpeechRecognition) {
    // Just show a console warning instead of blocking the app
    console.warn("Browser doesn't support speech recognition.");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 relative overflow-hidden mt-12">
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
            
            {/* Render mood analysis box */}
            {renderMoodAnalysisBox()}
            
            {/* Mood analysis indicator */}
            {isMoodAnalyzing && !moodAnalysis && (
              <div className="absolute top-4 right-14 p-2 rounded-lg bg-white shadow-md">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
                  <span className="text-xs text-gray-600">Analyzing mood...</span>
                </div>
              </div>
            )}
            
            {/* Mic button for speech recognition */}
            <button
              onClick={toggleSpeechRecognition}
              className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-300 ${
                isSpeechActive ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              title={isSpeechActive ? "Stop recording" : "Start voice recording"}
            >
              {isSpeechActive ? (
                <Mic size={20} />
              ) : (
                <MicOff size={20} />
              )}
            </button>
            
            {/* Listening indicator */}
            {listening && (
              <div className="absolute top-4 left-4 flex items-center space-x-2 text-indigo-600">
                <span className="inline-block h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-sm font-medium">Recording...</span>
              </div>
            )}
            
            <div className="absolute bottom-4 right-4 text-sm text-indigo-600 font-medium">
              {diaryText.length} characters
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => {
                setDiaryText('');
                setMoodAnalysis(null);
                resetTranscript();
                if (listening) {
                  SpeechRecognition.stopListening();
                  setIsSpeechActive(false);
                }
              }}
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
            <div className="relative flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Wellness Analysis
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2" />
              </div>
              
              {/* PDF Download Button */}
              <button
                onClick={generatePDF}
                className="flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 shadow-md hover:shadow-lg"
              >
                <FileText size={18} className="mr-2" />
                Download PDF
              </button>
            </div>
            
            {/* Display mood analysis in results if available */}
            {moodAnalysis && (
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                    <SmilePlus size={22} className="mr-2 text-indigo-600" />
                    AI Mood Analysis
                  </h3>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    {(moodAnalysis.confidence * 100).toFixed(1)}% confidence
                  </span>
                </div>
                
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-4">
                    {moodEmojis[moodAnalysis.primary_mood] || '🤔'}
                  </span>
                  <div>
                    <p className="font-medium text-lg">{moodAnalysis.primary_mood}</p>
                    <p className="text-sm text-gray-600">Detected from your journal entry</p>
                  </div>
                </div>
                
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">Mood breakdown:</p>
                  {moodAnalysis.mood_ranking.map((moodItem, index) => (
                    <div key={index} className="mb-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{moodEmojis[moodItem.mood] || '🤔'} {moodItem.mood}</span>
                        <span className="text-sm font-medium">{moodItem.score}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full"
                          style={{
                            width: `${moodItem.score}%`,
                            backgroundColor: 
                              moodItem.mood === 'Happy' ? theme.success : 
                              moodItem.mood === 'Sad' ? theme.primary : 
                              moodItem.mood === 'Angry' ? theme.error : 
                              moodItem.mood === 'Anxious' ? theme.warning : 
                              '#9CA3AF'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
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
    </div>
  );
};

export default DiaryEntry;