//import fetch from "node-fetch";
//
//const query = `
//  query getUserProfile($username: String!) {
//    matchedUser(username: $username) {
//      username
//      profile {
//        realName
//        aboutMe
//        countryName
//        userAvatar
//        reputation
//        ranking
//      }
//      submitStats {
//        acSubmissionNum {
//          difficulty
//          count
//          submissions
//        }
//      }
//    }
//  }
//`;
//
//export async function fetchLeetCodeData(username) {
//  const response = await fetch("https://leetcode.com/graphql", {
//    method: "POST",
//    headers: { "Content-Type": "application/json" },
//    body: JSON.stringify({ query, variables: { username } }),
//  });
//
//  const data = await response.json();
//  return data.data.matchedUser;
//}


//t

// backend/leetcodeApi.js
import fetch from "node-fetch";

export async function fetchLeetCodeData(username) {
  try {
    const query = `
      query userProfile($username: String!) {
        allQuestionsCount { difficulty }
        matchedUser(username: $username) {
          username
          profile {
            realName
            aboutMe
            countryName
            userAvatar
            reputation
            ranking
          }
          submitStats: submitStats {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
        }
      }
    `;
    const variables = { username };
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables })
    });
    const json = await res.json();
    const matched = json?.data?.matchedUser;
    if (!matched) return null;
    return {
      username,
      profile: {
        realName: matched.profile?.realName || username,
        aboutMe: matched.profile?.aboutMe || "",
        countryName: matched.profile?.countryName || null,
        userAvatar: matched.profile?.userAvatar || null,
        reputation: matched.profile?.reputation || 0,
        ranking: matched.profile?.ranking || null
      },
      submitStats: matched.submitStats || { acSubmissionNum: [] }
    };
  } catch (err) {
    console.error("LeetCode fetch error:", err);
    return null;
  }
}
