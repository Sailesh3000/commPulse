import React, { useState, useContext } from 'react';
import { Search, BarChart2, Shield, Cloud, Download, Bell, ArrowRight, Moon, Sun } from 'lucide-react';
import { AuthProvider, AuthContext, LoginModal, UserAvatar } from './AuthComponents';
import LoadingSpinner from './ui/loading';
import { BackgroundLines } from './ui/background-lines';
import { cn } from '../lib/utils';
import axios from 'axios';
import AnalysisResults from './AnalysisResults';

const colors = {
  primaryDark: '#83181B',    // Dark Brand Red (for dark mode)
  primaryLight: '#E53E3E',   // Bright Brand Red (for light mode)
  secondary: '#282828',      // Dark Gray
  accent: '#606060',         // Medium Gray
  dark: '#0F0F0F',          // Almost black
  light: '#F9F9F9',         // Off White
};

const extractVideoId = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    } else if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1);
    }
    return null;
  } catch (error) {
    return null;
  }
};

const HomePage = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated, user, login, logout } = useContext(AuthContext);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setError('Please enter a valid YouTube URL');
      return;
    }
  
    setIsAnalyzing(true);
    try {
      const response = await axios.post('http://localhost:5000/analyze', { videoId }, { withCredentials: true });
      setAnalysisResults(response.data);
      console.log(response.data);
      setShowResults(true);  // Show results page after successful analysis
    } catch (error) {
      console.error('Full error:', error);
      setError(error.response?.data?.error || 'Failed to analyze video');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBackToAnalysis = () => {
    setShowResults(false);
    setVideoUrl(''); 
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const backgroundColor = darkMode ? "black" : "bg-gray-50";


  return (
    <div className={darkMode ? 'dark' : ''}>
      <BackgroundLines className={`min-h-screen w-full relative ${backgroundColor}`} darkMode={darkMode}>
        {showResults ? (
          <div className="relative z-10">
            <AnalysisResults 
              results={analysisResults} 
              onBack={handleBackToAnalysis}
              darkMode={darkMode}
            />
          </div>
        ) : (
          <div className="relative z-10 flex flex-col min-h-screen">
            {/* Header/Nav */}
            <header className="w-full">
              <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <svg className="h-8 w-8" viewBox="0 0 24 24">
                      <rect x="4" y="12" width="4" height="8" fill={darkMode ? "#83181B" : "#E53E3E"}/>
                      <rect x="10" y="6" width="4" height="14" fill={darkMode ? "#83181B" : "#E53E3E"}/>
                      <rect x="16" y="2" width="4" height="18" fill={darkMode ? "#83181B" : "#E53E3E"}/>
                    </svg>
                    <span className={`ml-2 text-2xl font-bold ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>CommPulse</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={toggleDarkMode}
                      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}
                    >
                      {darkMode ? 
                        <Sun className="h-5 w-5 text-gray-300" /> : 
                        <Moon className="h-5 w-5 text-gray-600" />
                      }
                    </button>

                    {isAuthenticated ? (
                      <UserAvatar user={user} onLogout={logout} />
                    ) : (
                      <>
                        <button 
                          onClick={() => setShowLoginModal(true)}
                          className={`hover:opacity-80 ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}
                        >
                          Login
                        </button>
                        <button 
                          className={`text-white px-4 py-2 rounded-lg ${darkMode ? 'bg-[#83181B] hover:bg-[#6A1316]' : 'bg-[#E53E3E] hover:bg-[#C53030]'}`}
                        >
                          Get Started
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </nav>

              {/* Hero Section */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
                <div className="text-center">
                  <h2 className={`text-center text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>
                    Monitor YouTube Comments <br /> in Real-Time
                  </h2>
                  <p className={`max-w-xl mx-auto text-sm md:text-lg font-sans font-bold text-center ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>
                    Analyze sentiment, detect toxic content, and gain valuable insights from your YouTube community with advanced AI-powered analytics.
                  </p>
                </div>

                <div className="mt-10 max-w-xl mx-auto">
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="Paste your YouTube video URL here"
                      className={`flex-1 px-4 py-3 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-800/50 text-white placeholder-gray-400' : 'border-gray-300 bg-white/90 text-gray-800 placeholder-gray-500'} backdrop-blur-sm focus:ring-2 focus:border-transparent`}
                    />
                    <button
                      type="submit"
                      className={`px-6 py-3 text-white rounded-lg flex items-center justify-center gap-2 ${darkMode ? 'bg-[#83181B] hover:bg-[#6A1316]' : 'bg-[#E53E3E] hover:bg-[#C53030]'}`}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <LoadingSpinner />
                          Analyzing
                        </>
                      ) : (
                        <>
                          Analyze <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                  {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}
                </div>
              </div>
            </header>

            {/* Features Section */}
            <section className={`py-10 md:py-20 backdrop-blur-sm transition-colors duration-200 ${darkMode ? 'black' : 'bg-white/80'}`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <h2 className={`text-3xl font-sans font-bold ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>Powerful Features</h2>
                  <p className={`mt-4 font-sans font-bold ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>Everything you need to understand your audience</p>
                </div>

                <div className="mt-10 md:mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      icon: <BarChart2 className="h-8 w-8 text-red-600" />,
                      title: "Real-Time Analytics",
                      description: "Monitor comment sentiment and trends as they happen with live dashboard updates.",
                      className: darkMode ? "bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500 font-sans font-bold" : "text-black font-sans font-bold"
                    },
                    {
                      icon: <Shield className="h-8 w-8 text-red-600" />,
                      title: "Toxic Content Detection",
                      description: "Automatically identify and flag potentially harmful or inappropriate comments.",
                      className: darkMode ? "bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500 font-sans font-bold" : "text-black font-sans font-bold"
                    },
                    {
                      icon: <Cloud className="h-8 w-8 text-red-600" />,
                      title: "Keyword Tracking",
                      description: "Track important topics and themes in your community discussions.",
                      className: darkMode ? "bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500 font-sans font-bold" : "text-black font-sans font-bold"
                    },
                    {
                      icon: <Bell className="h-8 w-8 text-red-600" />,
                      title: "Smart Notifications",
                      description: "Get alerts for important trends and potential community issues."
                    },
                    {
                      icon: <Download className="h-8 w-8 text-red-600" />,
                      title: "Export Options",
                      description: "Download your analysis data in CSV or Excel format for further processing."
                    },
                    {
                      icon: <Search className="h-8 w-8 text-red-600" />,
                      title: "Advanced Filtering",
                      description: "Filter comments by sentiment, keywords, length, and more."
                    }
                  ].map((feature, index) => (
                    <div key={index} className={`p-6 ${darkMode ? 'bg-gray-800/50 border-gray-600' : 'bg-white/90 border-gray-200'} backdrop-blur-sm rounded-lg hover:shadow-lg transition-shadow border`}>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${darkMode ? 'bg-red-900/20' : 'bg-red-500/20'}`}>
                        {feature.icon}
                      </div>
                      <h3 className={`mt-4 text-xl font-semibold ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>{feature.title}</h3>
                      <p className={`mt-2 ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className={`backdrop-blur-sm py-16 ${darkMode ? 'bg-gray-900/70' : 'bg-gray-100/80'}`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Start Monitoring Your YouTube Comments</h2>
                <p className={`mt-4 ${darkMode ? 'text-red-100' : 'text-red-700'}`}>Get valuable insights from your community today</p>
                <button className={`mt-8 px-8 py-3 ${darkMode ? 'bg-white text-[#83181B] hover:bg-[#83181B]/20' : 'bg-[#E53E3E] text-white hover:bg-[#C53030]'} rounded-lg transition-colors`}>
                  Get Started Free
                </button>
              </div>
            </section>

            {/* Footer */}
            <footer className={`backdrop-blur-sm py-12 mt-auto ${darkMode ? 'text-gray-300 bg-gray-900/70' : 'text-gray-700 bg-gray-100/80'}`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className={`font-semibold mb-4 ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>Product</h3>
                    <ul className="space-y-2">
                      <li><a href="#" className={`hover:opacity-80 ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>Features</a></li>
                      <li><a href="#" className={`hover:opacity-80 ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>Pricing</a></li>
                      <li><a href="#" className={`hover:opacity-80 ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>API</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-4 ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>Resources</h3>
                    <ul className="space-y-2">
                      <li><a href="#" className={`hover:opacity-80 ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>Documentation</a></li>
                      <li><a href="#" className={`hover:opacity-80 ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>Guides</a></li>
                      <li><a href="#" className={`hover:opacity-80 ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>Support</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-4 ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>Company</h3>
                    <ul className="space-y-2">
                      <li><a href="#" className={`hover:opacity-80 ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>About</a></li>
                      <li><a href="#" className={`hover:opacity-80 ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>Blog</a></li>
                      <li><a href="#" className={`hover:opacity-80 ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>Careers</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-4 ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>Legal</h3>
                    <ul className="space-y-2">
                      <li><a href="#" className={`hover:opacity-80 ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>Privacy</a></li>
                      <li><a href="#" className={`hover:opacity-80 ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>Terms</a></li>
                      <li><a href="#" className={`hover:opacity-80 ${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>Security</a></li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-800 text-center">
                  <p className={`${darkMode ? 'bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500' : 'text-black'}`}>&copy; 2025 CommPulse. All rights reserved.</p>
                </div>
              </div>
            </footer>

            <LoginModal 
              isOpen={showLoginModal}
              onClose={() => setShowLoginModal(false)}
              onSuccess={login}
            />
          </div>
        )}
      </BackgroundLines>
    </div>
  );
};

const HomePageWithAuth = () => (
  <AuthProvider>
    <HomePage />
  </AuthProvider>
);

export default HomePageWithAuth;