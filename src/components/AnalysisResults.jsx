import React, { useState } from "react";
import { ArrowLeft, Search, TrendingUp, Tag } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import ToxicityWidget from "./toxicityWidget";

export default function AnalysisResults({ results, onBack, darkMode }) {
  const [keywordFilter, setKeywordFilter] = useState("");
  const [showCount, setShowCount] = useState(10);

  const sentimentData = [
    { name: "Positive", value: results.sentiment.positive_percentage, color: "#22c55e" },
    { name: "Neutral", value: results.sentiment.neutral_percentage, color: "#64748b" },
    { name: "Negative", value: results.sentiment.negative_percentage, color: "#ef4444" },
  ];

  // Process keywords data for visualization
  const processKeywords = () => {
    if (!results.keywords || !results.keywords.keywords) return [];
    
    // Convert keyword object to array and sort by frequency
    const keywordArray = Object.entries(results.keywords.keywords)
      .map(([word, count]) => ({ keyword: word, count }))
      .filter(item => item.keyword.toLowerCase().includes(keywordFilter.toLowerCase()))
      .sort((a, b) => b.count - a.count)
      .slice(0, showCount);
    
    return keywordArray;
  };

  const keywordData = processKeywords();

  // Card component to reduce repetition
  const Card = ({ children, className = "" }) => (
    <div className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} ${className}`}>
      {children}
    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300 barlow-light ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className={`flex items-center mb-6 rounded-lg px-4 py-2 transition-all duration-300 ${
          darkMode 
            ? 'text-gray-200 hover:text-white hover:bg-gray-800' 
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Analysis
      </button>

      {/* Sentiment Analysis */}
      <Card className="mb-8">
        <div className="p-6">
          <h5 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Sentiment Analysis Overview
          </h5>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className={`h-72 rounded-xl p-4 transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
                      borderRadius: '8px', 
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      color: darkMode ? '#f1f5f9' : '#1e293b'
                    }} 
                  />
                  <Legend formatter={(value) => <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Sentiment Stats */}
            <div className="flex flex-col gap-4">
              {sentimentData.map((item) => (
                <Card key={item.name}>
                  <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                      <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{item.name}</p>
                    </div>
                    <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.value}%
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Keyword Tracking Section */}
      <Card className="mb-8">
        <div className="p-6">
          <h5 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <div className="flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Keyword Tracking
            </div>
          </h5>

          {/* Keyword search and filter controls */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className={`relative flex-grow ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                className={`pl-10 pr-4 py-2 rounded-lg w-full transition-colors duration-300 border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Filter keywords..."
                value={keywordFilter}
                onChange={(e) => setKeywordFilter(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <label className={`mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Show top:</label>
              <select
                value={showCount}
                onChange={(e) => setShowCount(Number(e.target.value))}
                className={`rounded-lg px-3 py-2 transition-colors duration-300 border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Keyword visualization */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className={`h-96 rounded-xl p-4 transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={keywordData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    type="number" 
                    tick={{ fill: darkMode ? '#f3f4f6' : '#1f2937' }} 
                  />
                  <YAxis 
                    dataKey="keyword" 
                    type="category" 
                    width={70}
                    tick={{ fill: darkMode ? '#f3f4f6' : '#1f2937' }} 
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
                      borderRadius: '8px', 
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      color: darkMode ? '#f1f5f9' : '#1e293b'
                    }} 
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#3b82f6" 
                    radius={[0, 4, 4, 0]} 
                    barSize={20} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Keyword list */}
            <div className="overflow-auto max-h-96">
              <div className="space-y-2">
                {keywordData.length > 0 ? (
                  keywordData.map((item, index) => (
                    <Card key={index}>
                      <div className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold py-1 px-2 rounded-md ${
                            darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                          }`}>{index + 1}</span>
                          <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {item.keyword}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className={`h-4 w-4 mr-2 ${
                            darkMode ? 'text-blue-400' : 'text-blue-500'
                          }`} />
                          <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.count}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className={`text-center p-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {keywordFilter ? "No keywords match your filter" : "No keywords found"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <ToxicityWidget results={results.toxicity} darkMode={darkMode} />

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "Real-Time Analytics",
            description: "Live updates on comment trends.",
            icon: "📊"
          },
          {
            title: "Smart Notifications",
            description: "Get alerts for important trends.",
            icon: "🔔"
          },
          {
            title: "Export Options",
            description: "Download reports in CSV or Excel format.",
            icon: "📥"
          },
          {
            title: "Advanced Filtering",
            description: "Filter comments by sentiment, keywords, and more.",
            icon: "🔧"
          }
        ].map((feature, index) => (
          <Card key={index} className="hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{feature.icon}</span>
                <h5 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {feature.title}
                </h5>
              </div>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                {feature.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}