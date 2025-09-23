# Change Password API

## Endpoint
`POST /api/auth/change-password`

## Authentication
Requires valid access token in Authorization header:
```
Authorization: Bearer <access_token>
```

## Request Body
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

## Response

### Success (200)
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Validation Errors (400)
```json
{
  "success": false,
  "message": "New password and confirm password do not match"
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Invalid access token"
}
```

## Validation Rules
- All password fields are required
- New password must be at least 6 characters long
- New password must be different from current password
- New password and confirm password must match
- Current password must be correct

## Usage Example
```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "currentPassword": "currentPass123",
    "newPassword": "newSecurePass456", 
    "confirmPassword": "newSecurePass456"
  }'
```