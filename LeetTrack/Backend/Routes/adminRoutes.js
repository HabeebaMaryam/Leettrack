
//
//import express from "express";
//import bcrypt from "bcryptjs";
//import jwt from "jsonwebtoken";
//import dotenv from "dotenv";
//dotenv.config();
//import { db } from "../db.js";
//import { getAdminByEmail, createAdmin } from "../adminModel.js";
//import { getUserFromDB, saveUserToDB, deleteUser } from "../userModel.js";
//import { fetchLeetCodeData } from "../leetcodeApi.js";
//
//const router = express.Router();
//const JWT_SECRET = process.env.JWT_SECRET || "secret";
//
//// -------- AUTH --------
//router.post("/register", async (req, res) => {
//  const { email, password, name } = req.body;
//  try {
//    const existing = await getAdminByEmail(email);
//    if (existing) return res.status(400).json({ message: "Admin exists" });
//
//    const hash = await bcrypt.hash(password, 10);
//    await createAdmin(email, hash, name);
//    res.json({ message: "Admin created" });
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ message: "Server error" });
//  }
//});
//
//router.post("/login", async (req, res) => {
//  const { email, password } = req.body;
//  try {
//    const admin = await getAdminByEmail(email);
//    if (!admin) return res.status(400).json({ message: "Invalid email" });
//
//    const ok = await bcrypt.compare(password, admin.password_hash);
//    if (!ok) return res.status(400).json({ message: "Wrong password" });
//
//    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, {
//      expiresIn: "8h",
//    });
//    res.json({ token });
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ message: "Server error" });
//  }
//});
//
//// -------- MIDDLEWARE --------
//function authMiddleware(req, res, next) {
//  const auth = req.headers.authorization;
//  if (!auth) return res.status(401).json({ message: "Missing token" });
//  const token = auth.split(" ")[1];
//  try {
//    req.admin = jwt.verify(token, JWT_SECRET);
//    next();
//  } catch {
//    res.status(401).json({ message: "Invalid token" });
//  }
//}
//
//// -------- STUDENT MGMT --------
//router.post("/add-student", authMiddleware, async (req, res) => {
//  const { username, department } = req.body;
//  try {
//    let user = await getUserFromDB(username);
//    if (user) return res.json({ fromDB: true, message: "Already in DB" });
//
//    const data = await fetchLeetCodeData(username);
//    if (!data) return res.status(404).json({ message: "User not found" });
//
//    await saveUserToDB(data, department);
//    res.json({ fromDB: false, message: "Fetched & saved" });
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ message: "Server error" });
//  }
//});
//
//router.get("/students", authMiddleware, async (req, res) => {
//  try {
//    const [rows] = await db.query("SELECT * FROM users ORDER BY totalSolved DESC");
//    res.json(rows);
//  } catch {
//    res.status(500).json({ message: "Server error" });
//  }
//});
//
//router.get("/students/branch/:dept", authMiddleware, async (req, res) => {
//  const { dept } = req.params;
//  try {
//    const [rows] = await db.query(
//      "SELECT * FROM users WHERE department = ? ORDER BY totalSolved DESC",
//      [dept]
//    );
//    res.json(rows);
//  } catch {
//    res.status(500).json({ message: "Server error" });
//  }
//});
//
//// -------- BATCH MGMT (updated) --------
//router.post("/create-batch", authMiddleware, async (req, res) => {
//  const { batchName, batchCount, startRank, endRank } = req.body;
//
//  try {
//    // 1️⃣ Create batch record
//    const [result] = await db.query("INSERT INTO batches (name) VALUES (?)", [batchName]);
//    const batchId = result.insertId;
//
//    // 2️⃣ Select students by ranking range
//    const [students] = await db.query(
//      `SELECT username FROM users
//       WHERE ranking BETWEEN ? AND ?
//       ORDER BY ranking ASC
//       LIMIT ?`,
//      [parseInt(startRank), parseInt(endRank), parseInt(batchCount)]
//    );
//
//    // 3️⃣ Add them to batch_members
//    for (const s of students) {
//      await db.query("INSERT INTO batch_members (batch_id, username) VALUES (?, ?)", [
//        batchId,
//        s.username,
//      ]);
//    }
//
//    res.json({ message: `Batch '${batchName}' created with ${students.length} students.` });
//  } catch (err) {
//    console.error("Error creating batch:", err);
//    res.status(500).json({ message: "Server error" });
//  }
//});
//
//router.get("/batches", authMiddleware, async (req, res) => {
//  try {
//    const [rows] = await db.query("SELECT * FROM batches ORDER BY id DESC");
//    res.json(rows);
//  } catch {
//    res.status(500).json({ message: "Server error" });
//  }
//});
//
//router.get("/batches/:id/students", authMiddleware, async (req, res) => {
//  try {
//    const { id } = req.params;
//    const [students] = await db.query(
//      `SELECT u.username, u.realName, u.department, u.totalSolved
//       FROM batch_members bm
//       JOIN users u ON bm.username = u.username
//       WHERE bm.batch_id = ?`,
//      [id]
//    );
//    res.json(students);
//  } catch {
//    res.status(500).json({ message: "Server error" });
//  }
//});
//
//export default router;

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { db } from "../db.js";
import { getAdminByEmail, createAdmin } from "../adminModel.js";
import { getUserFromDB, saveUserToDB, deleteUser } from "../userModel.js";
import { fetchLeetCodeData } from "../leetcodeApi.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// -------- AUTH --------
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existing = await getAdminByEmail(email);
    if (existing) return res.status(400).json({ message: "Admin exists" });

    const hash = await bcrypt.hash(password, 10);
    await createAdmin(email, hash, name);
    res.json({ message: "Admin created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await getAdminByEmail(email);
    if (!admin) return res.status(400).json({ message: "Invalid email" });

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, {
      expiresIn: "8h",
    });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------- MIDDLEWARE --------
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "Missing token" });
  const token = auth.split(" ")[1];
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

// -------- STUDENT MGMT --------
router.post("/add-student", authMiddleware, async (req, res) => {
  const { username, department } = req.body;
  try {
    let user = await getUserFromDB(username);
    if (user) return res.json({ fromDB: true, message: "Already in DB" });

    const data = await fetchLeetCodeData(username);
    if (!data) return res.status(404).json({ message: "User not found" });

    await saveUserToDB(data, department);
    res.json({ fromDB: false, message: "Fetched & saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/students", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users ORDER BY totalSolved DESC");
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/students/branch/:dept", authMiddleware, async (req, res) => {
  const { dept } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE department = ? ORDER BY totalSolved DESC",
      [dept]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// -------- BATCH MGMT (updated) --------
router.post("/create-batch", authMiddleware, async (req, res) => {
  const { batchName, batchCount, startRank, endRank } = req.body;

  try {
    // 1️⃣ Create batch record
    const [result] = await db.query("INSERT INTO batches (name) VALUES (?)", [batchName]);
    const batchId = result.insertId;

    // 2️⃣ Select students by ranking range
    const [students] = await db.query(
      `SELECT username FROM users
       WHERE ranking BETWEEN ? AND ?
       ORDER BY ranking ASC
       LIMIT ?`,
      [parseInt(startRank), parseInt(endRank), parseInt(batchCount)]
    );

    // 3️⃣ Add them to batch_members
    for (const s of students) {
      await db.query("INSERT INTO batch_members (batch_id, username) VALUES (?, ?)", [
        batchId,
        s.username,
      ]);
    }

    res.json({ message: `Batch '${batchName}' created with ${students.length} students.` });
  } catch (err) {
    console.error("Error creating batch:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/batches", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM batches ORDER BY id DESC");
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/batches/:id/students", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [students] = await db.query(
      `SELECT u.username, u.realName, u.department, u.totalSolved
       FROM batch_members bm
       JOIN users u ON bm.username = u.username
       WHERE bm.batch_id = ?`,
      [id]
    );
    res.json(students);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
