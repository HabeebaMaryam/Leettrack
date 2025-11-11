//import mysql from "mysql2/promise";
//
//export const db = await mysql.createConnection({
//  host: "localhost",
//  user: "root",          // change if your MySQL username is different
//  password: "fireen.16",  // put your MySQL password here
//  database: "leettrack",      // make sure this DB exists
//});
//
//console.log("✅ Connected to MySQL Database");


//t

// backend/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const db = await mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "fireen.16",
  database: process.env.DB_NAME || "leettrack",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
