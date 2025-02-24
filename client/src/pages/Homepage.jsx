import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, BarChart2, Heart, MessageCircle, User, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50  z-32 to-blue-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="flex items-center">
                <Heart className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">MindSync</span>
              </span>
              
              <div className="hidden md:block ml-10">
                <div className="flex items-center space-x-4">
                  <a href="#features" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Features</a>
                  <a href="#how-it-works" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">How It Works</a>
                  <a href="#testimonials" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Testimonials</a>
                  <a href="#pricing" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Pricing</a>
                </div>
              </div>
            </div>
            
            {/* Replace the existing login/signup buttons with Link components */}
            <div className="hidden md:flex items-center">
              <Link to="/login">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Log In</button>
              </Link>
              <Link to="/register">
                <button className="ml-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  Sign Up
                </button>
              </Link>
            </div>
            
            <div className="flex items-center md:hidden">
              <button onClick={toggleMenu} className="text-gray-500 hover:text-indigo-600">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu with updated Link components */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#features" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600">Features</a>
              <a href="#how-it-works" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600">How It Works</a>
              <a href="#testimonials" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600">Testimonials</a>
              <a href="#pricing" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600">Pricing</a>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5">
                <Link to="/login">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Log In</button>
                </Link>
                <Link to="/register">
                  <button className="ml-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 md:pr-10">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                Balance your life, <span className="text-indigo-600">effortlessly</span>
              </h1>
              <p className="mt-5 text-xl text-gray-500">
                Your personal AI assistant that helps you maintain the perfect balance between work, social life, and personal well-being.
              </p>
              <div className="mt-8 flex space-x-4">
                <button className="px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  Get Started
                </button>
                <button className="px-6 py-3 text-base font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50">
                  Learn More
                </button>
              </div>
              
              <div className="mt-6 flex items-center">
                <div className="flex -space-x-2">
                  <img className="h-8 w-8 rounded-full ring-2 ring-white" src="/api/placeholder/32/32" alt="User avatar" />
                  <img className="h-8 w-8 rounded-full ring-2 ring-white" src="/api/placeholder/32/32" alt="User avatar" />
                  <img className="h-8 w-8 rounded-full ring-2 ring-white" src="/api/placeholder/32/32" alt="User avatar" />
                </div>
                <span className="ml-3 text-sm text-gray-500">Join 10,000+ users finding balance</span>
              </div>
            </div>
            
            <div className="mt-10 md:mt-0 md:w-1/2">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-white" />
                    <span className="ml-2 text-white font-medium">
                      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-white font-medium">
                    {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-4">
                    <div className="text-lg font-medium text-gray-900">Your Balanced Day</div>
                    <div className="text-sm text-gray-500">Optimized for productivity and well-being</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start p-3 bg-green-50 rounded-md">
                      <div className="flex-shrink-0">
                        <BarChart2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Work session: Project presentation</p>
                        <p className="text-xs text-gray-500">9:00 AM - 11:30 AM (Your most productive hours)</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start p-3 bg-blue-50 rounded-md">
                      <div className="flex-shrink-0">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Coffee with Sarah</p>
                        <p className="text-xs text-gray-500">12:00 PM - 1:00 PM (You haven't met in 2 weeks)</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start p-3 bg-purple-50 rounded-md">
                      <div className="flex-shrink-0">
                        <Heart className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Yoga session</p>
                        <p className="text-xs text-gray-500">5:30 PM - 6:30 PM (Stress relief recommended)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-indigo-50 rounded-md">
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 text-indigo-600" />
                      <span className="ml-2 text-sm font-medium text-gray-900">AI Assistant Suggestion</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      "You've been working intensely this week. Consider calling your parents tonight, they'd appreciate it."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Features Designed for Balance
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our AI-powered assistant helps you maintain balance in all aspects of your life.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-indigo-50 rounded-lg p-6">
                <div className="w-12 h-12 rounded-md bg-indigo-600 flex items-center justify-center">
                  <BarChart2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Intelligent User Profiling</h3>
                <p className="mt-2 text-base text-gray-500">
                  Uses your demographics, interests, health data, and behavior patterns to create a personalized experience.
                </p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-6">
                <div className="w-12 h-12 rounded-md bg-indigo-600 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Cognitive Overload Prevention</h3>
                <p className="mt-2 text-base text-gray-500">
                  AI models predict when you're likely to feel overwhelmed and suggest schedule adjustments to reduce stress.
                </p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-6">
                <div className="w-12 h-12 rounded-md bg-indigo-600 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Social Interaction Recommendations</h3>
                <p className="mt-2 text-base text-gray-500">
                  Suggests optimal times for social engagements to maintain meaningful relationships with friends and family.
                </p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-6">
                <div className="w-12 h-12 rounded-md bg-indigo-600 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Dynamic Scheduling</h3>
                <p className="mt-2 text-base text-gray-500">
                  Creates customized schedules for work, socializing, and self-care based on your evolving preferences and energy levels.
                </p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-6">
                <div className="w-12 h-12 rounded-md bg-indigo-600 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">AI Chatbot Support</h3>
                <p className="mt-2 text-base text-gray-500">
                  Voice and text-based assistant that answers queries about your schedule and provides personalized recommendations.
                </p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-6">
                <div className="w-12 h-12 rounded-md bg-indigo-600 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Emotional Analysis</h3>
                <p className="mt-2 text-base text-gray-500">
                  Uses NLP and multimodal AI to analyze your mood and suggest activities that improve your emotional well-being.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-12 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Advanced AI technology that adapts to your unique lifestyle.
            </p>
          </div>

          <div className="mt-12">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-indigo-50 text-lg font-medium text-gray-900">
                  Powered by Deep Learning
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">Predictive Analytics</h3>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                          <span className="text-white text-xs">1</span>
                        </div>
                      </div>
                      <p className="ml-3 text-sm text-gray-500">
                        RNNs & LSTMs model your routines and suggest optimal times for activities
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                          <span className="text-white text-xs">2</span>
                        </div>
                      </div>
                      <p className="ml-3 text-sm text-gray-500">
                        Reinforcement Learning optimizes your time by learning from your feedback
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                          <span className="text-white text-xs">3</span>
                        </div>
                      </div>
                      <p className="ml-3 text-sm text-gray-500">
                        NLP & CNNs analyze your communications to understand your social patterns
                      </p>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">Personalization & Adaptation</h3>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                          <span className="text-white text-xs">1</span>
                        </div>
                      </div>
                      <p className="ml-3 text-sm text-gray-500">
                        Multimodal AI integrates data from multiple sources for holistic insights
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                          <span className="text-white text-xs">2</span>
                        </div>
                      </div>
                      <p className="ml-3 text-sm text-gray-500">
                        Adaptive learning evolves with your changing preferences over time
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                          <span className="text-white text-xs">3</span>
                        </div>
                      </div>
                      <p className="ml-3 text-sm text-gray-500">
                        Continuous feedback loops ensure the system always meets your needs
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              What Our Users Say
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="bg-indigo-50 rounded-lg p-6">
              <div className="flex items-center">
                <img className="h-12 w-12 rounded-full" src="/api/placeholder/48/48" alt="User avatar" />
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Sarah Johnson</h4>
                  <p className="text-sm text-gray-500">Marketing Executive</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                "This app has completely transformed how I manage my hectic schedule. The AI recommendations have helped me maintain meaningful social connections despite my busy career."
              </p>
            </div>

            <div className="bg-indigo-50 rounded-lg p-6">
              <div className="flex items-center">
                <img className="h-12 w-12 rounded-full" src="/api/placeholder/48/48" alt="User avatar" />
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">David Chen</h4>
                  <p className="text-sm text-gray-500">Software Developer</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                "I used to work until burnout and neglect my personal life. The cognitive overload detection has been a game-changer, helping me maintain balance and actually improve my productivity."
              </p>
            </div>

            <div className="bg-indigo-50 rounded-lg p-6">
              <div className="flex items-center">
                <img className="h-12 w-12 rounded-full" src="/api/placeholder/48/48" alt="User avatar" />
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Emily Rodriguez</h4>
                  <p className="text-sm text-gray-500">Graduate Student</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                "As a student juggling research, classes, and a social life, this app has been invaluable. It helps me schedule effectively based on my energy levels throughout the day."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to find your balance?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-100">
            Join thousands of users who have transformed their lives with our AI-powered assistant.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <button className="px-5 py-3 text-base font-medium text-indigo-600 bg-white rounded-md hover:bg-indigo-50">
                Get Started For Free
              </button>
            </div>
            <div className="ml-3 inline-flex">
              <button className="px-5 py-3 text-base font-medium text-white border border-transparent rounded-md hover:bg-indigo-800">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Product
              </h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Features</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Company
              </h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">About</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Careers</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Resources
              </h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Privacy</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Terms</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Connect
              </h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Twitter</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Facebook</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Instagram</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-700 pt-8 flex items-center justify-between">
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-indigo-400" />
              <span className="ml-2 text-gray-300">LifeBalance</span>
            </div>
            <p className="text-base text-gray-400">
              &copy; 2025 LifeBalance. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;