// backend/batchModel.js
import { db } from "./db.js";

export async function createBatch(name, branch, description) {
  const [res] = await db.execute("INSERT INTO batches (name, branch, description) VALUES (?, ?, ?)", [name, branch, description]);
  return res.insertId;
}

export async function addMember(batchId, username) {
  await db.execute("REPLACE INTO batch_members (batch_id, username) VALUES (?, ?)", [batchId, username]);
}

export async function removeMember(batchId, username) {
  await db.execute("DELETE FROM batch_members WHERE batch_id = ? AND username = ?", [batchId, username]);
}

export async function getBatches() {
  const [rows] = await db.execute("SELECT * FROM batches");
  return rows;
}
