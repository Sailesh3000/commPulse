import React, { useState, useEffect } from 'react';
import { X, User, LogOut, UserCircle, Settings } from 'lucide-react';

// Authentication Context
export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status when component mounts
    fetch('http://localhost:5000/api/auth/status', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(data.isAuthenticated);
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);


  const logout = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error('Failed to log out. Please try again.');
      }
  
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout Error:', error.message);
      alert('An error occurred while logging out. Please check your connection or try again later.');
    }
  };

  
  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Modal Component
export const LoginModal = ({ isOpen, onClose }) => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Sign in to CommPulse </h2>
        
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>
        
        <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

// User Avatar Component
export const UserAvatar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(user.picture);

  // Function to generate an avatar based on user's name
  const generateAvatar = (name) => {
    // Get initials (first two characters)
    const initials = name 
      ? name.split(' ')
          .map(word => word.charAt(0).toUpperCase())
          .slice(0, 2)
          .join('')
      : '';

    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 40 40" 
        className="w-10 h-10 rounded-full"
      >
        <defs>
          <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#83181B" />
            <stop offset="100%" stopColor="#6A1316" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#avatarGradient)" />
        <text 
          x="50%" 
          y="50%" 
          dominantBaseline="middle" 
          textAnchor="middle" 
          fill="white" 
          fontSize="16"
          fontWeight="bold"
        >
          {initials}
        </text>
      </svg>
    );
  };

  const handleImageError = (e) => {
    console.error('Image failed to load:', e);
    setAvatarSrc(null);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        {avatarSrc ? (
          <div className="relative w-10 h-10">
            <img 
              src={avatarSrc} 
              alt={user.name} 
              onError={handleImageError}
              className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
            />
            <div className="absolute inset-0 rounded-full shadow-inner"></div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#83181B] to-[#6A1316] flex items-center justify-center border-2 border-white dark:border-gray-700 shadow-sm">
            {generateAvatar(user.name)}
          </div>
        )}
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {user.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {user.email}
          </span>
        </div>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-56 border-gray-600 bg-gray-800/90 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700 transition-all duration-200">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {avatarSrc ? (
                <img 
                  src={avatarSrc} 
                  alt={user.name}
                  onError={handleImageError}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  {generateAvatar(user.name)}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                  {user.email}
                </span>
              </div>
            </div>
          </div>

          <div className="py-1">
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
              onClick={() => {/* Add profile handler */}}
            >
              <UserCircle className="h-4 w-4" />
              Profile
            </button>
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
              onClick={() => {/* Add settings handler */}}
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
            <button
              onClick={() => {
                onLogout();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};