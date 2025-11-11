//import { db } from "./db.js";
//
//// Check if user exists
//export async function getUserFromDB(username) {
//  const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
//  return rows.length > 0 ? rows[0] : null;
//}
//
//// Save user data
//export async function saveUserToDB(userData) {
//  const { username, profile, submitStats } = userData;
//  await db.execute(
//    "INSERT INTO users (username, realName, aboutMe, countryName, userAvatar, reputation, ranking, stats) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
//    [
//      username,
//      profile.realName,
//      profile.aboutMe,
//      profile.countryName,
//      profile.userAvatar,
//      profile.reputation,
//      profile.ranking,
//      JSON.stringify(submitStats),
//    ]
//  );
//  console.log("✅ User data saved to MySQL");
//}
//import { db } from "./db.js";

//export async function getUser(username) {
//  const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
//  return rows[0];
//}
//
//export async function saveUser(user, department = "CS") {
//  const { username, profile, submitStats } = user;
//  const totalSolved = submitStats.acSubmissionNum.reduce((a, b) => a + b.count, 0);
//
//  await db.execute(
//    `REPLACE INTO users
//    (username, realName, aboutMe, countryName, userAvatar, reputation, ranking, stats, department, totalSolved)
//    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//    [
//      username,
//      profile.realName,
//      profile.aboutMe,
//      profile.countryName,
//      profile.userAvatar,
//      profile.reputation,
//      profile.ranking,
//      JSON.stringify(submitStats),
//      department,
//      totalSolved
//    ]
//  );
//}


//t

// backend/userModel.js
import { db } from "./db.js";

export async function getUserFromDB(username) {
  const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
  return rows[0];
}

export async function saveUserToDB(user, department = "CS") {
  const { username, profile, submitStats } = user;
  // compute totalSolved from acSubmissionNum
  const ac = (submitStats?.acSubmissionNum || []).reduce((sum, a) => sum + (a.count || 0), 0);

  await db.execute(
    `REPLACE INTO users
    (username, realName, aboutMe, countryName, userAvatar, reputation, ranking, stats, department, totalSolved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      username,
      profile.realName || username,
      profile.aboutMe || "",
      profile.countryName || null,
      profile.userAvatar || null,
      profile.reputation || 0,
      profile.ranking || null,
      JSON.stringify(submitStats || {}),
      department,
      ac
    ]
  );

  return await getUserFromDB(username);
}

export async function deleteUser(username) {
  await db.execute("DELETE FROM users WHERE username = ?", [username]);
}
