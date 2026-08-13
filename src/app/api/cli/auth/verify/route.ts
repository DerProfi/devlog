import { NextRequest, NextResponse } from 'next/server'
import { authenticateCLI, createSuccessResponse, createErrorResponse } from '@/lib/cliAuth'

export async function GET(request: NextRequest) {
  const { user, error } = await authenticateCLI(request)

  if (error || !user) {
    return NextResponse.json(
      createErrorResponse(error || 'Authentication failed', 'UNAUTHORIZED'),
      { status: 401 }
    )
  }

  return NextResponse.json(
    createSuccessResponse({
      user: {
        id: user.id,
        githubId: user.github_id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar_url,
        preferences: user.preferences
      }
    })
  )
}
