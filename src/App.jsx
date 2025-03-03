import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePageWithAuth from "./components/Home";
import CommPulseDashboard from "./components/AnalysisResults";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePageWithAuth />} />

        <Route path="/dashboard" element={<CommPulseDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
