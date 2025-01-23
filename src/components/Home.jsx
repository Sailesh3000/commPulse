import React, { useState,useContext } from 'react';
import { Search, BarChart2, Shield, Cloud, Download, Bell, ArrowRight, Moon, Sun } from 'lucide-react';
import { AuthProvider, AuthContext, LoginModal, UserAvatar} from './AuthComponents';

const colors = {
  primary: '#FF0000',    // YouTube Red
  secondary: '#282828',  // Dark Gray
  accent: '#606060',     // Medium Gray
  dark: '#0F0F0F',      // Almost Black
  light: '#F9F9F9',     // Off White
};

const HomePage = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated, user, login, logout } = useContext(AuthContext);


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Video URL submitted:', videoUrl);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-b from-gray-50 to-gray-100'}`}>
      {/* Hero Section */}
      <header className="dark:bg-gray-800 bg-white transition-colors duration-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg className="h-8 w-8" viewBox="0 0 24 24">
                <rect x="4" y="12" width="4" height="8" fill="#FF0000"/>
                <rect x="10" y="6" width="4" height="14" fill="#FF0000"/>
                <rect x="16" y="2" width="4" height="18" fill="#FF0000"/>
              </svg>
              <span className="ml-2 text-2xl font-bold dark:text-white text-gray-900">CommPulse</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
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
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => setShowSignupModal(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Get Started
                  </button>
                </>
              )}

            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold dark:text-white text-gray-900 sm:text-5xl md:text-6xl">
              Monitor YouTube Comments
              <br></br>
              <span className="text-red-600"> in Real-Time</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Analyze sentiment, detect toxic content, and gain valuable insights from your YouTube community with advanced AI-powered analytics.
            </p>
          </div>

          <div className="mt-10 max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste your YouTube video URL here"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                Analyze <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={login}
      />
      
      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Powerful Features</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Everything you need to understand your audience</p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <BarChart2 className="h-8 w-8 text-red-600" />,
                title: "Real-Time Analytics",
                description: "Monitor comment sentiment and trends as they happen with live dashboard updates."
              },
              {
                icon: <Shield className="h-8 w-8 text-red-600" />,
                title: "Toxic Content Detection",
                description: "Automatically identify and flag potentially harmful or inappropriate comments."
              },
              {
                icon: <Cloud className="h-8 w-8 text-red-600" />,
                title: "Keyword Tracking",
                description: "Track important topics and themes in your community discussions."
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
              <div key={index} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-red-600 dark:bg-red-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Start Monitoring Your YouTube Comments</h2>
          <p className="mt-4 text-red-100">Get valuable insights from your community today</p>
          <button className="mt-8 px-8 py-3 bg-white text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-50/90">
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-red-400">Features</a></li>
                <li><a href="#" className="hover:text-red-400">Pricing</a></li>
                <li><a href="#" className="hover:text-red-400">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-red-400">Documentation</a></li>
                <li><a href="#" className="hover:text-red-400">Guides</a></li>
                <li><a href="#" className="hover:text-red-400">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-red-400">About</a></li>
                <li><a href="#" className="hover:text-red-400">Blog</a></li>
                <li><a href="#" className="hover:text-red-400">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-red-400">Privacy</a></li>
                <li><a href="#" className="hover:text-red-400">Terms</a></li>
                <li><a href="#" className="hover:text-red-400">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p>&copy; 2025 CommPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const HomePageWithAuth = () => (
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  );
  
  export default HomePageWithAuth;