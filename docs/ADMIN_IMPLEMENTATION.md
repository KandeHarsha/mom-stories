# Admin Role Implementation - Summary

## ✅ What Was Done

### 1. **Added Admin Plugin to Better Auth** ([auth.ts](../src/lib/auth.ts))
   - Imported `admin` from Better Auth plugins
   - Added admin plugin with default configuration:
     - Default role: "user"
     - Admin roles: ["admin"]

### 2. **Created Better Auth Client** ([auth-client.ts](../src/lib/auth-client.ts))
   - Set up Better Auth React client with admin plugin
   - Provides hooks and methods for client-side admin operations

### 3. **Enhanced Middleware** ([middleware.ts](../src/middleware.ts))
   - Added admin route protection with cookie-based session checking
   - Lightweight edge-compatible implementation
   - Full role verification happens in the actual pages (not in middleware)
   - Redirects users without session cookies to login

### 4. **Created Documentation** ([ADMIN_SETUP.md](./ADMIN_SETUP.md))
   - Comprehensive guide on using admin features
   - Multiple methods to set users as admin
   - Examples of protecting routes and checking permissions
   - Available admin operations reference

### 5. **Created Admin Setup API** ([api/admin/setup/route.ts](../src/app/api/admin/setup/route.ts))
   - Secure endpoint to set first admin user
   - Protected by secret key
   - Should be used once and then removed or disabled

### 6. **Created Admin Dashboard** ([admin/page.tsx](../src/app/admin/page.tsx))
   - Example admin-only page
   - Shows how to check admin access server-side
   - Displays admin features and navigation

## 🚀 How to Use

### Step 1: Add Environment Variable

Add to your `.env.local`:

\`\`\`env
ADMIN_SETUP_SECRET=your-secure-random-key
\`\`\`

### Step 2: Set Your First Admin User

**Option A: Using the Setup API**

\`\`\`bash
curl -X POST http://localhost:9002/api/admin/setup \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "your-email@example.com",
    "secretKey": "your-secure-random-key"
  }'
\`\`\`

**Option B: Directly in MongoDB**

\`\`\`javascript
db.user.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
\`\`\`

**Option C: During Registration**

Modify your registration code to set role during user creation.

### Step 3: Access Admin Routes

Navigate to `/admin` after logging in with your admin account.

### Step 4: Add More Admin Routes

Add routes to the `adminRoutes` array in [middleware.ts](../src/middleware.ts):

\`\`\`typescript
const adminRoutes = ['/admin', '/admin/users', '/admin/settings'];
\`\`\`

**How Admin Routes Work:**

The implementation uses a two-layer approach:

1. **Middleware (Edge Runtime)**: Lightweight cookie-based session checking
   - Routes in `adminRoutes` require a session cookie
   - No database queries (keeps middleware fast and edge-compatible)

2. **Page-Level Protection (Node.js Runtime)**: Full role verification
   - Each admin page verifies the user's role via database query
   - Non-admin users are redirected to `/dashboard`

This approach avoids Edge runtime errors while maintaining security.

## 🔒 Security Notes

1. **Delete or Disable Setup Route**: After setting your first admin, remove or disable the setup route
2. **Protect Admin Operations**: Always verify admin role before performing admin operations
3. **Use Environment Variables**: Never hardcode admin credentials or secret keys
4. **Audit Admin Actions**: Consider logging all admin operations

## 📚 Available Admin Operations

### Client-Side
- `authClient.admin.setRole()` - Set user role
- `authClient.admin.listUsers()` - List all users
- `authClient.admin.getUser()` - Get user details
- `authClient.admin.banUser()` - Ban a user
- `authClient.admin.unbanUser()` - Unban a user
- `authClient.admin.hasPermission()` - Check permissions

### Server-Side
- `auth.api.setRole()` - Set user role
- `auth.api.listUsers()` - List all users
- `auth.api.getUser()` - Get user details
- `auth.api.createUser()` - Create new user
- `auth.api.updateUser()` - Update user
- `auth.api.banUser()` - Ban a user
- `auth.api.removeUser()` - Delete user

## 🔧 Database Schema

The admin plugin adds these fields to the `user` table:
- `role` (string) - User's role (default: "user")
- `banned` (boolean) - Whether user is banned
- `banReason` (string) - Reason for ban
- `banExpires` (date) - When ban expires

## 📖 Further Reading

- [Complete Admin Setup Guide](./ADMIN_SETUP.md)
- [Better Auth Admin Plugin Documentation](https://better-auth.com/docs/plugins/admin)
- [Better Auth Documentation](https://better-auth.com/docs)

## 🐛 Troubleshooting

**Issue**: Edge runtime error about 'dns' module
- **Symptom**: `Error: The edge runtime does not support Node.js 'dns' module`
- **Solution**: This is by design. The middleware runs on Edge runtime and only checks session cookies. Full role verification happens in the pages themselves (which run on Node.js runtime).

**Issue**: Migration command not working
- **Solution**: The admin plugin fields will be added automatically when you first use them. Better Auth uses automatic schema migration.

**Issue**: Cannot access admin routes
- **Solution**: Make sure you've set your user's role to "admin" in the database

**Issue**: Session not found in middleware
- **Solution**: Ensure Better Auth is properly configured and cookies are being set. Check for cookie names: `better-auth.session_token` or `session`

## ✨ Next Steps

1. Set your first admin user
2. Create admin UI pages for user management
3. Add custom admin operations as needed
4. Implement audit logging for admin actions
5. Consider adding custom roles and permissions for fine-grained access control
