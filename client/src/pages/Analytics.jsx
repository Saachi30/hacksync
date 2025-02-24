import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI
const GEMINI_API_KEY = 'AIzaSyCFKswhga9q7KF-qZ4ZzwcTxZRtrg6sb7Y';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const Analytics = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Search queries for news API
  const searchQueries = [
    'work life balance',
    'mental wellbeing',
    'social connections',
    'digital detox',
    'mindfulness',
    'healthy relationships',
    'social media stress',
    'personal development',
    'self care',
    'wellness technology'
  ];

  // Fetch news articles
  const getNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
      const response = await fetch(
        `https://newsapi.org/v2/everything?` +
        `q=${encodeURIComponent(`${randomQuery} AND (personal health OR social management OR mental health OR social media impact)`)}&` +
        `language=en&` +
        `sortBy=publishedAt&` +
        `apiKey=294c5ddf4b274ea98ddc8a21d8233a2f`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      
      const validArticles = data.articles.filter(article => 
        article.urlToImage && 
        article.title && 
        article.description &&
        !article.title.includes('[Removed]') &&
        !article.description.includes('[Removed]')
      );

      setNews(validArticles.slice(0, 8));
    } catch (err) {
      setError('Failed to load wellness news. Please try again later.');
      console.error('News fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate AI summary of articles
  const generateSummary = async () => {
    if (news.length === 0) return;
    
    setSummaryLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const articleTitles = news.map(article => article.title).join("\n");
      
      const prompt = `
        Based on these recent news article titles about personal life and social engagement:
        
        ${articleTitles}
        
        Please provide:
        1. A brief summary of the main themes (2 sentences)
        2. One practical tip for improving work-life balance today
        3. A meaningful insight about social connections in the digital age
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      setSummary(text);
    } catch (err) {
      console.error('AI summary generation error:', err);
      setSummary("Unable to generate AI insights at this time. Please try again later.");
    } finally {
      setSummaryLoading(false);
    }
  };

  // Initialize news fetch and set interval
  useEffect(() => {
    getNews();
    const interval = setInterval(getNews, 30 * 60 * 1000); // Refresh every 30 minutes
    return () => clearInterval(interval);
  }, []);

  // Generate summary when news changes
  useEffect(() => {
    if (news.length > 0) {
      generateSummary();
    }
  }, [news]);

  // Filter articles based on active tab
  const getFilteredArticles = () => {
    if (activeTab === 'all') return news;
    
    return news.filter(article => {
      const content = (article.title + article.description).toLowerCase();
      switch (activeTab) {
        case 'mental':
          return content.includes('mental') || content.includes('wellbeing') || content.includes('stress');
        case 'social':
          return content.includes('social') || content.includes('relationship') || content.includes('connection');
        case 'tech':
          return content.includes('digital') || content.includes('technology') || content.includes('media');
        case 'self':
          return content.includes('self') || content.includes('personal') || content.includes('development');
        default:
          return true;
      }
    });
  };

  // Format publication date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-12">
      {/* Header */}
      <header className="bg-indigo-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Personal Life & Social Engagement Hub</h1>
          <p className="mt-2 text-indigo-100">Stay informed with the latest insights for a balanced life</p>
        </div>
      </header>

      {/* AI Summary Section */}
      <section className="bg-white shadow-md rounded-lg mx-4 lg:mx-auto max-w-6xl -mt-6 p-6">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">AI Wellness Insights</h2>
        </div>
        
        {summaryLoading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="prose max-w-none">
            {summary.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-3 text-gray-600">{paragraph}</p>
            ))}
          </div>
        )}
        
      
      </section>

      {/* Category Tabs */}
      <div className="container mx-auto px-4 mt-8">
        <div className="flex overflow-x-auto pb-2 mb-4">
          <button 
            className={`px-4 py-2 mr-2 rounded-full ${activeTab === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setActiveTab('all')}
          >
            All Topics
          </button>
          <button 
            className={`px-4 py-2 mr-2 rounded-full ${activeTab === 'mental' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setActiveTab('mental')}
          >
            Mental Health
          </button>
          <button 
            className={`px-4 py-2 mr-2 rounded-full ${activeTab === 'social' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setActiveTab('social')}
          >
            Social Connections
          </button>
          <button 
            className={`px-4 py-2 mr-2 rounded-full ${activeTab === 'tech' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setActiveTab('tech')}
          >
            Digital Wellness
          </button>
          <button 
            className={`px-4 py-2 mr-2 rounded-full ${activeTab === 'self' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setActiveTab('self')}
          >
            Self-Care
          </button>

          <button 
          onClick={generateSummary}
          className="ml-96 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Refresh Insights
        </button>
        </div>
      </div>

      {/* News Articles */}
      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">{error}</div>
            <button 
              onClick={getNews}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getFilteredArticles().map((article, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img 
                    src={article.urlToImage} 
                    alt={article.title} 
                    className="h-48 w-full object-cover"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/400/320';
                      e.target.alt = 'No image available';
                    }}
                  />
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-1">{formatDate(article.publishedAt)} · {article.source.name}</div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{article.description}</p>
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Read More →
                    </a>
                  </div>
                </div>
              ))}
            </div>
            
            {getFilteredArticles().length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No articles found for this category.</p>
                <button 
                  onClick={() => setActiveTab('all')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  View All Articles
                </button>
              </div>
            )}
          </>
        )}
      </main>

     
    </div>
  );
};

export default Analytics;