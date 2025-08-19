# Custom Authentication System with AuthProvider & AuthGuard

This document outlines the complete custom authentication system that replaces Clerk authentication with a backend API-based solution, including AuthProvider and AuthGuard for route protection.

## Overview

The authentication system now uses:

- **Custom backend API** at `localhost:8000/api/user/auth` for user authentication
- **AuthProvider** for global authentication state management
- **AuthGuard** for protecting routes that require authentication
- **localStorage** for persistent token and user data storage

## Architecture

### 1. AuthProvider (`src/components/auth/AuthProvider.tsx`)

- **Global state management** for authentication
- **Context API** for sharing auth state across components
- **Automatic token validation** from localStorage
- **Automatic redirects** after login/signup/logout
- **Cross-tab synchronization** for logout events

### 2. AuthGuard (`src/components/auth/AuthGuard.tsx`)

- **Route protection** for authenticated routes
- **Automatic redirects** for unauthorized users
- **Loading states** during authentication checks
- **PublicRoute** for login/signup pages

### 3. AuthService (`src/utils/authService.ts`)

- **API communication** with backend
- **Token management** in localStorage
- **User data persistence**
- **Error handling** for network issues

## API Endpoints

### Login

- **URL**: `POST localhost:8000/api/user/auth/login`
- **Request Body**:
  ```json
  {
    "identifier": "user@example.com",
    "password": "password123"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "jwt_token_here",
    "user_id": "user_id_here",
    "data": {
      "id": "user_id_here",
      "email": "user@example.com",
      "ic_number": "123456789",
      "name": "User Name",
      "registration_status": "active"
    }
  }
  ```

### Signup

- **URL**: `POST localhost:8000/api/user/auth/signup`
- **Request Body**:
  ```json
  {
    "ic_number": "123456789",
    "password": "password123",
    "phone": "+1234567890",
    "email": "user@example.com"
  }
  ```
- **Success Response**: Same as login response
- **Error Response**:
  ```json
  {
    "success": false,
    "message": "User with this IC number already has an account"
  }
  ```

## Components

### AuthProvider

```typescript
import { AuthProvider, useAuthContext } from "./components/auth/AuthProvider";

// Wrap your app
const App = () => (
  <AuthProvider>
    <YourAppContent />
  </AuthProvider>
);

// Use in components
const MyComponent = () => {
  const { isAuthenticated, user, login, logout, error } = useAuthContext();
  // ...
};
```

### AuthGuard

```typescript
import { AuthGuard, PublicRoute } from './components/auth/AuthGuard';

// Protected route
<AuthGuard
  component={ProtectedComponent}
  path="/protected"
  fallbackPath="/login"
/>

// Public route (redirects if authenticated)
<PublicRoute
  component={LoginComponent}
  path="/login"
  fallbackPath="/dashboard"
/>
```

## Usage Examples

### 1. Basic Authentication Flow

```typescript
import { useAuthContext } from "./components/auth/AuthProvider";

const LoginComponent = () => {
  const { login, error, loading } = useAuthContext();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // AuthProvider automatically redirects to /manager on success
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return <form onSubmit={handleLogin}>{/* form fields */}</form>;
};
```

### 2. Protected Component

```typescript
import { useAuthContext } from "./components/auth/AuthProvider";

const Dashboard = () => {
  const { user, logout } = useAuthContext();

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### 3. Route Protection

```typescript
// In your router
<AuthGuard component={Dashboard} path="/dashboard" fallbackPath="/login" />
```

## Authentication Flow

### 1. **App Initialization**

- AuthProvider checks localStorage for existing token and user data
- If valid data exists, user is automatically authenticated
- If no valid data, user is redirected to login

### 2. **Login Process**

- User submits login form
- AuthService calls backend API
- On success: token and user data stored in localStorage
- AuthProvider updates global state
- User redirected to `/manager` (main page)

### 3. **Signup Process**

- User submits signup form
- AuthService calls backend API
- On success: token and user data stored in localStorage
- AuthProvider updates global state
- User redirected to `/manager` (main page)

### 4. **Route Protection**

- AuthGuard checks authentication status for protected routes
- If authenticated: renders component
- If not authenticated: redirects to fallback path

### 5. **Logout Process**

- User clicks logout
- AuthService clears localStorage
- AuthProvider updates global state
- User redirected to `/` (login page)

## localStorage Structure

```javascript
// Token storage
localStorage.setItem("auth_token", "jwt_token_here");

// User data storage
localStorage.setItem(
  "user_data",
  JSON.stringify({
    id: "user_id",
    email: "user@example.com",
    ic_number: "123456789",
    name: "User Name",
    registration_status: "active",
  })
);
```

## Error Handling

The system includes comprehensive error handling:

- **Network errors**: Connection issues with backend
- **Authentication errors**: Invalid credentials
- **Server errors**: Backend API errors
- **Token validation**: Expired or invalid tokens

## Security Features

- **JWT token-based authentication**
- **Secure token storage** in localStorage
- **Automatic token validation**
- **Cross-tab logout synchronization**
- **Route protection** with automatic redirects
- **User session persistence**

## Migration from Clerk

### Removed Dependencies

- `@clerk/clerk-react`
- All Clerk-related components and hooks

### Updated Files

- `src/app.tsx`: Now uses AuthProvider wrapper
- `src/router/index.tsx`: Uses AuthGuard for route protection
- `src/components/dialogs/userPanelDialog/component.tsx`: Uses new auth context
- `src/components/dialogs/actionDialog/component.tsx`: Uses user data from context

### New Files

- `src/components/auth/AuthProvider.tsx`: Global auth state management
- `src/components/auth/AuthGuard.tsx`: Route protection
- `src/utils/authService.ts`: Backend API communication
- `src/components/auth/`: Authentication components
  - `AuthContainer.tsx`
  - `LoginForm.tsx`
  - `SignupForm.tsx`
  - `index.tsx`

## Environment Configuration

Make sure your backend API is running at `localhost:8000` or update the `API_BASE_URL` in `src/utils/authService.ts`.

## Testing

To test the authentication system:

1. **Start your backend server** at `localhost:8000`
2. **Run the React application**
3. **Test login flow**:
   - Navigate to `/`
   - Enter valid credentials
   - Should redirect to `/manager`
4. **Test signup flow**:
   - Navigate to `/`
   - Switch to signup form
   - Enter new user data
   - Should redirect to `/manager`
5. **Test route protection**:
   - Try accessing `/manager/profile` without authentication
   - Should redirect to `/`
6. **Test logout**:
   - Click logout in user panel
   - Should redirect to `/`

## Key Benefits

- ✅ **No external dependencies**: Complete custom solution
- ✅ **Full control**: Custom authentication flow
- ✅ **Route protection**: Automatic redirects for unauthorized access
- ✅ **Persistent sessions**: Token and user data stored in localStorage
- ✅ **Cross-tab sync**: Logout events synchronized across tabs
- ✅ **TypeScript support**: Full type safety
- ✅ **Error handling**: Comprehensive error management
- ✅ **Loading states**: Proper loading indicators
- ✅ **Automatic redirects**: Seamless user experience

## Notes

- The system automatically handles token storage and retrieval
- User data is cached in localStorage for better performance
- All authentication state is managed through React Context
- Route protection is automatic for all `/manager/*` routes
- The system is designed to be easily extensible for additional features
- Cross-tab logout ensures security across multiple browser tabs
