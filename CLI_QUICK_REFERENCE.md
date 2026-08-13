# CLI API Quick Reference

## Base URL
```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication
```http
Authorization: Bearer <github_oauth_token>
```

---

## Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/cli/auth/verify` | Verify token |
| `GET` | `/api/cli/devlogs` | List DevLogs |
| `GET` | `/api/cli/devlogs/:date` | Get specific log |
| `POST` | `/api/cli/devlogs` | Create/Update log |
| `PATCH` | `/api/cli/devlogs/:date` | Update log |
| `PATCH` | `/api/cli/devlogs/:date/modules/:moduleId` | Update module |
| `DELETE` | `/api/cli/devlogs/:date` | Delete log |

---

## Quick Examples

### Verify Token
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/cli/auth/verify
```

### List Last 10 Logs
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/cli/devlogs?limit=10"
```

### Get Today's Log
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/cli/devlogs/$(date +%Y-%m-%d)
```

### Create Log
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date":"2024-01-15","modules":{"goals":"- Test CLI"}}' \
  http://localhost:3000/api/cli/devlogs
```

### Add to Learnings
```bash
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"- New insight","action":"append"}' \
  http://localhost:3000/api/cli/devlogs/2024-01-15/modules/learnings
```

### Delete Log
```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/cli/devlogs/2024-01-15
```

---

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "ISO-8601",
    "version": "v1"
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "message": "Description",
    "code": "ERROR_CODE"
  }
}
```

---

## Valid Module IDs
`goals`, `achieved`, `problems`, `learnings`, `mood`, `code_snippets`, `meetings`, `resources`, `next_steps`, `challenges`, `accomplishments`, `time_tracking`, `tools_used`, `reflection`, `github_activity`

---

## Date Format
Always use: `YYYY-MM-DD` (e.g., `2024-01-15`)

---

## Common Error Codes
- `UNAUTHORIZED` - Invalid token
- `NOT_FOUND` - DevLog doesn't exist
- `VALIDATION_ERROR` - Invalid input
- `FETCH_ERROR` - Database error
- `UPDATE_ERROR` - Update failed

---

## CLI Implementation Hints

### Token Storage
```javascript
// Store in keychain or encrypted file
import keytar from 'keytar'
await keytar.setPassword('devlog', 'github-token', token)
const token = await keytar.getPassword('devlog', 'github-token')
```

### API Client
```javascript
class DevLogAPI {
  constructor(token) {
    this.token = token
    this.baseUrl = 'http://localhost:3000'
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    return response.json()
  }

  async listDevLogs(params = {}) {
    const query = new URLSearchParams(params)
    return this.request(`/api/cli/devlogs?${query}`)
  }

  async addToModule(date, moduleId, content) {
    return this.request(`/api/cli/devlogs/${date}/modules/${moduleId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content, action: 'append' })
    })
  }
}
```

---

## 🎯 Ready for CLI Development!

See `CLI_API_DOCUMENTATION.md` for full details.
