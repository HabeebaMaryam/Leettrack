// src/components/AdminPanel.js
//import React, { useState, useEffect } from "react";
//import axios from "axios";
//
//const API = "http://localhost:4000/api";
//
//function AdminPanel() {
//  const [token, setToken] = useState(localStorage.getItem("admin_token") || "");
//  const [email, setEmail] = useState("");
//  const [password, setPassword] = useState("");
//  const [students, setStudents] = useState([]);
//  const [username, setUsername] = useState("");
//  const [dept, setDept] = useState("CS");
//  const [message, setMessage] = useState("");
//
//  useEffect(() => {
//    if (token) fetchStudents();
//  }, [token]);
//
//  async function register() {
//    try {
//      await axios.post(`${API}/admin/register`, { email, password, name: email });
//      setMessage("Admin registered — now login.");
//    } catch (err) { setMessage(err?.response?.data?.message || "Error"); }
//  }
//
//  async function login() {
//    try {
//      const res = await axios.post(`${API}/admin/login`, { email, password });
//      setToken(res.data.token);
//      localStorage.setItem("admin_token", res.data.token);
//      setMessage("Logged in");
//      fetchStudents();
//    } catch (err) { setMessage(err?.response?.data?.message || "Login failed"); }
//  }
//
//  async function fetchStudents() {
//    try {
//      // Simple: pull all users for admin listing
//      const res = await axios.get(`${API}/student-list`, { headers: { Authorization: `Bearer ${token}` } });
//      setStudents(res.data);
//    } catch (err) {
//      // fallback: call /rank/college to get all users
//      try {
//        const r = await axios.get(`${API}/rank/college`);
//        setStudents(r.data);
//      } catch (e) {
//        setMessage("Cannot fetch students");
//      }
//    }
//  }
//
//  async function addStudent() {
//    try {
//      const res = await axios.post(`${API}/admin/add-student`, { username, department: dept }, { headers: { Authorization: `Bearer ${token}` } });
//      setMessage(res.data.fromDB ? "Already in DB" : "Fetched & saved");
//      fetchStudents();
//    } catch (err) {
//      setMessage(err?.response?.data?.message || "Error adding");
//    }
//  }
//
//  async function delStudent(u) {
//    try {
//      await axios.delete(`${API}/admin/student/${u}`, { headers: { Authorization: `Bearer ${token}` } });
//      setMessage("Deleted");
//      fetchStudents();
//    } catch (err) { setMessage("Delete failed"); }
//  }
//
//  async function createBatch() {
//    const name = prompt("Batch name?");
//    const branch = prompt("Branch (CS/ECE/EEE/AIML/AISA/ALL)?", "ALL");
//    if (!name) return;
//    try {
//      const res = await axios.post(`${API}/admin/batch`, { name, branch, description: "" }, { headers: { Authorization: `Bearer ${token}` }});
//      setMessage("Batch created id:" + res.data.id);
//    } catch (err) { setMessage("Batch create failed"); }
//  }
//
//  return (
//    <div>
//      <div className="card">
//        <h2>Admin Login/Register</h2>
//        <div style={{ display: "flex", gap: 8, marginTop:8 }}>
//          <input className="input" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
//          <input className="input" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
//          <button className="btn" onClick={login}>Login</button>
//          <button className="btn" onClick={register}>Register</button>
//        </div>
//        <p className="small">{message}</p>
//      </div>
//
//      {token && (
//        <>
//          <div className="card">
//            <h3>Add student</h3>
//            <div style={{ display:"flex", gap:8 }}>
//              <input className="input" placeholder="LeetCode username" value={username} onChange={e=>setUsername(e.target.value)} />
//              <select value={dept} onChange={e=>setDept(e.target.value)} className="input">
//                <option>CS</option><option>ECE</option><option>EEE</option><option>AIML</option><option>AISA</option>
//              </select>
//              <button className="btn" onClick={addStudent}>Add</button>
//              <button className="btn" onClick={createBatch}>Create Batch</button>
//            </div>
//          </div>
//
//          <div className="card">
//            <h3>Students (college ranking by solved)</h3>
//            <table className="table">
//              <thead><tr><th>Username</th><th>Name</th><th>Dept</th><th>Solved</th><th>Actions</th></tr></thead>
//              <tbody>
//                {students.map(s => (
//                  <tr key={s.username}>
//                    <td>{s.username}</td>
//                    <td>{s.realName}</td>
//                    <td>{s.department}</td>
//                    <td>{s.totalSolved ?? s.totalSolved}</td>
//                    <td><button className="btn" onClick={()=>delStudent(s.username)}>Delete</button></td>
//                  </tr>
//                ))}
//              </tbody>
//            </table>
//          </div>
//        </>
//      )}
//    </div>
//  );
//}
//
//export default AdminPanel;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:4000/api";

function AdminPanel() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("admin_token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [students, setStudents] = useState([]);
  const [username, setUsername] = useState("");
  const [dept, setDept] = useState("CS");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) fetchStudents();
  }, [token]);

  // ✅ Register admin
  async function register() {
    try {
      await axios.post(`${API}/admin/register`, { email, password, name: email });
      setMessage("Admin registered — now login.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Error registering");
    }
  }

  // ✅ Login admin and redirect to dashboard
  async function login() {
    try {
      const res = await axios.post(`${API}/admin/login`, { email, password });
      setToken(res.data.token);
      localStorage.setItem("admin_token", res.data.token);
      localStorage.setItem("adminEmail", email); // ✅ store email for later use
      setMessage("Login successful!");

      // ✅ Redirect after login
      navigate("/admin/dashboard");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Login failed");
    }
  }

  // ✅ Fetch students
  async function fetchStudents() {
    try {
      const res = await axios.get(`${API}/student-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
    } catch (err) {
      try {
        const r = await axios.get(`${API}/rank/college`);
        setStudents(r.data);
      } catch (e) {
        setMessage("Cannot fetch students");
      }
    }
  }

  // ✅ Add student
  async function addStudent() {
    try {
      const res = await axios.post(
        `${API}/admin/add-student`,
        { username, department: dept },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.fromDB ? "Already in DB" : "Fetched & saved");
      fetchStudents();
    } catch (err) {
      setMessage(err?.response?.data?.message || "Error adding student");
    }
  }

  // ✅ Delete student
  async function delStudent(u) {
    try {
      await axios.delete(`${API}/admin/student/${u}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Deleted");
      fetchStudents();
    } catch (err) {
      setMessage("Delete failed");
    }
  }

  // ✅ Create batch
  async function createBatch() {
    const name = prompt("Batch name?");
    const branch = prompt("Branch (CS/ECE/EEE/AIML/AISA/ALL)?", "ALL");
    if (!name) return;
    try {
      const res = await axios.post(
        `${API}/admin/batch`,
        { name, branch, description: "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Batch created id:" + res.data.id);
    } catch (err) {
      setMessage("Batch creation failed");
    }
  }

  // ✅ Logout
  function logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("adminEmail");
    setToken("");
    setStudents([]);
    setMessage("Logged out");
  }

  return (
    <div>
      <div className="card">
        <h2>Admin Login/Register</h2>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            className="input"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input"
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn" onClick={login}>
            Login
          </button>
          <button className="btn" onClick={register}>
            Register
          </button>
          {token && (
            <button className="btn" onClick={logout}>
              Logout
            </button>
          )}
        </div>
        <p className="small">{message}</p>
      </div>

      {token && (
        <>
          <div className="card">
            <h3>Add Student</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input"
                placeholder="LeetCode username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="input"
              >
                <option>CS</option>
                <option>ECE</option>
                <option>EEE</option>
                <option>AIML</option>
                <option>AISA</option>
              </select>
              <button className="btn" onClick={addStudent}>
                Add
              </button>
              <button className="btn" onClick={createBatch}>
                Create Batch
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              <button
                className="btn"
                onClick={() => navigate("/admin/dashboard")}
              >
                Go to Dashboard
              </button>
              <button
                className="btn"
                onClick={() => navigate("/admin/batches")}
              >
                View Batches
              </button>
            </div>
          </div>

          <div className="card">
            <h3>Students (college ranking by solved)</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Dept</th>
                  <th>Solved</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.username}>
                    <td>{s.username}</td>
                    <td>{s.realName}</td>
                    <td>{s.department}</td>
                    <td>{s.totalSolved ?? s.totalSolved}</td>
                    <td>
                      <button className="btn" onClick={() => delStudent(s.username)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminPanel;
