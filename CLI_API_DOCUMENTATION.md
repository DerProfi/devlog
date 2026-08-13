# CLI API Documentation

## Overview
RESTful API endpoints for CLI tool integration with DevLog backend.

---

## Authentication

All CLI API requests require authentication via GitHub OAuth token.

### Headers
```http
Authorization: Bearer <github_access_token>
Content-Type: application/json
```

### Token Source
The CLI uses the GitHub OAuth access token obtained during the login flow. This token is stored in Supabase's `users` table under `github_access_token`.

---

## API Endpoints

### 1. Verify Authentication

**Endpoint:** `GET /api/cli/auth/verify`

**Purpose:** Verify that the CLI token is valid and get user info

**Headers:**
```http
Authorization: Bearer <github_access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "githubId": 12345678,
      "username": "your-username",
      "email": "user@example.com",
      "avatarUrl": "https://...",
      "preferences": { ... }
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "v1"
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid or expired token",
    "code": "UNAUTHORIZED"
  }
}
```

---

### 2. List DevLogs

**Endpoint:** `GET /api/cli/devlogs`

**Purpose:** Get all DevLogs for authenticated user with pagination

**Query Parameters:**
- `limit` (optional, default: 50) - Number of logs per page
- `page` (optional, default: 1) - Page number
- `startDate` (optional, YYYY-MM-DD) - Filter logs from this date
- `endDate` (optional, YYYY-MM-DD) - Filter logs until this date

**Example:**
```bash
GET /api/cli/devlogs?limit=10&page=1&startDate=2024-01-01&endDate=2024-01-31
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "devLogs": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "date": "2024-01-15",
        "title": "## 🗓️ 15-01-2024 – Daily Dev Log",
        "modules": {
          "goals": "- [ ] Implement feature X",
          "achieved": "- Completed feature Y",
          "learnings": "- Learned about Z"
        },
        "tags": ["frontend", "api"],
        "is_public": false,
        "template": "comprehensive",
        "created_at": "2024-01-15T08:00:00.000Z",
        "updated_at": "2024-01-15T18:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "v1"
  }
}
```

---

### 3. Get Specific DevLog

**Endpoint:** `GET /api/cli/devlogs/:date`

**Purpose:** Get a specific DevLog by date

**Path Parameters:**
- `date` (YYYY-MM-DD) - Date of the DevLog

**Example:**
```bash
GET /api/cli/devlogs/2024-01-15
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "date": "2024-01-15",
    "title": "## 🗓️ 15-01-2024 – Daily Dev Log",
    "modules": { ... },
    "tags": [],
    "is_public": false,
    "template": "comprehensive",
    "created_at": "2024-01-15T08:00:00.000Z",
    "updated_at": "2024-01-15T18:30:00.000Z"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "v1"
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "error": {
    "message": "No DevLog found for date: 2024-01-15",
    "code": "NOT_FOUND"
  }
}
```

---

### 4. Create/Update DevLog

**Endpoint:** `POST /api/cli/devlogs`

**Purpose:** Create a new DevLog or update existing one for the specified date

**Body:**
```json
{
  "date": "2024-01-15",
  "title": "My Daily Log",
  "modules": {
    "goals": "- [ ] Complete feature X",
    "achieved": "- Fixed bug Y",
    "learnings": "- Learned about Z"
  },
  "tags": ["frontend", "backend"],
  "template": "comprehensive",
  "isPublic": false
}
```

**Required Fields:**
- `date` (YYYY-MM-DD)
- `modules` (object with module data)

**Optional Fields:**
- `title` (defaults to auto-generated)
- `tags` (defaults to [])
- `template` (defaults to "comprehensive")
- `isPublic` (defaults to false)

**Response (201 for create, 200 for update):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "date": "2024-01-15",
    "title": "My Daily Log",
    "modules": { ... },
    "tags": ["frontend", "backend"],
    "is_public": false,
    "template": "comprehensive",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "v1",
    "action": "created"
  }
}
```

---

### 5. Update DevLog

**Endpoint:** `PATCH /api/cli/devlogs/:date`

**Purpose:** Partially update an existing DevLog

**Path Parameters:**
- `date` (YYYY-MM-DD)

**Body (all fields optional):**
```json
{
  "title": "Updated title",
  "modules": {
    "learnings": "- New learning added"
  },
  "tags": ["new-tag"],
  "isPublic": true
}
```

**Note:** Modules are merged with existing modules, not replaced.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "date": "2024-01-15",
    "title": "Updated title",
    "modules": { ... },
    "tags": ["new-tag"],
    "is_public": true,
    "template": "comprehensive",
    "created_at": "2024-01-15T08:00:00.000Z",
    "updated_at": "2024-01-15T10:35:00.000Z"
  },
  "meta": {
    "timestamp": "2024-01-15T10:35:00.000Z",
    "version": "v1"
  }
}
```

---

### 6. Update Specific Module

**Endpoint:** `PATCH /api/cli/devlogs/:date/modules/:moduleId`

**Purpose:** Add content to a specific module (append or replace)

**Path Parameters:**
- `date` (YYYY-MM-DD)
- `moduleId` - One of: goals, achieved, problems, learnings, mood, code_snippets, meetings, resources, next_steps, challenges, accomplishments, time_tracking, tools_used, reflection, github_activity

**Body:**
```json
{
  "content": "- New learning: TypeScript generics are powerful",
  "action": "append"
}
```

**Actions:**
- `append` (default) - Add content to existing module with newline
- `replace` - Replace entire module content

**Example:**
```bash
PATCH /api/cli/devlogs/2024-01-15/modules/learnings
Body: { "content": "- Learned about React hooks", "action": "append" }
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "devLog": { ... },
    "updatedModule": {
      "moduleId": "learnings",
      "content": "- Previous learning\n- Learned about React hooks",
      "action": "append"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:40:00.000Z",
    "version": "v1"
  }
}
```

---

### 7. Delete DevLog

**Endpoint:** `DELETE /api/cli/devlogs/:date`

**Purpose:** Delete a DevLog

**Path Parameters:**
- `date` (YYYY-MM-DD)

**Example:**
```bash
DELETE /api/cli/devlogs/2024-01-15
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "DevLog deleted successfully",
    "deletedLog": { ... }
  },
  "meta": {
    "timestamp": "2024-01-15T10:45:00.000Z",
    "version": "v1"
  }
}
```

---

## CLI Usage Examples

### Example 1: Verify Authentication
```bash
curl -H "Authorization: Bearer ghp_xxxx" \
  http://localhost:3000/api/cli/auth/verify
```

### Example 2: List Recent DevLogs
```bash
curl -H "Authorization: Bearer ghp_xxxx" \
  "http://localhost:3000/api/cli/devlogs?limit=5&page=1"
```

### Example 3: Get Today's DevLog
```bash
curl -H "Authorization: Bearer ghp_xxxx" \
  http://localhost:3000/api/cli/devlogs/2024-01-15
```

### Example 4: Create DevLog
```bash
curl -X POST \
  -H "Authorization: Bearer ghp_xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "modules": {
      "goals": "- [ ] Build CLI integration",
      "achieved": "- Set up API routes"
    }
  }' \
  http://localhost:3000/api/cli/devlogs
```

### Example 5: Add to Learnings Module
```bash
curl -X PATCH \
  -H "Authorization: Bearer ghp_xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "- Learned about Next.js API routes",
    "action": "append"
  }' \
  http://localhost:3000/api/cli/devlogs/2024-01-15/modules/learnings
```

### Example 6: Update Entire DevLog
```bash
curl -X PATCH \
  -H "Authorization: Bearer ghp_xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "modules": {
      "reflection": "Great day of coding!"
    },
    "tags": ["productive"]
  }' \
  http://localhost:3000/api/cli/devlogs/2024-01-15
```

### Example 7: Delete DevLog
```bash
curl -X DELETE \
  -H "Authorization: Bearer ghp_xxxx" \
  http://localhost:3000/api/cli/devlogs/2024-01-15
```

---

## Error Codes

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| `UNAUTHORIZED` | Invalid or missing token | 401 |
| `NOT_FOUND` | DevLog not found | 404 |
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `FETCH_ERROR` | Database query failed | 500 |
| `SAVE_ERROR` | Failed to save DevLog | 500 |
| `UPDATE_ERROR` | Failed to update data | 500 |
| `DELETE_ERROR` | Failed to delete DevLog | 500 |

---

## Rate Limits

- Using authenticated requests (GitHub access token)
- Supabase has no rate limits for standard plans
- GitHub OAuth token doesn't expire unless revoked

---

## Security

### Authentication
- ✅ All routes require valid GitHub access token
- ✅ Token must exist in Supabase users table
- ✅ User can only access their own DevLogs
- ✅ Tokens are validated on every request

### Data Access
- ✅ Users can only CRUD their own DevLogs
- ✅ User ID is extracted from authenticated token
- ✅ No cross-user data access possible
- ✅ Row Level Security in Supabase (if enabled)

---

## CLI Tool Implementation Guide

### Step 1: GitHub OAuth in CLI
```javascript
// CLI handles OAuth flow
// Receives access_token from GitHub
// Stores token securely (OS keychain or encrypted file)
```

### Step 2: Make API Requests
```javascript
const token = await getStoredToken()

const response = await fetch('http://localhost:3000/api/cli/devlogs', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})

const result = await response.json()
```

### Step 3: Handle Responses
```javascript
if (result.success) {
  console.log('Data:', result.data)
} else {
  console.error('Error:', result.error.message)
}
```

---

## Common Workflows

### Workflow 1: Create Daily Log
```bash
# CLI pseudo-code
devlog create --date today
# Creates empty DevLog for today
```

### Workflow 2: Add Learning
```bash
devlog add learnings "Learned about async/await"
# Appends to today's learnings module
```

### Workflow 3: Quick Entry
```bash
devlog achieved "Fixed bug in authentication"
# Appends to today's achieved module
```

### Workflow 4: View History
```bash
devlog list --limit 7
# Shows last 7 DevLogs
```

### Workflow 5: Export Log
```bash
devlog export 2024-01-15 --format markdown
# Gets DevLog and formats as markdown
```

---

## Testing with cURL

### Test 1: Verify Token
```bash
export TOKEN="your-github-token-here"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/cli/auth/verify
```

### Test 2: Create DevLog
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "'$(date +%Y-%m-%d)'",
    "modules": {
      "goals": "- [ ] Test CLI API",
      "achieved": "- Created API routes"
    }
  }' \
  http://localhost:3000/api/cli/devlogs
```

### Test 3: Add to Module
```bash
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "- CLI API works perfectly!",
    "action": "append"
  }' \
  http://localhost:3000/api/cli/devlogs/$(date +%Y-%m-%d)/modules/learnings
```

---

## Response Standards

### Success Response Structure
```typescript
{
  success: true,
  data: T,  // The actual data
  meta: {
    timestamp: string,  // ISO 8601
    version: string,    // API version
    action?: string     // Optional action performed
  }
}
```

### Error Response Structure
```typescript
{
  success: false,
  error: {
    message: string,  // Human-readable error
    code: string      // Machine-readable code
  }
}
```

---

## Module IDs Reference

Valid module IDs for `/modules/:moduleId` endpoint:

| Module ID | Description |
|-----------|-------------|
| `goals` | Ziele für heute |
| `achieved` | Erreicht / Getan |
| `problems` | Probleme / Bugs |
| `learnings` | Erkenntnisse / Learnings |
| `mood` | Mood / Energielevel |
| `code_snippets` | Code Snippets |
| `meetings` | Meetings / Calls |
| `resources` | Ressourcen / Links |
| `next_steps` | Nächste Schritte |
| `challenges` | Herausforderungen |
| `accomplishments` | Erfolge |
| `time_tracking` | Zeiterfassung |
| `tools_used` | Tools verwendet |
| `reflection` | Reflexion |
| `github_activity` | GitHub Activity |

---

## Production Deployment

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### CORS (if needed)
Add CORS headers for CLI requests from different domains:
```typescript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type'
}
```

---

## 🎉 Ready to Use!

Your CLI tool can now:
- ✅ Authenticate users via GitHub OAuth
- ✅ List all DevLogs
- ✅ Get specific DevLog by date
- ✅ Create new DevLogs
- ✅ Update DevLogs (full or partial)
- ✅ Add to specific modules (append/replace)
- ✅ Delete DevLogs
- ✅ Verify authentication tokens

Happy coding! 🚀
