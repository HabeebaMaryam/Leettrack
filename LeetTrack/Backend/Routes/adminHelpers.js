// backend/routes/adminHelpers.js
import express from "express";
import { db } from "../db.js";

const router = express.Router();

router.get("/student-list", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT username, realName, department, totalSolved FROM users ORDER BY totalSolved DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
