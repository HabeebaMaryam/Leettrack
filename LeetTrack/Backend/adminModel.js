//import { db } from "./db.js";
//
//export async function createAdmin(email, passwordHash, name) {
//  await db.execute("INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)", [email, passwordHash, name]);
//}
//
//export async function getAdminByEmail(email) {
//  const [rows] = await db.execute("SELECT * FROM admins WHERE email = ?", [email]);
//  return rows[0];
//}


//t

// backend/adminModel.js
import { db } from "./db.js";

export async function createAdmin(email, passwordHash, name) {
  await db.execute("INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)", [email, passwordHash, name]);
}

export async function getAdminByEmail(email) {
  const [rows] = await db.execute("SELECT * FROM admins WHERE email = ?", [email]);
  return rows[0];
}
