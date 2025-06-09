import React, { useState } from "react";
import { ArrowLeft, Search, TrendingUp, Tag, BarChart3, Download, Filter, Moon, Sun } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";

// Mock ToxicityWidget component
const ToxicityWidget = ({ results, darkMode }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(results || {}).map(([key, value]) => {
        // Skip non-numeric values and internal properties
        if (typeof value !== 'number' || key === 'total_comments' || key === 'processedBy' || key === 'responseTime') {
          return null;
        }
        return (
          <div key={key} className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
              {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {value.toFixed(1)}%
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// Mock results data
const mockResults = {
  sentiment: {
    positive_percentage: 45.2,
    neutral_percentage: 32.8,
    negative_percentage: 22.0
  },
  keywords: {
    keywords: {
      "growth": 45,
      "analytics": 32,
      "dashboard": 28,
      "metrics": 24,
      "performance": 21,
      "insights": 18,
      "data": 16,
      "trends": 14,
      "optimization": 12,
      "conversion": 10
    }
  },
  toxicity: {
    severe_toxicity: 2.1,
    obscene: 3.5,
    identity_attack: 1.8,
    insult: 4.2,
    threat: 0.9,
    sexual_explicit: 1.3
  }
};

export default function AnalysisResults({ results = mockResults, onBack, darkMode: initialDarkMode = false }) {
  const [keywordFilter, setKeywordFilter] = useState("");
  const [showCount, setShowCount] = useState(10);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [darkMode, setDarkMode] = useState(initialDarkMode);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const sentimentData = results?.sentiment ? [
    { name: "Positive", value: results.sentiment.positive_percentage, color: darkMode ? "#60a5fa" : "#6366f1" },
    { name: "Neutral", value: results.sentiment.neutral_percentage, color: darkMode ? "#a78bfa" : "#8b5cf6" },
    { name: "Negative", value: results.sentiment.negative_percentage, color: darkMode ? "#fb7185" : "#ec4899" },
  ] : [];

  // Process keywords data for visualization
  const processKeywords = () => {
    if (!results?.keywords?.keywords) return [];
    
    const keywordArray = Object.entries(results.keywords.keywords)
      .map(([word, count]) => ({ keyword: word, count }))
      .filter(item => item.keyword.toLowerCase().includes(keywordFilter.toLowerCase()))
      .sort((a, b) => b.count - a.count)
      .slice(0, showCount);
    
    return keywordArray;
  };

  const keywordData = processKeywords();

  const handleExport = (format) => {
    const dataToExport = {
      keywords: results.keywords,
      sentiment: results.sentiment,
      toxicity: results.toxicity
    };
    let dataStr;
    if (format === 'json') {
      dataStr = JSON.stringify(dataToExport, null, 2);
    } else if (format === 'csv') {
      const csvRows = [];
      const headers = Object.keys(dataToExport);
      csvRows.push(headers.join(','));
      const values = headers.map(header => JSON.stringify(dataToExport[header]));
      csvRows.push(values.join(','));
      dataStr = csvRows.join('\n');
    }
    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_results.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`border-b px-6 py-4 transition-colors duration-300 ${
        darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack} 
              className={`flex items-center transition-colors ${
                darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <h1 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Analysis Results
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-900 text-yellow-400 hover:bg-gray-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-900 border-gray-800 text-white hover:bg-gray-800' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              
              {showExportOptions && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-10 ${
                  darkMode 
                    ? 'bg-black border-gray-800' 
                    : 'bg-white border-gray-200'
                }`}>
                  <button
                    onClick={() => handleExport("json")}
                    className={`w-full text-left px-4 py-2 rounded-t-lg transition-colors ${
                      darkMode ? 'hover:bg-gray-900 text-white' : 'hover:bg-gray-50'
                    }`}
                  >
                    Export as JSON
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    className={`w-full text-left px-4 py-2 rounded-b-lg transition-colors ${
                      darkMode ? 'hover:bg-gray-900 text-white' : 'hover:bg-gray-50'
                    }`}
                  >
                    Export as CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-xl p-6 shadow-sm border transition-colors duration-300 ${
            darkMode 
              ? 'bg-black border-gray-800' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Sentiment
                </p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {(results.sentiment.positive_percentage + results.sentiment.neutral_percentage + results.sentiment.negative_percentage).toFixed(0)}%
                </p>
                <p className="text-sm text-green-600 flex items-center mt-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  +2.1% from last analysis
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-orange-600 bg-opacity-20' : 'bg-orange-100'
              }`}>
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-6 shadow-sm border transition-colors duration-300 ${
            darkMode 
              ? 'bg-black border-gray-800' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Keywords
                </p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {Object.keys(results.keywords.keywords).length}
                </p>
                <p className="text-sm text-blue-600 flex items-center mt-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  +5.9% from last month
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-blue-600 bg-opacity-20' : 'bg-blue-100'
              }`}>
                <Tag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-6 shadow-sm border transition-colors duration-300 ${
            darkMode 
              ? 'bg-black border-gray-800' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Positive Rate
                </p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {results.sentiment.positive_percentage.toFixed(1)}%
                </p>
                <p className="text-sm text-green-600 flex items-center mt-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  +2.1% from last quarter
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-green-600 bg-opacity-20' : 'bg-green-100'
              }`}>
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-6 shadow-sm border transition-colors duration-300 ${
            darkMode 
              ? 'bg-black border-gray-800' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Avg. Toxicity
                </p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {(Object.values(results.toxicity).reduce((a, b) => a + b, 0) / Object.keys(results.toxicity).length).toFixed(1)}%
                </p>
                <p className="text-sm text-purple-600 flex items-center mt-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  +1.4% from last quarter
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-purple-600 bg-opacity-20' : 'bg-purple-100'
              }`}>
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Sentiment Analysis - Takes 2/3 width */}
          <div className={`xl:col-span-2 rounded-xl shadow-sm border transition-colors duration-300 ${
            darkMode 
              ? 'bg-black border-gray-800' 
              : 'bg-white border-gray-100'
          }`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Sentiment Analysis
                </h3>
                <div className="flex space-x-2">
                  <button className={`px-3 py-1 text-sm rounded-md ${
                    darkMode 
                      ? 'bg-blue-600 bg-opacity-20 text-blue-400' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    Last 7 days
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: darkMode ? '#111111' : 'white',
                          color: darkMode ? 'white' : 'black',
                          borderRadius: '8px', 
                          border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }} 
                      />
                      <Legend 
                        wrapperStyle={{ color: darkMode ? '#d1d5db' : '#374151' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Sentiment Stats */}
                <div className="space-y-4">
                  {sentimentData.map((item, index) => (
                    <div key={item.name} className={`flex items-center justify-between p-4 rounded-lg ${
                      darkMode ? 'bg-gray-900' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.value.toFixed(1)}%
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {index === 0 ? '+2.1%' : index === 1 ? '+0.5%' : '-1.2%'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Keywords - Takes 1/3 width */}
          <div className={`rounded-xl shadow-sm border transition-colors duration-300 ${
            darkMode 
              ? 'bg-black border-gray-800' 
              : 'bg-white border-gray-100'
          }`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Top Keywords
                </h3>
                <button className={`px-3 py-1 text-sm rounded-md ${
                  darkMode 
                    ? 'bg-blue-600 bg-opacity-20 text-blue-400' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  Last 7 days
                </button>
              </div>
              
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    darkMode 
                      ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-400' 
                      : 'border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Filter keywords..."
                  value={keywordFilter}
                  onChange={(e) => setKeywordFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {keywordData.slice(0, 6).map((item, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    darkMode ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-50 hover:bg-gray-100'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        darkMode ? 'bg-blue-600 bg-opacity-20 text-blue-400' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.keyword}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.count}
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        mentions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {keywordData.length > 6 && (
                <button 
                  onClick={() => setShowCount(showCount + 10)}
                  className={`w-full mt-4 py-2 px-4 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-gray-900 text-gray-300 hover:bg-gray-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Show More Keywords
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Toxicity Analysis */}
        <div className={`mt-6 rounded-xl shadow-sm border transition-colors duration-300 ${
          darkMode 
            ? 'bg-black border-gray-800' 
            : 'bg-white border-gray-100'
        }`}>
          <div className={`p-6 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Toxicity Analysis
              </h3>
              <button className={`px-3 py-1 text-sm rounded-md ${
                darkMode 
                  ? 'bg-purple-600 bg-opacity-20 text-purple-400' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                Last 7 days
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <ToxicityWidget results={results.toxicity} darkMode={darkMode} />
          </div>
        </div>

        {/* Keyword Trends Chart */}
        <div className={`mt-6 rounded-xl shadow-sm border transition-colors duration-300 ${
          darkMode 
            ? 'bg-black border-gray-800' 
            : 'bg-white border-gray-100'
        }`}>
          <div className={`p-6 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Keyword Frequency
            </h3>
          </div>
          
          <div className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={keywordData.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="keyword" 
                    tick={{ fill: darkMode ? '#d1d5db' : '#374151' }}
                    axisLine={{ stroke: darkMode ? '#374151' : '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fill: darkMode ? '#d1d5db' : '#374151' }}
                    axisLine={{ stroke: darkMode ? '#374151' : '#e5e7eb' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#111111' : 'white',
                      color: darkMode ? 'white' : 'black',
                      borderRadius: '8px', 
                      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }} 
                  />
                  <Bar dataKey="count" fill={darkMode ? '#60a5fa' : '#6366f1'} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}