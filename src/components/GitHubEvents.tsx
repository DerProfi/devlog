'use client'

import { useState, useEffect, useCallback } from 'react'
import { GitHubEvent, GitHubUser, GitHubCommit } from '@/types/github'
import { githubApi } from '@/services/githubApi'
import { useAuth } from '@/contexts/AuthContext'
import Card from './ui/Card'
import Button from './ui/Button'
import Image from 'next/image'
import { FaCode, FaFolderPlus, FaTrash, FaBug, FaComment, FaCodeBranch, FaEye, FaStar, FaUtensils, FaRocket, FaBook, FaUsers, FaGlobe, FaServer, FaFileAlt, FaTimesCircle, FaGithub, FaLightbulb } from 'react-icons/fa'

interface GitHubEventsProps {
  username?: string
  token?: string
  maxEvents?: number
}

export default function GitHubEvents({ username, token, maxEvents = 10 }: GitHubEventsProps) {
  const { user: authUser } = useAuth()
  const [events, setEvents] = useState<GitHubEvent[]>([])
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateLimit, setRateLimit] = useState<{ limit: number; remaining: number; reset: number } | null>(null)
  const [inputUsername, setInputUsername] = useState(username || authUser?.username || '')
  const [inputToken, setInputToken] = useState(token || '')
  const [showAuth, setShowAuth] = useState(false)


  const fetchRateLimit = async () => {
    try {
      const limit = await githubApi.getRateLimit()
      setRateLimit(limit)
    } catch (err) {
      console.error('Failed to fetch rate limit:', err)
    }
  }

  const fetchEvents = useCallback(async (targetUsername: string) => {
    setLoading(true)
    setError(null)

    try {
      let fetchedEvents: GitHubEvent[]
      
      if (inputToken && targetUsername === 'me') {
        // Fetch authenticated user's events (including private)
        fetchedEvents = await githubApi.getAuthenticatedUserEvents()
        const userData = await githubApi.getAuthenticatedUser()
        setUser(userData)
      } else {
        // Fetch public events for specified username
        fetchedEvents = await githubApi.getUserEvents(targetUsername)
        const userData = await githubApi.getUser(targetUsername)
        setUser(userData)
      }

      setEvents(fetchedEvents.slice(0, maxEvents))
      await fetchRateLimit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch GitHub events')
    } finally {
      setLoading(false)
    }
  }, [inputToken, maxEvents])

  useEffect(() => {
    if (token) {
      githubApi.setToken(token)
    }
    if (username) {
      fetchEvents(username)
    } else if (authUser?.username) {
      fetchEvents(authUser.username)
    }
    fetchRateLimit()
  }, [username, token, authUser, fetchEvents])

  const handleSubmit = () => {
    if (inputUsername) {
      fetchEvents(inputUsername)
    }
  }

  const getEventIcon = (type: string) => {
    const icons: { [key: string]: typeof FaCode } = {
      PushEvent: FaCode,
      CreateEvent: FaFolderPlus,
      DeleteEvent: FaTrash,
      IssuesEvent: FaBug,
      IssueCommentEvent: FaComment,
      PullRequestEvent: FaCodeBranch,
      PullRequestReviewEvent: FaEye,
      PullRequestReviewCommentEvent: FaComment,
      WatchEvent: FaStar,
      ForkEvent: FaUtensils,
      ReleaseEvent: FaRocket,
      GollumEvent: FaBook,
      CommitCommentEvent: FaComment,
      MemberEvent: FaUsers,
      PublicEvent: FaGlobe,
      DeploymentEvent: FaServer
    }
    return icons[type] || FaFileAlt
  }

  const getEventDescription = (event: GitHubEvent) => {
    switch (event.type) {
      case 'PushEvent':
        return `Pushed ${event.payload.size || 0} commit${(event.payload.size || 0) !== 1 ? 's' : ''} to ${event.repo.name}`
      case 'CreateEvent':
        return `Created ${event.payload.ref_type} "${event.payload.ref}" in ${event.repo.name}`
      case 'DeleteEvent':
        return `Deleted ${event.payload.ref_type} "${event.payload.ref}" from ${event.repo.name}`
      case 'IssuesEvent':
        return `${event.payload.action} issue #${event.payload.issue?.number} in ${event.repo.name}`
      case 'IssueCommentEvent':
        return `Commented on issue #${event.payload.issue?.number} in ${event.repo.name}`
      case 'PullRequestEvent':
        return `${event.payload.action} pull request #${event.payload.pull_request?.number} in ${event.repo.name}`
      case 'PullRequestReviewEvent':
        return `Reviewed pull request #${event.payload.pull_request?.number} in ${event.repo.name}`
      case 'WatchEvent':
        return `Starred ${event.repo.name}`
      case 'ForkEvent':
        return `Forked ${event.repo.name}`
      case 'ReleaseEvent':
        return `Released ${event.payload.release?.tag_name} of ${event.repo.name}`
      default:
        return `${event.type} in ${event.repo.name}`
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString('de-DE')
  }

  const getCommitsPreview = (commits: GitHubCommit[]) => {
    if (!commits || commits.length === 0) return null
    
    return (
      <div className="mt-2 space-y-1">
        {commits.slice(0, 3).map((commit, index) => (
          <div key={index} className="text-xs text-slate-400 font-mono">
            <span className="text-green-400">{commit.sha.substring(0, 7)}</span> {commit.message.split('\n')[0]}
          </div>
        ))}
        {commits.length > 3 && (
          <div className="text-xs text-slate-500">
            +{commits.length - 3} more commits
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold font-mono text-green-400">
          <FaGithub className="inline mr-1" /> GitHub Activity
        </h2>
        <div className="flex items-center gap-2">
          {rateLimit && (
            <div className="text-xs text-slate-500 font-mono">
              {rateLimit.remaining}/{rateLimit.limit} requests
            </div>
          )}
          <Button
            onClick={() => setShowAuth(!showAuth)}
            variant="ghost"
            size="sm"
          >
            {showAuth ? 'Hide' : 'Auth'}
          </Button>
        </div>
      </div>

      {/* Authentication Form */}
      {showAuth && (
        <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <h3 className="text-lg font-mono text-slate-300 mb-4">GitHub Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-mono text-slate-400 mb-2">
                Username (or &apos;me&apos; for authenticated user)
              </label>
              <input
                type="text"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                placeholder="your-username"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded font-mono text-white placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-mono text-slate-400 mb-2">
                GitHub Token (optional, for private events)
              </label>
              <input
                type="password"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded font-mono text-white placeholder-slate-400"
              />
              <p className="text-xs text-slate-500 mt-1">
                Create a token at <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">github.com/settings/tokens</a>
              </p>
            </div>
            <Button onClick={handleSubmit} disabled={!inputUsername || loading}>
              {loading ? 'Loading...' : 'Fetch Events'}
            </Button>
          </div>
        </div>
      )}

      {/* User Info */}
      {user && (
        <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center space-x-4">
          <Image
              src={user.avatar_url}
              alt={user.login}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="text-lg font-mono text-slate-300">{user.name || user.login}</h3>
              <div className="flex items-center space-x-4 text-sm text-slate-400 font-mono">
                <span>📁 {user.public_repos} repos</span>
                <span>⭐ {user.public_gists} gists</span>
                <span>👥 {user.followers} followers</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
          <p className="text-red-400 font-mono text-sm flex items-center gap-1"><FaTimesCircle /> {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <p className="text-slate-400 font-mono mt-2">Loading GitHub events...</p>
        </div>
      )}

      {/* Events List */}
      {!loading && events.length > 0 && (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start space-x-3">
                {(() => {
                  const Icon = getEventIcon(event.type)
                  return <Icon className="text-2xl mt-1" />
                })()}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-slate-300">
                    {getEventDescription(event)}
                  </p>
                  {event.type === 'PushEvent' && event.payload.commits && (
                    getCommitsPreview(event.payload.commits)
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500 font-mono">
                      {formatDate(event.created_at)}
                    </span>
                    <a
                      href={`https://github.com/${event.repo.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-mono"
                    >
                      View Repo →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && !error && (
        <div className="text-center py-8">
          <p className="text-slate-400 font-mono">No events found</p>
        </div>
      )}

      {/* Info Text */}
      <div className="mt-6 text-xs text-slate-500 font-mono">
        <FaLightbulb className="inline mr-1" /> Tip: Use your GitHub token to see private events and increase rate limits
      </div>
    </Card>
  )
}
