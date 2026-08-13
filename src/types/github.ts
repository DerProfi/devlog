export interface GitHubEvent {
  id: string
  type: string
  actor: {
    id: number
    login: string
    display_login: string
    gravatar_id: string
    url: string
    avatar_url: string
  }
  repo: {
    id: number
    name: string
    url: string
  }
  payload: {
    action?: string
    ref?: string
    ref_type?: string
    master_branch?: string
    description?: string
    pusher_type?: string
    push_id?: number
    size?: number
    distinct_size?: number
    head?: string
    before?: string
    commits?: GitHubCommit[]
    pull_request?: GitHubPullRequest
    issue?: GitHubIssue
    release?: GitHubRelease
  }
  public: boolean
  created_at: string
  org?: {
    id: number
    login: string
    gravatar_id: string
    url: string
    avatar_url: string
  }
}

export interface GitHubCommit {
  sha: string
  author: {
    email: string
    name: string
  }
  message: string
  distinct: boolean
  url: string
}

export interface GitHubPullRequest {
  url: string
  id: number
  node_id: string
  html_url: string
  diff_url: string
  patch_url: string
  issue_url: string
  number: number
  state: string
  locked: boolean
  title: string
  user: {
    login: string
    id: number
    node_id: string
    avatar_url: string
  }
  body: string
  created_at: string
  updated_at: string
  closed_at?: string
  merged_at?: string
  merge_commit_sha?: string
  assignee?: {
    login: string
    id: number
    avatar_url: string
  }
  assignees: {
    login: string
    id: number
    avatar_url: string
  }[]
  requested_reviewers: {
    login: string
    id: number
    avatar_url: string
  }[]
  requested_teams: {
    id: number
    name: string
  }[]
  labels: {
    id: number
    name: string
    color?: string
    description?: string
  }[]
  milestone?: {
    id: number
    title: string
    state: string
  }
  commits_url: string
  review_comments_url: string
  review_comment_url: string
  comments_url: string
  statuses_url: string
  head: {
    label: string
    ref: string
    sha: string
    user: {
      login: string
      id: number
      node_id: string
      avatar_url: string
    }
    repo: {
      id: number
      node_id: string
      name: string
      full_name: string
      private: boolean
      owner: {
        login: string
        id: number
        node_id: string
        avatar_url: string
      }
      html_url: string
      description?: string
      fork: boolean
      url: string
      forks_url: string
      keys_url: string
      collaborators_url: string
      teams_url: string
      hooks_url: string
      issue_events_url: string
      events_url: string
      assignees_url: string
      branches_url: string
      tags_url: string
      blobs_url: string
      git_tags_url: string
      git_refs_url: string
      trees_url: string
      statuses_url: string
      languages_url: string
      stargazers_url: string
      contributors_url: string
      subscribers_url: string
      subscription_url: string
      commits_url: string
      git_commits_url: string
      compare_url: string
      merges_url: string
      archive_url: string
      downloads_url: string
      issues_url: string
      pulls_url: string
      milestones_url: string
      notifications_url: string
      labels_url: string
      releases_url: string
      deployments_url: string
    }
  }
  base: {
    label: string
    ref: string
    sha: string
    user: {
      login: string
      id: number
      node_id: string
      avatar_url: string
    }
    repo: {
      id: number
      node_id: string
      name: string
      full_name: string
      private: boolean
      owner: {
        login: string
        id: number
        node_id: string
        avatar_url: string
      }
      html_url: string
      description?: string
      fork: boolean
      url: string
      forks_url: string
      keys_url: string
      collaborators_url: string
      teams_url: string
      hooks_url: string
      issue_events_url: string
      events_url: string
      assignees_url: string
      branches_url: string
      tags_url: string
      blobs_url: string
      git_tags_url: string
      git_refs_url: string
      trees_url: string
      statuses_url: string
      languages_url: string
      stargazers_url: string
      contributors_url: string
      subscribers_url: string
      subscription_url: string
      commits_url: string
      git_commits_url: string
      compare_url: string
      merges_url: string
      archive_url: string
      downloads_url: string
      issues_url: string
      pulls_url: string
      milestones_url: string
      notifications_url: string
      labels_url: string
      releases_url: string
      deployments_url: string
    }
  }
}

export interface GitHubIssue {
  url: string
  repository_url: string
  labels_url: string
  comments_url: string
  events_url: string
  html_url: string
  id: number
  node_id: string
  number: number
  title: string
  user: {
    login: string
    id: number
    node_id: string
    avatar_url: string
  }
  labels: {
    id: number
    name: string
    color?: string
    description?: string
  }[]
  state: string
  locked: boolean
  assignee?: {
    login: string
    id: number
    avatar_url: string
  }
  assignees: {
    login: string
    id: number
    avatar_url: string
  }[]
  milestone?: {
    id: number
    title: string
    state: string
  }
  comments: number
  created_at: string
  updated_at: string
  closed_at?: string
  author_association: string
  body: string
}

export interface GitHubRelease {
  url: string
  assets_url: string
  upload_url: string
  html_url: string
  id: number
  author: {
    login: string
    id: number
    node_id: string
    avatar_url: string
  }
  node_id: string
  tag_name: string
  target_commitish: string
  name: string
  draft: boolean
  prerelease: boolean
  created_at: string
  published_at: string
  assets: {
    id: number
    name: string
    browser_download_url: string
    size: number
    download_count: number
    content_type?: string
  }[]
  tarball_url: string
  zipball_url: string
  body: string
}

export interface GitHubUser {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
  name?: string
  company?: string
  blog?: string
  location?: string
  email?: string
  hireable?: boolean
  bio?: string
  twitter_username?: string
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
}
