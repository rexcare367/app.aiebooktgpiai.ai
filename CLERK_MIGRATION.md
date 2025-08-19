# Migration from AWS Amplify to Clerk Authentication

This document outlines the changes made to migrate from AWS Amplify authentication to Clerk authentication.

## Changes Made

### 1. Dependencies Removed

- `@aws-amplify/ui-react`
- `@aws-sdk/client-cognito-identity`
- `@aws-sdk/client-polly`
- `@aws-sdk/client-s3`
- `@aws-sdk/credential-provider-cognito-identity`
- `aws-amplify`
- `aws-sdk`

### 2. Dependencies Added

- `@clerk/clerk-react` (already present)

### 3. Files Removed

- `src/aws-exports.ts`
- `src/utils/serviceUtils/awsPollyUtil.tsx`
- `src/components/AuthProvider/index.js`
- `src/components/customAuthenticator/index.tsx`
- `src/pages/authentication/signin.tsx`
- `src/pages/authentication/signup.tsx`
- `src/pages/authentication/auth.tsx`
- `src/pages/authentication/signin.css`

### 4. Files Modified

#### `src/app.tsx`

- Replaced AWS Amplify authentication with Clerk's `useUser` hook
- Added proper loading states and sign-in UI
- Simplified authentication flow

#### `src/hooks/useAuth.tsx`

- Completely rewritten to use Clerk's authentication
- Removed AWS SDK configuration
- Updated all authentication methods to work with Clerk

#### `src/index.tsx`

- Already had ClerkProvider setup
- No changes needed

#### `main.js`

- Removed AWS S3 upload/download handlers
- Cleaned up AWS-related code

#### `package.json`

- Removed all AWS-related dependencies
- Kept Clerk dependency

#### `.gitignore`

- Removed AWS Amplify related entries

#### `src/pages/pdfReader/component.tsx`

- Updated to use Clerk authentication
- Replaced `getCurrentUser()` calls with `useCurrentUserId()`
- Added `userId` prop to interface

#### `src/pages/pdfReader/interface.tsx`

- Added `userId?: string` to ViewerProps interface

#### `src/pages/htmlReader/component.tsx`

- Updated to use Clerk authentication
- Replaced `getCurrentUser()` calls with `useCurrentUserId()`
- Added `userId` prop usage

#### `src/components/popups/popupOption/component.tsx`

- Updated to use Clerk authentication
- Replaced `getCurrentUser()` calls

#### `src/components/popups/popupNote/component.tsx`

- Updated to use Clerk authentication
- Replaced `getCurrentUser()` calls

### 5. New Files Created

#### `src/utils/authUtils.ts`

- Created utility hooks for accessing Clerk user data
- Provides `useCurrentUserId`, `useCurrentUserEmail`, `useCurrentUserName`, and `useCurrentUser` hooks

## Environment Variables

Make sure to set the following environment variable:

```
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## Usage

### Getting User Data

Instead of using AWS Amplify's `getCurrentUser()`, use the new utility hooks:

```typescript
import { useCurrentUserId, useCurrentUserEmail, useCurrentUserName } from "../utils/authUtils";

// In your component
const userId = useCurrentUserId();
const userEmail = useCurrentUserEmail();
const userName = useCurrentUserName();
```

### Authentication State

The `useAuth` hook now provides Clerk-based authentication:

```typescript
import { useAuth } from "../hooks/useAuth";

const { isAuthenticated, user, signOut } = useAuth();
```

## Remaining Files to Update

The following files still need to be updated to remove AWS Amplify dependencies:

1. `src/containers/profilePage/readingProgress/readingProgress.tsx`
2. `src/containers/profilePage/profileInformation/profileInformation.tsx`
3. `src/components/dialogs/actionDialog/component.tsx`
4. `src/containers/lists/noteList/component.tsx`
5. `src/containers/lists/digestList/component.tsx`
6. `src/containers/lists/bookList/component.tsx`
7. `src/components/dialogs/ebookChatbotDialog/ebookChatbotWidget.tsx`

### Update Pattern for Remaining Files

For each file, replace:

```typescript
import { getCurrentUser } from "@aws-amplify/auth";
```

With:

```typescript
import { useCurrentUserId } from "../../../utils/authUtils";
```

And replace:

```typescript
const { username } = await getCurrentUser();
```

With:

```typescript
const userId = useCurrentUserId();
const username = userId;
```

## Notes

1. All AWS Amplify authentication has been replaced with Clerk
2. The authentication flow is now handled by Clerk's UI components
3. User data access has been standardized through utility hooks
4. AWS S3 functionality has been removed from the main process
5. The app now uses a simpler, more modern authentication system

## Next Steps

1. Update the remaining components that still use AWS Amplify imports (listed above)
2. Test the authentication flow thoroughly
3. Update any API calls that depend on AWS Cognito user IDs
4. Consider implementing Clerk's user management features if needed
5. Update any components that use AWS DynamoDB to use alternative data storage solutions
