//import express from "express";
//import cors from "cors";
//import { fetchLeetCodeData } from "./leetcodeApi.js";
//import { getUserFromDB, saveUserToDB } from "./userModel.js";
//
//const app = express();
//app.use(cors());
//app.use(express.json());
//
//// API endpoint: /api/user/:username
//app.get("/api/user/:username", async (req, res) => {
//  const { username } = req.params;
//
//  try {
//    // 1️⃣ Check if user is in DB
//    const existingUser = await getUserFromDB(username);
//    if (existingUser) {
//      console.log("📦 Data from MySQL");
//      return res.json({ source: "db", user: existingUser });
//    }
//
//    // 2️⃣ Otherwise fetch from LeetCode
//    console.log("🌐 Fetching data from LeetCode...");
//    const userData = await fetchLeetCodeData(username);
//
//    if (!userData) {
//      return res.status(404).json({ error: "User not found" });
//    }
//
//    // 3️⃣ Save to DB
//    await saveUserToDB(userData);
//    res.json({ source: "leetcode", user: userData });
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ error: "Server error" });
//  }
//});
//
//app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));


//import express from "express";
//import cors from "cors";
//import dotenv from "dotenv";
//dotenv.config();
//
//import adminRoutes from "./routes/adminRoutes.js";
//import studentRoutes from "./routes/studentRoutes.js";
//
//const app = express();
//app.use(cors());
//app.use(express.json());
//
//app.use("/api/admin", adminRoutes);
//app.use("/api/student", studentRoutes);
//
//app.listen(4000, () => console.log("🚀 Backend running at http://localhost:4000"));


//t

// backend/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import adminRoutes from "./routes/adminRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import rankRoutes from "./routes/rankRoutes.js";
import adminHelpers from "./routes/adminHelpers.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/rank", rankRoutes);
app.use("/api", adminHelpers); // or app.use("/api/admin", adminHelpers);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Backend running at http://localhost:${PORT}`));
