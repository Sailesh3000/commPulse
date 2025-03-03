import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Container, IconButton } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";


export default function CommPulseDashboard({results,onBack}) {

  const sentimentData = [
    { name: "Positive", value: results.positive_percentage, color: "#22c55e" },
    { name: "Neutral", value: results.neutral_percentage, color: "#64748b" },
    { name: "Negative", value: results.negative_percentage, color: "#ef4444" },
  ];
  
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" className="py-6">
      {/* Back Button */}
      <IconButton onClick={() => navigate("/")} className="mb-4">
        <ArrowBack className="text-gray-700 hover:text-gray-900" />
      </IconButton>

      {/* Sentiment Analysis */}
      <Card className="mb-6 shadow-lg rounded-2xl">
        <CardContent>
          <Typography variant="h5" className="text-gray-800 font-semibold mb-4">
            Sentiment Analysis Overview
          </Typography>
          
          <Box className="grid md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Box className="h-72 bg-gray-50 rounded-xl p-4">
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
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            {/* Sentiment Stats */}
            <Box className="flex flex-col gap-4">
              {sentimentData.map((item) => (
                <Card key={item.name} className="border border-gray-200 shadow-sm rounded-xl">
                  <CardContent className="flex justify-between items-center">
                    <Box className="flex items-center gap-2">
                      <Box className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                      <Typography className="text-gray-700 font-medium">{item.name}</Typography>
                    </Box>
                    <Typography variant="h6" className="text-gray-900 font-bold">
                      {item.value}%
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Placeholder for Other Sections */}
      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent>
            <Typography variant="h5" className="text-gray-800 font-semibold">
              Real-Time Analytics
            </Typography>
            <Typography>Live updates on comment trends.</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h5" className="text-gray-800 font-semibold">
              Toxic Content Detection
            </Typography>
            <Typography>Flagged harmful comments will be displayed here.</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h5" className="text-gray-800 font-semibold">
              Keyword Tracking
            </Typography>
            <Typography>Track important topics in discussions.</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h5" className="text-gray-800 font-semibold">
              Smart Notifications
            </Typography>
            <Typography>Get alerts for important trends.</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h5" className="text-gray-800 font-semibold">
              Export Options
            </Typography>
            <Typography>Download reports in CSV or Excel format.</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h5" className="text-gray-800 font-semibold">
              Advanced Filtering
            </Typography>
            <Typography>Filter comments by sentiment, keywords, and more.</Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
