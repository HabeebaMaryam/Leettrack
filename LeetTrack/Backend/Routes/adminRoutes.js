//import express from "express";
//import bcrypt from "bcryptjs";
//import jwt from "jsonwebtoken";
//import { getAdminByEmail, createAdmin } from "../adminModel.js";
//import { getUser, saveUser } from "../userModel.js";
//import { fetchLeetCodeData } from "../leetcodeApi.js";
//import dotenv from "dotenv";
//dotenv.config();
//
//const router = express.Router();
//
//// Admin registration
//router.post("/register", async (req, res) => {
//  const { email, password, name } = req.body;
//  const existing = await getAdminByEmail(email);
//  if (existing) return res.status(400).json({ message: "Admin exists" });
//
//  const hash = await bcrypt.hash(password, 10);
//  await createAdmin(email, hash, name);
//  res.json({ message: "Admin created" });
//});
//
//// Admin login
//router.post("/login", async (req, res) => {
//  const { email, password } = req.body;
//  const admin = await getAdminByEmail(email);
//  if (!admin) return res.status(400).json({ message: "Invalid email" });
//
//  const ok = await bcrypt.compare(password, admin.password_hash);
//  if (!ok) return res.status(400).json({ message: "Wrong password" });
//
//  const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: "8h" });
//  res.json({ token });
//});
//
//// Add student (checks DB first)
//router.post("/add-student", async (req, res) => {
//  const { username, department } = req.body;
//  let user = await getUser(username);
//
//  if (user) return res.json({ fromDB: true, user });
//
//  const data = await fetchLeetCodeData(username);
//  if (!data) return res.status(404).json({ message: "User not found on LeetCode" });
//
//  await saveUser(data, department);
//  user = await getUser(username);
//  res.json({ fromDB: false, user });
//});
//
//export default router;


//t

// backend/routes/adminRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import { getAdminByEmail, createAdmin } from "../adminModel.js";
import { getUserFromDB, saveUserToDB, deleteUser } from "../userModel.js";
import { fetchLeetCodeData } from "../leetcodeApi.js";
import { createBatch, addMember, getBatches, removeMember } from "../batchModel.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// register admin
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existing = await getAdminByEmail(email);
    if (existing) return res.status(400).json({ message: "Admin exists" });

    const hash = await bcrypt.hash(password, 10);
    await createAdmin(email, hash, name);
    return res.json({ message: "Admin created" });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await getAdminByEmail(email);
    if (!admin) return res.status(400).json({ message: "Invalid email" });

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: "8h" });
    return res.json({ token });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

// middleware to protect admin routes
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "Missing token" });
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Add student: checks DB, else fetches and saves. Body: { username, department }
router.post("/add-student", authMiddleware, async (req, res) => {
  const { username, department } = req.body;
  try {
    let user = await getUserFromDB(username);
    if (user) return res.json({ fromDB: true, user });

    const data = await fetchLeetCodeData(username);
    if (!data) return res.status(404).json({ message: "User not found on LeetCode" });

    const saved = await saveUserToDB(data, department || "CS");
    return res.json({ fromDB: false, user: saved });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

// delete student
router.delete("/student/:username", authMiddleware, async (req, res) => {
  const { username } = req.params;
  try {
    await deleteUser(username);
    return res.json({ message: "Deleted" });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

// batch endpoints
router.post("/batch", authMiddleware, async (req, res) => {
  const { name, branch, description } = req.body;
  try {
    const id = await createBatch(name, branch || "ALL", description || "");
    return res.json({ id });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

router.post("/batch/:id/add", authMiddleware, async (req, res) => {
  const batchId = req.params.id;
  const { username } = req.body;
  try {
    await addMember(batchId, username);
    return res.json({ message: "Added" });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

router.post("/batch/:id/remove", authMiddleware, async (req, res) => {
  const batchId = req.params.id;
  const { username } = req.body;
  try {
    await removeMember(batchId, username);
    return res.json({ message: "Removed" });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

router.get("/batches", authMiddleware, async (req, res) => {
  try {
    const b = await getBatches();
    return res.json(b);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

export default router;
