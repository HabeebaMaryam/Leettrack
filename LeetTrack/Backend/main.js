import readlineSync from "readline-sync";
import { fetchLeetCodeData } from "./leetcodeApi.js";
import { getUserFromDB, saveUserToDB } from "./userModel.js";

async function main() {
  const username = readlineSync.question("Enter LeetCode username: ").trim();

  // 1️⃣ Check DB first
  const existingUser = await getUserFromDB(username);
  if (existingUser) {
    console.log("📦 Data from MySQL:");
    console.log(existingUser);
    process.exit(0);
  }

  // 2️⃣ Fetch from LeetCode API
  console.log("🌐 Fetching data from LeetCode...");
  const userData = await fetchLeetCodeData(username);

  if (!userData) {
    console.log("❌ User not found!");
    process.exit(0);
  }

  // 3️⃣ Save to DB
  await saveUserToDB(userData);
  console.log("✅ Data fetched and stored!");
  console.log(userData);
}

main();
