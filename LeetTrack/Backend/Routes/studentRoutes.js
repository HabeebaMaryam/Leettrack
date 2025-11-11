//import express from "express";
//import { getUser, saveUser } from "../userModel.js";
//import { fetchLeetCodeData } from "../leetcodeApi.js";
//
//const router = express.Router();
//
//router.get("/:username", async (req, res) => {
//  const { username } = req.params;
//  let user = await getUser(username);
//
//  if (!user) {
//    const data = await fetchLeetCodeData(username);
//    if (!data) return res.status(404).json({ message: "User not found" });
//    await saveUser(data);
//    user = await getUser(username);
//  }
//
//  res.json(user);
//});
//
//export default router;


//t

// backend/routes/studentRoutes.js
import express from "express";
import { fetchLeetCodeData } from "../leetcodeApi.js";
import { getUserFromDB, saveUserToDB } from "../userModel.js";

const router = express.Router();

// GET /api/student/:username
router.get("/:username", async (req, res) => {
  const { username } = req.params;
  try {
    let user = await getUserFromDB(username);
    if (user) return res.json({ source: "db", user });

    const data = await fetchLeetCodeData(username);
    if (!data) return res.status(404).json({ message: "User not found on LeetCode" });

    const saved = await saveUserToDB(data); // default department CS
    return res.json({ source: "leetcode", user: saved });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
