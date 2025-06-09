import React, { useState, useContext, useEffect } from 'react';
import { Search, BarChart2, Shield, Cloud, Download, Bell, ArrowRight, Moon, Sun, Sparkles, Zap, TrendingUp, Eye, Filter, Users } from 'lucide-react';
import AnalysisResults from './AnalysisResults';

// Mock context and components for demo
const AuthContext = React.createContext({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {}
});

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };
  
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const UserAvatar = ({ user, onLogout }) => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
      {user?.name?.[0] || 'U'}
    </div>
    <button onClick={onLogout} className="text-sm opacity-80 hover:opacity-100">
      Logout
    </button>
  </div>
);

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <button
          onClick={() => {
            onSuccess({ name: 'Demo User' });
            onClose();
          }}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all"
        >
          Demo Login
        </button>
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

// Animated background component
const AnimatedBackground = ({ darkMode }) => (
  <div className="absolute inset-0 overflow-hidden">
    <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-red-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      
      {/* Grid pattern */}
      <div className={`absolute inset-0 ${darkMode ? 'opacity-10' : 'opacity-5'}`} style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, ${darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} 1px, transparent 0)`,
        backgroundSize: '50px 50px'
      }}></div>
    </div>
  </div>
);

// Glass card component
const GlassCard = ({ children, className = '', darkMode }) => (
  <div className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/20'} backdrop-blur-xl rounded-2xl border shadow-2xl ${className}`}>
    {children}
  </div>
);

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showResults, setShowResults] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze video');
      }

      const results = await response.json();
      setAnalysisResults(results);
      setShowResults(true);
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing the video');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const features = [
    {
      icon: <TrendingUp className="h-7 w-7" />,
      title: "Real-Time Analytics",
      description: "Monitor comment sentiment and engagement patterns with live dashboard updates and predictive insights.",
      gradient: "from-blue-500 to-cyan-500",
      delay: "delay-100"
    },
    {
      icon: <Shield className="h-7 w-7" />,
      title: "AI-Powered Moderation",
      description: "Advanced ML algorithms detect toxic content, spam, and harassment with 99.3% accuracy.",
      gradient: "from-green-500 to-emerald-500",
      delay: "delay-200"
    },
    {
      icon: <Eye className="h-7 w-7" />,
      title: "Sentiment Visualization",
      description: "Beautiful charts and heatmaps reveal emotional trends and community mood shifts.",
      gradient: "from-purple-500 to-pink-500",
      delay: "delay-300"
    },
    {
      icon: <Zap className="h-7 w-7" />,
      title: "Instant Alerts",
      description: "Real-time notifications for viral comments, trending topics, and community issues.",
      gradient: "from-yellow-500 to-orange-500",
      delay: "delay-100"
    },
    {
      icon: <Users className="h-7 w-7" />,
      title: "Audience Insights",
      description: "Deep analytics on your community demographics, engagement patterns, and growth metrics.",
      gradient: "from-red-500 to-pink-500",
      delay: "delay-200"
    },
    {
      icon: <Filter className="h-7 w-7" />,
      title: "Smart Filtering",
      description: "Advanced search and filtering with natural language queries and custom rule sets.",
      gradient: "from-indigo-500 to-purple-500",
      delay: "delay-300"
    }
  ];

  if (showResults) {
    return (
      <AnalysisResults 
        results={analysisResults}
        onBack={() => setShowResults(false)}
        darkMode={darkMode}
      />
    );
  }

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen transition-all duration-500`}>
      <div className={`min-h-screen relative ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <AnimatedBackground darkMode={darkMode} />
        
        {/* Cursor follower */}
        <div 
          className="fixed w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full pointer-events-none z-50 opacity-20 blur-sm transition-all duration-300"
          style={{
            left: mousePosition.x - 12,
            top: mousePosition.y - 12,
          }}
        />

        <div className="relative z-10">
          {/* Navigation */}
          <nav className="px-6 py-6">
            <GlassCard darkMode={darkMode} className="px-6 py-4">
              <div className="flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg p-2">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="12" width="4" height="8" fill="white"/>
                        <rect x="10" y="6" width="4" height="14" fill="white"/>
                        <rect x="16" y="2" width="4" height="18" fill="white"/>
                      </svg>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl blur opacity-30 animate-pulse"></div>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                    CommPulse
                  </span>
                  <div className="hidden sm:flex ml-4 px-3 py-1 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full">
                    <span className="text-xs font-semibold text-red-500">AI-POWERED</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={toggleDarkMode}
                    className={`p-3 rounded-xl transition-all hover:scale-110 ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>

                  {isAuthenticated ? (
                    <UserAvatar user={user} onLogout={logout} />
                  ) : (
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setShowLoginModal(true)}
                        className="px-4 py-2 rounded-xl font-semibold hover:bg-white/10 transition-all"
                      >
                        Login
                      </button>
                      <button className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg">
                        Get Started
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </nav>

          {/* Hero Section */}
          <section className="px-6 py-20">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full mb-8 border border-red-500/30">
                <Sparkles className="h-4 w-4 text-red-500" />
                <span className="text-sm font-semibold text-red-500">New: Real-time AI Analysis</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                  Transform
                </span>
                <br />
                YouTube Comments Into
                <br />
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Actionable Insights
                </span>
              </h1>
              
              <p className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Harness the power of advanced AI to analyze sentiment, detect toxicity, and uncover hidden patterns in your YouTube community.
              </p>

              <GlassCard darkMode={darkMode} className="p-8 max-w-2xl mx-auto mb-12">
                <div className="space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="Paste your YouTube video URL here..."
                      className={`w-full px-6 py-4 rounded-2xl text-lg ${darkMode ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' : 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500'} border-2 focus:border-red-500 focus:outline-none transition-all`}
                    />
                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                  </div>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={isAnalyzing}
                    className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-bold text-lg hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isAnalyzing ? (
                      <>
                        <LoadingSpinner />
                        Analyzing Your Video...
                      </>
                    ) : (
                      <>
                        <Zap className="h-6 w-6" />
                        Analyze Comments Now
                        <ArrowRight className="h-6 w-6" />
                      </>
                    )}
                  </button>
                  
                  {error && (
                    <p className="text-red-500 text-center font-semibold">{error}</p>
                  )}
                </div>

                <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-gray-200/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">99.3%</div>
                    <div className="text-sm opacity-80">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">1M+</div>
                    <div className="text-sm opacity-80">Comments Analyzed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">&lt;5s</div>
                    <div className="text-sm opacity-80">Analysis Time</div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </section>

          {/* Features Section */}
          <section className="px-6 py-20">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Powerful Features
                  </span>
                </h2>
                <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Everything you need to understand and grow your community
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <GlassCard 
                    key={index} 
                    darkMode={darkMode} 
                    className={`p-8 hover:scale-105 transition-all duration-500 cursor-pointer group animate-fade-in-up ${feature.delay}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-red-500 group-hover:to-pink-500 transition-all duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                      {feature.description}
                    </p>
                  </GlassCard>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="px-6 py-20">
            <GlassCard darkMode={darkMode} className="max-w-4xl mx-auto p-12 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
                <div className="relative">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    Ready to <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">Revolutionize</span> Your YouTube Analytics?
                  </h2>
                  <p className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Join thousands of creators who trust CommPulse for their community insights
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-bold text-lg hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-xl">
                      Start Free Trial
                    </button>
                    <button className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}>
                      View Demo
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </section>

          {/* Footer */}
          <footer className="px-6 py-12">
            <GlassCard darkMode={darkMode} className="p-8">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                  <div>
                    <h3 className="font-bold mb-4 text-lg">Product</h3>
                    <ul className="space-y-2">
                      <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">Features</a></li>
                      <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">Pricing</a></li>
                      <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">API</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold mb-4 text-lg">Resources</h3>
                    <ul className="space-y-2">
                      <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">Documentation</a></li>
                      <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">Guides</a></li>
                      <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">Support</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold mb-4 text-lg">Company</h3>
                    <ul className="space-y-2">
                      <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">About</a></li>
                      <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">Blog</a></li>
                      <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">Careers</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold mb-4 text-lg">Legal</h3>
                    <ul className="space-y-2">
                      <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">Privacy</a></li>
                      <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">Terms</a></li>
                      <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">Security</a></li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t border-gray-200/20 pt-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center p-1">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="12" width="4" height="8" fill="white"/>
                        <rect x="10" y="6" width="4" height="14" fill="white"/>
                        <rect x="16" y="2" width="4" height="18" fill="white"/>
                      </svg>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                      CommPulse
                    </span>
                  </div>
                  <p className="opacity-80">&copy; 2025 CommPulse. All rights reserved. Built with ❤️ for creators worldwide.</p>
                </div>
              </div>
            </GlassCard>
          </footer>
        </div>

        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={login}
        />
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
};

const HomePageWithAuth = () => (
  <AuthProvider>
    <HomePage />
  </AuthProvider>
);

export default HomePageWithAuth;