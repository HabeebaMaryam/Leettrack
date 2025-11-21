interface LeetCodeBadge {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  creationDate: string;
  category: string;
}

interface LeetCodeStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: string;
  ranking: number;
  contestRating: number;
  recentSubmissions: Array<{
    title: string;
    timestamp: string;
    statusDisplay: string;
    lang: string;
  }>;
  badges: LeetCodeBadge[];
}

export async function fetchLeetCodeStats(username: string): Promise<LeetCodeStats> {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
        profile {
          ranking
        }
        badges {
          id
          name
          displayName
          icon
          creationDate
          category
        }
      }
      recentSubmissionList(username: $username, limit: 10) {
        title
        timestamp
        statusDisplay
        lang
      }
    }
  `;

  try {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    if (!response.ok) {
      throw new Error(`LeetCode API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data?.matchedUser) {
      throw new Error('User not found on LeetCode');
    }

    const submissions = data.data.matchedUser.submitStats.acSubmissionNum;
    const allSolved = submissions.find((s: any) => s.difficulty === 'All')?.count || 0;
    const easySolved = submissions.find((s: any) => s.difficulty === 'Easy')?.count || 0;
    const mediumSolved = submissions.find((s: any) => s.difficulty === 'Medium')?.count || 0;
    const hardSolved = submissions.find((s: any) => s.difficulty === 'Hard')?.count || 0;

    const ranking = data.data.matchedUser.profile?.ranking || 0;
    const recentSubmissions = (data.data.recentSubmissionList || []).slice(0, 10);
    const badges = (data.data.matchedUser.badges || []).map((badge: any) => ({
      id: badge.id,
      name: badge.name,
      displayName: badge.displayName,
      icon: badge.icon,
      creationDate: badge.creationDate,
      category: badge.category,
    }));

    return {
      totalSolved: allSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      acceptanceRate: 'N/A',
      ranking,
      contestRating: 0,
      recentSubmissions,
      badges,
    };
  } catch (error) {
    console.error('Error fetching LeetCode stats:', error);
    throw error;
  }
}
