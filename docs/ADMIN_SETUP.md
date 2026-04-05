# Admin Role Setup Guide

This guide explains how to set up and use admin roles in your application using Better Auth.

## Overview

The admin plugin has been added to your Better Auth configuration. It provides:
- Role-based access control (RBAC)
- Admin-only routes protection
- User management capabilities
- Permission checking

## Setting a User as Admin

### Option 1: Directly in MongoDB

Connect to your MongoDB database and update a user's role:

```javascript
db.user.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Option 2: Using Better Auth API (Server-Side)

Create an API route to set admin role:

```typescript
// src/app/api/admin/set-role/route.ts
import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  // This should be protected - only allow specific users or require a secret key
  const { userId, role } = await request.json();
  
  try {
    await auth.api.setRole({
      body: {
        userId,
        role,
      },
    });
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to set role' }, { status: 500 });
  }
}
```

### Option 3: Set During User Creation

Specify the role when creating a user:

```typescript
const newUser = await auth.api.createUser({
  body: {
    email: "admin@example.com",
    password: "secure-password",
    name: "Admin User",
    role: "admin", // Set as admin
  }
});
```

### Option 4: Using adminUserIds Configuration

Add specific user IDs that should always be admin:

```typescript
// src/lib/auth.ts
admin({
  defaultRole: "user",
  adminRoles: ["admin"],
  adminUserIds: ["user_id_1", "user_id_2"], // These users will always be admin
})
```

## Protecting Admin Routes

### Method 1: Page-Level Protection (Recommended)

The middleware performs a lightweight cookie check. Full role verification happens in the page:

```typescript
// src/app/admin/page.tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin content */}
    </div>
  );
}
```

**Why this approach?**
- Middleware runs on Edge runtime (fast, lightweight)
- Database queries only happen where needed (in pages/API routes)
- Better performance and edge compatibility

### Method 3: API Route Protection

Protect API endpoints:

```typescri2: Middleware Session Check

Add admin routes to the middleware for cookie-based session checking:

```typescript
// src/middleware.ts
const adminRoutes = ['/admin', '/admin/users', '/admin/settings'];
```

Note: Middleware only checks for session cookies. Full role verification must happen in the page itself (see Method 1).

### Method pt
// src/app/api/admin/users/route.ts
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user?.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Admin-only logic here
  const users = await auth.api.listUsers({
    headers: await headers(),
  });

  return Response.json(users);
}
```

## Using Admin Features

### Client-Side

```typescript
'use client';

import { authClient } from '@/lib/auth-client';

export default function AdminPanel() {
  const setUserRole = async (userId: string, role: string) => {
    const { data, error } = await authClient.admin.setRole({
      userId,
      role,
    });
    
    if (error) {
      console.error('Failed to set role:', error);
    }
  };

  const listUsers = async () => {
    const { data, error } = await authClient.admin.listUsers({
      limit: 10,
      offset: 0,
    });
    
    if (data) {
      console.log('Users:', data.users);
    }
  };

  const banUser = async (userId: string) => {
    const { data, error } = await authClient.admin.banUser({
      userId,
      banReason: "Violation of terms",
      banExpiresIn: 7 * 24 * 60 * 60, // 7 days
    });
  };

  return (
    <div>
      {/* Your admin UI */}
    </div>
  );
}
```

### Server-Side

```typescript
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// List all users
const users = await auth.api.listUsers({
  query: {
    limit: 100,
    offset: 0,
    searchValue: "john",
    searchField: "name",
  },
  headers: await headers(),
});

// Get specific user
const user = await auth.api.getUser({
  query: { id: "user-id" },
  headers: await headers(),
});

// Set user role
await auth.api.setRole({
  body: {
    userId: "user-id",
    role: "admin",
  },
  headers: await headers(),
});

// Ban user
await auth.api.banUser({
  body: {
    userId: "user-id",
    banReason: "Spamming",
    banExpiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  headers: await headers(),
});
```

## Checking Permissions in Components

```typescript
'use client';

import { authClient } from '@/lib/auth-client';
import { useEffect, useState } from 'react';

export default function ConditionalContent() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await authClient.admin.hasPermission({
        permission: {
          user: ["create", "delete"],
        },
      });
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, []);

  if (!isAdmin) {
    return <div>You don't have permission to view this content.</div>;
  }

  return <div>Admin-only content</div>;
}
```

## Database Migration

Run the migration to add the necessary fields to your database:

```bash
npx better-auth migrate
```

This adds the following fields to the `user` table:
- `role` (string) - User's role (default: "user")
- `banned` (boolean) - Whether user is banned
- `banReason` (string) - Reason for ban
- `banExpires` (date) - When ban expires

## Environment Variables

Make sure you have the following in your `.env.local`:

```env
BETTER_AUTH_URL=http://localhost:9002
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:9002
```

## Available Admin Operations

- `createUser` - Create a new user
- `listUsers` - List all users with filtering/pagination
- `getUser` - Get user by ID
- `setRole` - Set user role
- `updateUser` - Update user data
- `setUserPassword` - Change user password
- `banUser` - Ban a user
- `unbanUser` - Remove ban from user
- `listUserSessions` - List all sessions for a user
- `revokeUserSession` - Revoke a specific session
- `revokeUserSessions` - Revoke all sessions for a user
- `impersonateUser` - Admin impersonate a user
- `stopImpersonating` - Stop impersonating
- `removeUser` - Delete a user
- `hasPermission` - Check user permissions

## Next Steps

1. Run the database migration: `npx better-auth migrate`
2. Set your first user as admin using one of the methods above
3. Create admin pages in `/src/app/admin/`
4. Add admin routes to the `adminRoutes` array in middleware
5. Use the admin API to manage users

## Resources

- [Better Auth Admin Plugin Docs](https://better-auth.com/docs/plugins/admin)
- [Better Auth Documentation](https://better-auth.com/docs)
