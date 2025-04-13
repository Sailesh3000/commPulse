import React, { useState, useContext } from 'react';
import { Search, BarChart2, Shield, Cloud, Download, Bell, ArrowRight, Moon, Sun } from 'lucide-react';
import { AuthProvider, AuthContext, LoginModal, UserAvatar } from './AuthComponents';
import LoadingSpinner from './ui/loading';
import { BackgroundLines } from './ui/background-lines';
import { cn } from '../lib/utils';
import axios from 'axios';
import AnalysisResults from './AnalysisResults';

const colors = {
  primary: '#83181B',    // New Brand Red
  secondary: '#282828',  // Dark Gray
  accent: '#606060',     // Medium Gray
  dark: '#0F0F0F',      // Almost Black
  light: '#F9F9F9',     // Off White
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

  return (
    <div className={darkMode ? 'dark' : ''}>
      <BackgroundLines className="min-h-screen w-full relative bg-black">
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
                      <rect x="4" y="12" width="4" height="8" fill="#83181B"/>
                      <rect x="10" y="6" width="4" height="14" fill="#83181B"/>
                      <rect x="16" y="2" width="4" height="18" fill="#83181B"/>
                    </svg>
                    <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-500">CommPulse</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={toggleDarkMode}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-500"
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
                          className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-500 hover:opacity-80"
                        >
                          Login
                        </button>
                        <button 
                          className="bg-[#83181B] text-white px-4 py-2 rounded-lg hover:bg-[#6A1316]"
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
                  <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-500 text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
                    Monitor YouTube Comments <br /> in Real-Time
                  </h2>
                  <p className="max-w-xl mx-auto text-sm md:text-lg bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-500 font-sans font-bold text-center">
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
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-600 bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#83181B] text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
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
            <section className="py-10 md:py-20 backdrop-blur-sm transition-colors duration-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <h2 className="text-3xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-500 font-sans font-bold">Powerful Features</h2>
                  <p className="mt-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-500 font-sans font-bold">Everything you need to understand your audience</p>
                </div>

                <div className="mt-10 md:mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      icon: <BarChart2 className="h-8 w-8 text-red-600" />,
                      title: "Real-Time Analytics",
                      description: "Monitor comment sentiment and trends as they happen with live dashboard updates.",
                      className: "bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-500 font-sans font-bold"
                    },
                    {
                      icon: <Shield className="h-8 w-8 text-red-600" />,
                      title: "Toxic Content Detection",
                      description: "Automatically identify and flag potentially harmful or inappropriate comments.",
                      className: "bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-500 font-sans font-bold"
                    },
                    {
                      icon: <Cloud className="h-8 w-8 text-red-600" />,
                      title: "Keyword Tracking",
                      description: "Track important topics and themes in your community discussions.",
                      className: "bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-500 font-sans font-bold"
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
                    <div key={index} className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-lg hover:shadow-lg transition-shadow border border-gray-600">
                      <div className="w-12 h-12 bg-red-900/20 rounded-lg flex items-center justify-center">
                        {feature.icon}
                      </div>
                      <h3 className="mt-4 text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500">{feature.title}</h3>
                      <p className="mt-2 bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="backdrop-blur-sm py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold text-white">Start Monitoring Your YouTube Comments</h2>
                <p className="mt-4 text-red-100">Get valuable insights from your community today</p>
                <button className="mt-8 px-8 py-3 bg-white text-[#83181B] rounded-lg hover:bg-[#83181B]/10 dark:hover:bg-[#83181B]/20">
                  Get Started Free
                </button>
              </div>
            </section>

            {/* Footer */}
            <footer className="backdrop-blur-sm text-gray-300 py-12 mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="text-white font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500">Product</h3>
                    <ul className="space-y-2">
                      <li><a href="#" className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500 hover:opacity-80">Features</a></li>
                      <li><a href="#" className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500 hover:opacity-80">Pricing</a></li>
                      <li><a href="#" className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500 hover:opacity-80">API</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500">Resources</h3>
                    <ul className="space-y-2">
                      <li><a href="#" className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500 hover:opacity-80">Documentation</a></li>
                      <li><a href="#" className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500 hover:opacity-80">Guides</a></li>
                      <li><a href="#" className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500 hover:opacity-80">Support</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500">Company</h3>
                    <ul className="space-y-2">
                      <li><a href="#" className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500 hover:opacity-80">About</a></li>
                      <li><a href="#" className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500 hover:opacity-80">Blog</a></li>
                      <li><a href="#" className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500 hover:opacity-80">Careers</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500">Legal</h3>
                    <ul className="space-y-2">
                      <li><a href="#" className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500 hover:opacity-80">Privacy</a></li>
                      <li><a href="#" className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500 hover:opacity-80">Terms</a></li>
                      <li><a href="#" className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500 hover:opacity-80">Security</a></li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-800 text-center">
                  <p className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-500">&copy; 2025 CommPulse. All rights reserved.</p>
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