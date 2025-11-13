// src/components/StudentPanel.js
import React, { useState } from "react";
import axios from "axios";

const API = "http://localhost:4000/api";

export default function StudentPanel() {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState("");

  async function fetchUser() {
    if (!username.trim()) return;
    try {
      const res = await axios.get(`${API}/student/${username}`);
      setUser(res.data.user || res.data);
      setMsg("");
    } catch (err) {
      setMsg("User not found or server error");
      setUser(null);
    }
  }

  return (
    <div>
      <div className="card">
        <h2>Student Login</h2>
        <div style={{ display:"flex", gap:8 }}>
          <input className="input" placeholder="LeetCode username" value={username} onChange={e=>setUsername(e.target.value)} />
          <button className="btn" onClick={fetchUser}>Enter</button>
        </div>
        <p className="small">{msg}</p>
      </div>

      {user && (
        <div className="card">
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <img src={user.userAvatar} alt="avatar" style={{width:80,height:80,borderRadius:40,border:'2px solid #06b6d4'}}/>
            <div>
              <h2>{user.realName || user.username}</h2>
              <p className="small">@{user.username} • Rank: {user.ranking}</p>
              <p className="small">Dept: {user.department} • Solved: {user.totalSolved}</p>
            </div>
          </div>

          <h3>Rankings</h3>
          <div style={{display:'flex', gap:12}}>
            <div className="card" style={{flex:1}}>
              <strong>Global</strong>
              <p className="small">{user.ranking ?? "N/A"}</p>
            </div>
            <div className="card" style={{flex:1}}>
              <strong>College</strong>
              <p className="small">See college ranking page</p>
            </div>
            <div className="card" style={{flex:1}}>
              <strong>Department</strong>
              <p className="small">See department ranking page</p>
            </div>
          </div>

          <h3>Batch</h3>
          <p className="small">(Batches will appear here)</p>

          <h3>Problems solved (summary)</h3>
          <ul>
            {user.stats?.acSubmissionNum?.slice(1).map(s => <li key={s.difficulty}>{s.difficulty}: {s.count}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
