export interface GitHubActivityStats {
  totalContributions: number
  contributionsByYear: {
    year: number
    total: number
    weeks: GitHubWeek[]
  }
}

export interface GitHubWeek {
  contributionDays: GitHubContributionDay[]
  firstDay: string
}

export interface GitHubContributionDay {
  color: string
  contributionCount: number
  date: string
  weekday: number
}

export interface GitHubUserActivity {
  user: {
    name: string
    email: string
    avatarUrl: string
    contributionsCollection: {
      totalCommitContributions: number
      totalIssueContributions: number
      totalPullRequestContributions: number
      totalPullRequestReviewContributions: number
      totalRepositoryContributions: number
      contributionCalendar: {
        totalContributions: number
        weeks: GitHubWeek[]
      }
      contributionYears: {
        year: number
        total: number
      }[]
    }
  }
}

export interface GitHubActivitySummary {
  commits: number
  pullRequests: number
  issues: number
  reviews: number
  repositories: number
  totalContributions: number
  currentStreak: number
  longestStreak: number
  contributionsThisYear: number
  contributionsLastYear: number
  averagePerWeek: number
  mostActiveDay: string
  contributionGraph: {
    [date: string]: number
  }
}

// API response shapes used by UI components
export interface TodayContributionData {
  date: string
  contributionCount: number
  commits: number
  pullRequests: number
  issues: number
  reviews: number
  username: string
}

export interface DateContributionData {
  date: string
  contributionCount: number
  breakdown: {
    commits: number
    pullRequests: number
    issues: number
    reviews: number
    other: number
  }
  // Top events for that day
  events: import('./github').GitHubEvent[]
  username: string
}
