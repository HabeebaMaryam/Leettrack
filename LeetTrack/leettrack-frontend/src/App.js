//
//import React, { useState } from "react";
//import axios from "axios";
//import "./App.css";
//
//function App() {
//  const [username, setUsername] = useState("");
//  const [userData, setUserData] = useState(null);
//  const [loading, setLoading] = useState(false);
//  const [error, setError] = useState("");
//
//  const fetchUser = async () => {
//    if (!username.trim()) return;
//    setLoading(true);
//    setError("");
//    setUserData(null);
//
//    try {
//      const res = await axios.get(`http://localhost:4000/api/student/${username}`);
//      setUserData(res.data);
//    } catch (err) {
//      setError("User not found or server error");
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  return (
//    <div className="container">
//      <h1>💡 LeetTrack Dashboard</h1>
//
//      <div className="search-box">
//        <input
//          type="text"
//          placeholder="Enter LeetCode username"
//          value={username}
//          onChange={(e) => setUsername(e.target.value)}
//        />
//        <button onClick={fetchUser} disabled={loading}>
//          {loading ? "Fetching..." : "Search"}
//        </button>
//      </div>
//
//      {error && <p className="error">{error}</p>}
//
//      {userData && (
//        <div className="card">
//          <div className="user-info">
//            <img
//              src={userData.userAvatar}
//              alt="avatar"
//              className="avatar"
//            />
//            <div>
//              <h2>{userData.realName || username}</h2>
//              <p>Ranking: #{userData.ranking}</p>
//            </div>
//          </div>
//
//          <h3>Solved Problems</h3>
//          <ul>
//            {userData.stats.acSubmissionNum.slice(1).map((entry) => (
//              <li key={entry.difficulty}>
//                <strong>{entry.difficulty}:</strong> {entry.count}
//              </li>
//            ))}
//          </ul>
//        </div>
//      )}
//    </div>
//  );
//}
//
//export default App;


//t

//import React, { useState } from "react";
//import AdminPanel from "./components/AdminPanel";
//import StudentPanel from "./components/StudentPanel";
//
//function App() {
//  const [mode, setMode] = useState(null); // 'admin' or 'student'
//
//  if (!mode) {
//    return (
//      <div className="container">
//        <div className="card header">
//          <h1>LeetTrack</h1>
//        </div>
//
//        <div className="card">
//          <h2>Who are you?</h2>
//          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
//            <button className="btn" onClick={() => setMode("admin")}>I'm an Admin</button>
//            <button className="btn" onClick={() => setMode("student")}>I'm a Student</button>
//          </div>
//        </div>
//      </div>
//    );
//  }
//
//  return (
//    <div className="container">
//      <div style={{ marginBottom: 12 }}>
//        <button className="btn" onClick={() => setMode(null)}>← Back</button>
//      </div>
//
//      {mode === "admin" ? <AdminPanel /> : <StudentPanel />}
//    </div>
//  );
//}
//
//export default App;
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import StudentPanel from "./components/StudentPanel";
import AdminDashboard from "./components/AdminDashboard";
import AdminBatches from "./components/AdminBatches";

function Home() {
  const [mode, setMode] = useState(null);
  const navigate = useNavigate();

  if (!mode) {
    return (
      <div className="container">
        <div className="card header">
          <h1>LeetTrack</h1>
        </div>

        <div className="card">
          <h2>Who are you?</h2>
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button className="btn" onClick={() => setMode("admin")}>I'm an Admin</button>
            <button className="btn" onClick={() => setMode("student")}>I'm a Student</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: 12 }}>
        <button className="btn" onClick={() => setMode(null)}>← Back</button>
      </div>

      {mode === "admin" ? (
        <>
          <AdminPanel />
          <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
            <button className="btn" onClick={() => navigate("/admin/dashboard")}>
              Go to Dashboard
            </button>
            <button className="btn" onClick={() => navigate("/admin/batches")}>
              View Batches
            </button>
          </div>
        </>
      ) : (
        <StudentPanel />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Main selection page */}
        <Route path="/" element={<Home />} />

        {/* Admin-specific pages */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/batches" element={<AdminBatches />} />
      </Routes>
    </Router>
  );
}

export default App;



