import { GitHubEvent, GitHubUser } from '@/types/github'

class GitHubApiService {
  private baseUrl = 'https://api.github.com'
  private token: string | null = null

  constructor(token?: string) {
    if (token) {
      this.token = token
    }
  }

  setToken(token: string) {
    this.token = token
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'DevLog-App'
    }

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`
    }

    const response = await fetch(url, { headers })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Invalid or missing GitHub token')
      }
      if (response.status === 403) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }
      if (response.status === 404) {
        throw new Error('User not found')
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getUserEvents(username: string, page: number = 1, perPage: number = 30): Promise<GitHubEvent[]> {
    return this.makeRequest<GitHubEvent[]>(`/users/${username}/events/public?page=${page}&per_page=${perPage}`)
  }

  async getUser(username: string): Promise<GitHubUser> {
    return this.makeRequest<GitHubUser>(`/users/${username}`)
  }

  async getAuthenticatedUserEvents(page: number = 1, perPage: number = 30): Promise<GitHubEvent[]> {
    if (!this.token) {
      throw new Error('Authentication required for private events')
    }
    return this.makeRequest<GitHubEvent[]>(`/user/events?page=${page}&per_page=${perPage}`)
  }

  async getAuthenticatedUser(): Promise<GitHubUser> {
    if (!this.token) {
      throw new Error('Authentication required')
    }
    return this.makeRequest<GitHubUser>('/user')
  }

  // Helper method to check if token is valid
  async validateToken(): Promise<boolean> {
    if (!this.token) {
      return false
    }

    try {
      await this.getAuthenticatedUser()
      return true
    } catch {
      return false
    }
  }

  // Helper method to get rate limit info
  async getRateLimit(): Promise<{ limit: number; remaining: number; reset: number }> {
    const response = await fetch(`${this.baseUrl}/rate_limit`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DevLog-App'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch rate limit')
    }

    const data = await response.json()
    return data.rate
  }
}

export const githubApi = new GitHubApiService()
