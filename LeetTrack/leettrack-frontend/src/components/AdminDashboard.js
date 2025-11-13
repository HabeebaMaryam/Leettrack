


// src/components/AdminDashboard.jsx
//import React, { useState, useEffect } from "react";
//
//function AdminDashboard() {
//  const API = "http://localhost:4000/api/admin";
//  const token = localStorage.getItem("admin_token");
//
//  const [username, setUsername] = useState("");
//  const [department, setDepartment] = useState("CS");
//  const [students, setStudents] = useState([]);
//  const [batchName, setBatchName] = useState("");
//  const [batchCount, setBatchCount] = useState("");
//  const [batches, setBatches] = useState([]);
//  const [branch, setBranch] = useState("CS");
//  const [message, setMessage] = useState("");
//
//  // Fetch all students (college ranking)
//  const fetchStudents = async () => {
//    try {
//      const res = await fetch(`${API}/students`, {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      setStudents(data);
//    } catch {
//      setMessage("Failed to fetch students");
//    }
//  };
//
//  // Fetch all batches
//  const fetchBatches = async () => {
//    try {
//      const res = await fetch(`${API}/batches`, {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      setBatches(data);
//    } catch {
//      setMessage("Failed to fetch batches");
//    }
//  };
//
//  useEffect(() => {
//    fetchStudents();
//    fetchBatches();
//  }, []);
//
//  // Add student
//  const addStudent = async () => {
//    if (!username) return alert("Enter username");
//    try {
//      const res = await fetch(`${API}/add-student`, {
//        method: "POST",
//        headers: {
//          "Content-Type": "application/json",
//          Authorization: `Bearer ${token}`,
//        },
//        body: JSON.stringify({ username, department }),
//      });
//      const data = await res.json();
//      alert(data.message || "Student added");
//      fetchStudents();
//    } catch {
//      alert("Error adding student");
//    }
//  };
//
//  // Create batch (top N)
//  const createBatch = async () => {
//    if (!batchName || !batchCount) return alert("Enter all fields");
//    try {
//      const res = await fetch(`${API}/create-batch`, {
//        method: "POST",
//        headers: {
//          "Content-Type": "application/json",
//          Authorization: `Bearer ${token}`,
//        },
//        body: JSON.stringify({ batchName, batchCount }),
//      });
//      const data = await res.json();
//      alert(data.message || "Batch created");
//      fetchBatches();
//    } catch {
//      alert("Error creating batch");
//    }
//  };
//
//  // Fetch branch-wise ranking
//  const fetchBranchRank = async () => {
//    try {
//      const res = await fetch(`${API}/students/branch/${branch}`, {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      setStudents(data);
//    } catch {
//      alert("Failed to fetch branch ranking");
//    }
//  };
//
//  return (
//    <div className="container">
//      <h1>Admin Dashboard</h1>
//
//      {/* Add Student */}
//      <div className="card">
//        <h3>Add Student</h3>
//        <input
//          placeholder="LeetCode username"
//          value={username}
//          onChange={(e) => setUsername(e.target.value)}
//        />
//        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
//          <option>CS</option>
//          <option>ECE</option>
//          <option>EEE</option>
//          <option>AIML</option>
//          <option>AISA</option>
//        </select>
//        <button className="btn" onClick={addStudent}>Add</button>
//      </div>
//
//      {/* Create Batch */}
//      <div className="card">
//        <h3>Create Batch</h3>
//        <input
//          placeholder="Batch Name"
//          value={batchName}
//          onChange={(e) => setBatchName(e.target.value)}
//        />
//        <input
//          type="number"
//          placeholder="No. of Students"
//          value={batchCount}
//          onChange={(e) => setBatchCount(e.target.value)}
//        />
//        <button className="btn" onClick={createBatch}>Create</button>
//      </div>
//
//      {/* Ranking Section */}
//      <div className="card">
//        <h3>College Ranking</h3>
//        <button className="btn" onClick={fetchStudents}>All College</button>
//        <select value={branch} onChange={(e) => setBranch(e.target.value)}>
//          <option>CS</option>
//          <option>ECE</option>
//          <option>EEE</option>
//          <option>AIML</option>
//          <option>AISA</option>
//        </select>
//        <button className="btn" onClick={fetchBranchRank}>Branch-wise</button>
//
//        <table>
//          <thead>
//            <tr>
//              <th>Username</th>
//              <th>Name</th>
//              <th>Dept</th>
//              <th>Solved</th>
//            </tr>
//          </thead>
//          <tbody>
//            {students.map((s) => (
//              <tr key={s.username}>
//                <td>{s.username}</td>
//                <td>{s.realName}</td>
//                <td>{s.department}</td>
//                <td>{s.totalSolved}</td>
//              </tr>
//            ))}
//          </tbody>
//        </table>
//      </div>
//
//      {/* View Batches */}
//      <div className="card">
//        <h3>Available Batches</h3>
//        {batches.length === 0 ? (
//          <p>No batches found</p>
//        ) : (
//          batches.map((b) => (
//            <div key={b.id}>
//              <strong>{b.name}</strong>
//              <button
//                onClick={() =>
//                  (window.location.href = `/admin/batch/${b.id}`)
//                }
//              >
//                View Students
//              </button>
//            </div>
//          ))
//        )}
//      </div>
//    </div>
//  );
//}
//
//export default AdminDashboard;


// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from "react";

function AdminDashboard() {
  const API = "http://localhost:4000/api/admin";
  const token = localStorage.getItem("admin_token");

  const [username, setUsername] = useState("");
  const [department, setDepartment] = useState("CS");
  const [students, setStudents] = useState([]);
  const [batchName, setBatchName] = useState("");
  const [batchCount, setBatchCount] = useState("");
  const [startRank, setStartRank] = useState("");
  const [endRank, setEndRank] = useState("");
  const [batches, setBatches] = useState([]);
  const [branch, setBranch] = useState("CS");
  const [message, setMessage] = useState("");

  // Fetch all students (college ranking)
  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStudents(data);
    } catch {
      setMessage("Failed to fetch students");
    }
  };

  // Fetch all batches
  const fetchBatches = async () => {
    try {
      const res = await fetch(`${API}/batches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBatches(data);
    } catch {
      setMessage("Failed to fetch batches");
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchBatches();
  }, []);

  // Add student
  const addStudent = async () => {
    if (!username) return alert("Enter username");
    try {
      const res = await fetch(`${API}/add-student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, department }),
      });
      const data = await res.json();
      alert(data.message || "Student added");
      fetchStudents();
    } catch {
      alert("Error adding student");
    }
  };

  // Create batch (with rank range)
  const createBatch = async () => {
    if (!batchName || !batchCount || !startRank || !endRank)
      return alert("Enter all fields");
    try {
      const res = await fetch(`${API}/create-batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchName,
          batchCount,
          startRank,
          endRank,
        }),
      });
      const data = await res.json();
      alert(data.message || "Batch created");
      fetchBatches();
    } catch {
      alert("Error creating batch");
    }
  };

  // Fetch branch-wise ranking
  const fetchBranchRank = async () => {
    try {
      const res = await fetch(`${API}/students/branch/${branch}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStudents(data);
    } catch {
      alert("Failed to fetch branch ranking");
    }
  };

  // View batch students
  const viewBatchStudents = async (batchId) => {
    try {
      const res = await fetch(`${API}/batches/${batchId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.length === 0) {
        alert("No students found in this batch");
        return;
      }
      let msg = data
        .map(
          (s, i) =>
            `${i + 1}. ${s.username} (${s.realName || "N/A"}) - ${s.department} - Solved: ${s.totalSolved}`
        )
        .join("\n");
      alert(msg);
    } catch {
      alert("Failed to fetch batch students");
    }
  };

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      {/* Add Student */}
      <div className="card">
        <h3>Add Student</h3>
        <input
          placeholder="LeetCode username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
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
      </div>

      {/* Create Batch */}
      <div className="card">
        <h3>Create Batch</h3>
        <input
          placeholder="Batch Name"
          value={batchName}
          onChange={(e) => setBatchName(e.target.value)}
        />
        <input
          type="number"
          placeholder="No. of Students"
          value={batchCount}
          onChange={(e) => setBatchCount(e.target.value)}
        />
        <input
          type="number"
          placeholder="Start Rank"
          value={startRank}
          onChange={(e) => setStartRank(e.target.value)}
        />
        <input
          type="number"
          placeholder="End Rank"
          value={endRank}
          onChange={(e) => setEndRank(e.target.value)}
        />
        <button className="btn" onClick={createBatch}>
          Create
        </button>
      </div>

      {/* Ranking Section */}
      <div className="card">
        <h3>College Ranking</h3>
        <button className="btn" onClick={fetchStudents}>
          All College
        </button>
        <select value={branch} onChange={(e) => setBranch(e.target.value)}>
          <option>CS</option>
          <option>ECE</option>
          <option>EEE</option>
          <option>AIML</option>
          <option>AISA</option>
        </select>
        <button className="btn" onClick={fetchBranchRank}>
          Branch-wise
        </button>

        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Dept</th>
              <th>Solved</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.username}>
                <td>{s.username}</td>
                <td>{s.realName}</td>
                <td>{s.department}</td>
                <td>{s.totalSolved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Batches */}
      <div className="card">
        <h3>Available Batches</h3>
        {batches.length === 0 ? (
          <p>No batches found</p>
        ) : (
          batches.map((b) => (
            <div key={b.id}>
              <strong>{b.name}</strong>{" "}
              <button onClick={() => viewBatchStudents(b.id)}>
                View Students
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
