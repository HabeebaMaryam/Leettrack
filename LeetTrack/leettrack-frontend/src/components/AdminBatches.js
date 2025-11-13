import React, { useState, useEffect } from "react";
import "./AdminBatches.css";

function AdminBatches() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/batches")
      .then((res) => res.json())
      .then((data) => setBatches(data))
      .catch((err) => console.error("Error fetching batches:", err));
  }, []);

  const viewBatchStudents = (batchId) => {
    setSelectedBatch(batchId);
    fetch(`http://localhost:5000/api/admin/batches/${batchId}/students`)
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error("Error fetching students:", err));
  };

  return (
    <div className="container">
      <h2>All Batches</h2>

      <div className="batch-list">
        {batches.length === 0 ? (
          <p>No batches found</p>
        ) : (
          batches.map((b) => (
            <div
              key={b.id}
              className="batch-card"
              onClick={() => viewBatchStudents(b.id)}
            >
              <h3>{b.name}</h3>
              <p>Branch: {b.branch}</p>
              <p>{b.description}</p>
            </div>
          ))
        )}
      </div>

      {selectedBatch && (
        <div className="students-section">
          <h2>Students in Batch #{selectedBatch}</h2>
          {students.length === 0 ? (
            <p>No students in this batch</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Real Name</th>
                  <th>Department</th>
                  <th>Ranking</th>
                  <th>Total Solved</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.username}>
                    <td>{s.username}</td>
                    <td>{s.realName}</td>
                    <td>{s.department}</td>
                    <td>{s.ranking}</td>
                    <td>{s.totalSolved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminBatches;
