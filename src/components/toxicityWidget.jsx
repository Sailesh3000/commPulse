import React from "react";
import { Shield, AlertTriangle, CheckCircle, AlertCircle, PieChart } from "lucide-react";
import { PieChart as RechartPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function ToxicityWidget({ results, darkMode }) {
  // Guard for undefined or null results
  if (!results) {
    return (
      <div className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="p-6">
          <h5 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Toxicity Analysis</h5>
          <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No toxicity data available.</div>
        </div>
      </div>
    );
  }

  const toxicityData = [
    { 
      name: "High Toxicity", 
      value: results.high_toxicity_percentage, 
      color: "#ef4444" // red
    },
    { 
      name: "Moderate Toxicity", 
      value: results.moderate_toxicity_percentage, 
      color: "#f97316" // orange
    },
    { 
      name: "Low Toxicity", 
      value: results.low_toxicity_percentage, 
      color: "#eab308" // yellow
    },
    { 
      name: "Safe", 
      value: results.safe_percentage, 
      color: "#22c55e" // green
    }
  ];

  // Component for individual toxicity stat cards
  const ToxicityStatCard = ({ title, value, icon, color }) => (
    <div className={`rounded-xl shadow-md overflow-hidden transition-all duration-300 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full" style={{ backgroundColor: `${color}20` }}>
            {icon}
          </div>
          <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{title}</p>
        </div>
        <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {value.toFixed(1)}%
        </p>
      </div>
    </div>
  );

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 mb-8 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="p-6">
        <h5 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Toxicity Analysis
          </div>
        </h5>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className={`h-72 rounded-xl p-4 transition-colors duration-300 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartPieChart>
                <Pie
                  data={toxicityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {toxicityData.map((entry, index) => (
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
              </RechartPieChart>
            </ResponsiveContainer>
          </div>

          {/* Toxicity Stats */}
          <div className="flex flex-col gap-4">
            <ToxicityStatCard 
              title="High Toxicity" 
              value={results.high_toxicity_percentage} 
              icon={<AlertTriangle className="h-4 w-4" style={{ color: "#ef4444" }} />} 
              color="#ef4444" 
            />
            <ToxicityStatCard 
              title="Moderate Toxicity" 
              value={results.moderate_toxicity_percentage} 
              icon={<AlertCircle className="h-4 w-4" style={{ color: "#f97316" }} />} 
              color="#f97316" 
            />
            <ToxicityStatCard 
              title="Low Toxicity" 
              value={results.low_toxicity_percentage} 
              icon={<PieChart className="h-4 w-4" style={{ color: "#eab308" }} />} 
              color="#eab308" 
            />
            <ToxicityStatCard 
              title="Safe Content" 
              value={results.safe_percentage} 
              icon={<CheckCircle className="h-4 w-4" style={{ color: "#22c55e" }} />} 
              color="#22c55e" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}