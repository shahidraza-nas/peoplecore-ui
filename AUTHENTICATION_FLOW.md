# 📚 **COMPLETE LOGIN FLOW DOCUMENTATION - PeopleCore UI**

## **Table of Contents**
1. Overview & Architecture
2. File Structure & Purpose
3. Step-by-Step Login Flow (Normal Login)
4. Step-by-Step 2FA Flow
5. Session Management
6. Token Refresh Flow
7. Route Protection
8. Type System
9. Error Handling
10. Key Concepts to Remember

---

## **1. OVERVIEW & ARCHITECTURE**

### **Authentication Strategy**
- **Library**: NextAuth.js v5 (Auth.js)
- **Strategy**: JWT (JSON Web Token) - Stateless authentication
- **Session Storage**: Encrypted JWT stored in HTTP-only cookies
- **Token Lifetime**: 30 days
- **2FA Support**: Email-based OTP (4 digits)

### **Key Components**
```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐     ┌──────────────────┐
│  LoginForm (UI) │────→│  Server Actions  │
└─────────────────┘     └────────┬─────────┘
                                 │
                                 ↓
                        ┌─────────────────┐
                        │   auth.ts       │
                        │  (NextAuth)     │
                        └────────┬────────┘
                                 │
                                 ↓
                        ┌─────────────────┐
                        │  Backend API    │
                        │  (auth/local)   │
                        └─────────────────┘
```

---

## **2. FILE STRUCTURE & PURPOSE**

### **📁 Authentication Files**

| File | Purpose | Type |
|------|---------|------|
| `components/auth/login-form.tsx` | UI component for login & 2FA | Client Component |
| `actions/auth.action.ts` | Server-side authentication logic | Server Action |
| `auth.ts` | NextAuth configuration | Server Config |
| `middleware.ts` | Route protection & redirect logic | Middleware |
| `schemas/login-schema.ts` | Input validation schema (Zod) | Schema |
| `lib/utils.ts` | Session data transformer | Utility |
| `types/next-auth.d.ts` | TypeScript type definitions | Type Definitions |
| `lib/fetch.ts` | API client with auth headers | API Client |
| `lib/routes.ts` | Route configuration | Config |

---

## **3. STEP-BY-STEP LOGIN FLOW (Normal Login)**

### **STEP 1: User Visits Login Page** 
**File**: `app/login/page.tsx`
```
User navigates to /login
↓
Next.js renders LoginPage component
↓
LoginPage renders LoginForm component with max-width constraint
```

**What Happens:**
- Page shows a card with email/password inputs
- Form validation rules are set up via Zod schema

---

### **STEP 2: User Enters Credentials**
**File**: `components/auth/login-form.tsx` (lines 40-47)

```tsx
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<z.infer<typeof LoginSchema>>({
  resolver: zodResolver(LoginSchema),
});
```

**What Happens:**
- `react-hook-form` manages form state
- `zodResolver` validates input against `LoginSchema`
- User types email & password
- Real-time validation shows errors if:
  - Email format is invalid
  - Password < 6 or > 32 characters

---

### **STEP 3: Form Submission**
**File**: `components/auth/login-form.tsx` (lines 49-76)

```tsx
const onLogin = async (values: z.infer<typeof LoginSchema>) => {
  setLoading(true);
  const { error, data } = await login({
    email: values.email,
    password: values.password,
  });
  // ... error handling
}
```

**What Happens:**
1. Form data passes Zod validation
2. `onLogin` function called
3. Loading state set to `true` (disables button)
4. Calls server action `login()` with credentials
5. Shows loading toast notification

---

### **STEP 4: Server Action Processing**
**File**: `actions/auth.action.ts` (lines 8-68)

```tsx
export async function login(data, callbackUrl?) {
  // 1. Validate input again (server-side)
  const validatedFields = LoginSchema.safeParse(data);
  
  // 2. Call NextAuth signIn
  const resp = await signIn("credentials", {
    email,
    password,
    redirect: false,  // Don't auto-redirect
  });
  
  // 3. Handle errors
  // 4. Return result to client
}
```

**What Happens:**
1. **Server-side validation**: Re-validates with Zod (security!)
2. **Calls NextAuth**: Invokes `signIn()` function
3. **redirect: false**: Prevents automatic redirect (we handle it manually)
4. **Error handling**: Catches 2FA requirements, invalid credentials, etc.
5. **Returns object**: `{ data, error }` back to client

**Security Note**: Always validate on server even if client validates!

---

### **STEP 5: NextAuth Provider Execution**
**File**: `auth.ts` (lines 48-92)

```typescript
Credentials({
  name: "Sign In",
  authorize: async (credentials) => {
    // 1. Validate with Zod
    const { email, password } = await LoginSchema.parseAsync(credentials);
    
    // 2. Call backend API
    const { data, error, message } = await API.Login({
      username: email,
      password,
      info: { device: "web" },
    });
    
    // 3. Check for 2FA requirement
    if (data?.otp) {
      throw new Error("2FARequired:" + data.session_id);
    }
    
    // 4. Return user with tokens
    return getSessionProps({
      ...data.user,
      accessToken: data.token,
      refreshToken: data.refresh_token,
      tokenExpiry: data.token_expiry,
    });
  },
})
```

**What Happens:**

#### **5a. Validation**
- Zod re-validates credentials (triple validation!)
- If invalid, throws error

#### **5b. API Call**
- `API.Login()` sends POST to backend
- Endpoint: `http://localhost:3000/auth/local`
- Body: `{ username, password, info: { device: "web" } }`
- Backend checks credentials against database

#### **5c. Backend Response Scenarios**

**Scenario A: Success (No 2FA)**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "User",
    "permissions": ["read", "write"]
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_expiry": "2025-12-14T12:00:00Z"
}
```

**Scenario B: 2FA Required**
```json
{
  "otp": true,
  "session_id": "abc123-xyz456-session-id"
}
```

**Scenario C: Error**
```json
{
  "error": true,
  "message": "Invalid credentials"
}
```

#### **5d. Token Handling**
```typescript
const userWithTokens = {
  ...data.user,           // User info from backend
  accessToken: data.token,
  refreshToken: data.refresh_token,
  tokenExpiry: data.token_expiry,
};

return getSessionProps(userWithTokens);
```

**`getSessionProps` Function** (`lib/utils.ts`):
```typescript
export const getSessionProps = (user: any) => {
  return {
    id: user.id,
    profile_image: user.profile_image,
    role: user.role,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    emailVerified: null,
    permissions: user.permissions,
    accessToken: user.accessToken,
    refreshToken: user.refreshToken,
    tokenExpiry: user.tokenExpiry,
    keyLogin: user.keyLogin,
    admin: user.admin,
  };
};
```

**Purpose**: Transforms backend user data into NextAuth session format

---

### **STEP 6: JWT Callback**
**File**: `auth.ts` (lines 159-191)

```typescript
async jwt(params) {
  const { token, user, account } = params;
  
  // On first login (user object exists)
  if (account && user) {
    return {
      ...token,
      user: getSessionProps(user as SessionUser),
    };
  }
  
  // On subsequent requests (check token expiry)
  if (tokenUser?.tokenExpiry && new Date() < new Date(tokenUser.tokenExpiry)) {
    return token;  // Token still valid
  }
  
  // Token expired, refresh it
  return refreshAccessToken(token);
}
```

**What Happens:**
1. **First Login**: Stores user data in JWT token
2. **Subsequent Requests**: Checks if token expired
3. **If Expired**: Calls `refreshAccessToken()`
4. **Token Structure**:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "accessToken": "...",
    "refreshToken": "...",
    "tokenExpiry": "2025-12-14T12:00:00Z"
  },
  "iat": 1699999999,
  "exp": 1702591999
}
```

---

### **STEP 7: Session Callback**
**File**: `auth.ts` (lines 150-158)

```typescript
async session({ session, token }) {
  if (token && token.user) {
    session.user = getSessionProps(token.user as SessionUser);
    session.error = token.error;
  }
  return session;
}
```

**What Happens:**
1. Takes JWT token data
2. Transforms it into session object
3. Session object accessible via `useSession()` hook
4. **Session Structure**:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "User",
    "permissions": ["read", "write"],
    "accessToken": "...",
    "profile_image": "https://..."
  },
  "expires": "2025-12-14T12:00:00Z"
}
```

---

### **STEP 8: Response to Client**
**File**: `components/login-form.tsx` (lines 61-73)

```tsx
if (error) {
  if (error.startsWith("2FARequired:")) {
    // Extract session ID and show OTP screen
    const extractedSessionId = error.split(":")[1];
    setSessionId(extractedSessionId);
    setRequiresOtp(true);
    toast.success("OTP sent to your email");
  } else {
    toast.error(error);
  }
} else {
  router.push("/dashboard");
  toast.success("Logged in successfully");
}
```

**What Happens:**
- **Success**: Redirect to `/dashboard`
- **2FA Required**: Show OTP form
- **Error**: Display error message

---

### **STEP 9: Cookie Storage**
**Automatic by NextAuth**

```
Cookie Name: next-auth.session-token (production)
            __Secure-next-auth.session-token (HTTPS)
            
Properties:
- HttpOnly: true (JavaScript can't access)
- Secure: true (HTTPS only in production)
- SameSite: lax
- Path: /
- Max-Age: 2592000 (30 days)

Value: Encrypted JWT token
```

**Security Features:**
- ✅ HttpOnly prevents XSS attacks
- ✅ Encrypted payload
- ✅ Signed to prevent tampering
- ✅ Auto-expires after 30 days

---

### **STEP 10: Dashboard Access**
**File**: `middleware.ts`

```typescript
export default auth(async (request) => {
  const isLoggedIn = !!request.auth;
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  
  if (!isLoggedIn && !isPublicRoute) {
    // Redirect to login with callback URL
    return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }
  
  return NextResponse.next();  // Allow access
});
```

**What Happens:**
1. Middleware runs on **every request**
2. Checks if route requires authentication
3. Verifies session cookie exists and is valid
4. **Allows access** if authenticated
5. **Redirects to /login** if not authenticated

---

## **4. STEP-BY-STEP 2FA FLOW**

### **When 2FA is Required**

Backend returns:
```json
{
  "otp": true,
  "session_id": "temp-session-id-12345"
}
```

---

### **2FA STEP 1: Show OTP Form**
**File**: `components/login-form.tsx` (lines 104-143)

```tsx
if (requiresOtp) {
  return (
    <Card>
      <CardTitle>Two-Factor Authentication</CardTitle>
      <Input
        placeholder="Enter 4-digit OTP"
        maxLength={4}
        value={otpCode}
        onChange={(e) => setOtpCode(e.target.value)}
      />
      <Button onClick={onVerifyOtp}>Verify OTP</Button>
    </Card>
  );
}
```

**What Happens:**
- Form switches to OTP input
- User receives OTP via email from backend
- User enters 4-digit code
- Submit button disabled until 4 digits entered

---

### **2FA STEP 2: OTP Submission**
**File**: `components/login-form.tsx` (lines 78-102)

```tsx
const onVerifyOtp = async (e: React.FormEvent) => {
  if (!sessionId || otpCode.length !== 4) return;
  
  const { error } = await verify2Fa(otpCode, sessionId);
  
  if (error) {
    toast.error(error);
  } else {
    router.push("/dashboard");
    toast.success("Logged in successfully");
  }
};
```

---

### **2FA STEP 3: Server Action**
**File**: `actions/auth.action.ts` (lines 70-100)

```tsx
export async function verify2Fa(code: string, sessionId: string) {
  const resp = await signIn("email-verify", {
    session_id: sessionId,
    otp: code,
    redirect: false,
  });
  
  return { data: resp, error };
}
```

**What Happens:**
- Calls different NextAuth provider: `"email-verify"`
- Passes session ID (from step 1) and OTP code

---

### **2FA STEP 4: Email-Verify Provider**
**File**: `auth.ts` (lines 94-125)

```typescript
Credentials({
  id: "email-verify",
  authorize: async (credentials) => {
    const { data, error, message } = await API.Post(
      "auth/otp/verify",
      {
        ...credentials,  // session_id, otp
        info: {},
      }
    );
    
    if (!!error) {
      throw new InvalidOtpError(`:${message}$`);
    }
    
    const userWithTokens = {
      ...data!.user,
      accessToken: data!.token,
      refreshToken: data!.refresh_token,
      tokenExpiry: data!.token_expiry,
    };
    
    return getSessionProps(userWithTokens);
  },
})
```

**What Happens:**
1. Calls backend: `POST /auth/otp/verify`
2. Backend validates OTP against session ID
3. If valid: Returns full user data + tokens
4. If invalid: Throws error
5. Rest of flow identical to normal login (JWT callback, session callback, etc.)

---

## **5. SESSION MANAGEMENT**

### **Accessing Session in Components**

#### **Client Components**
```tsx
"use client";
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Not logged in</div>;
  
  return (
    <div>
      <p>Hello, {session.user.full_name}</p>
      <p>Email: {session.user.email}</p>
      <p>Role: {session.user.role}</p>
    </div>
  );
}
```

#### **Server Components**
```tsx
import { auth } from "@/auth";

async function MyServerComponent() {
  const session = await auth();
  
  if (!session) return <div>Not logged in</div>;
  
  return <div>Hello, {session.user.full_name}</div>;
}
```

#### **Server Actions**
```tsx
"use server";
import { auth } from "@/auth";

export async function myAction() {
  const session = await auth();
  
  if (!session) throw new Error("Unauthorized");
  
  // Use session.user.accessToken for API calls
  const token = session.user.accessToken;
}
```

---

### **Making Authenticated API Calls**
**File**: `lib/fetch.ts` (lines 38-50)

```typescript
export const getHttpOption = async (options: HttpOptions): Promise<Headers> => {
  const headers = new Headers();
  
  if (!isMultipart) headers.set("Content-Type", "application/json");
  
  if (secured) {
    const session =
      typeof window === "undefined" ? await auth() : await getSession();
    
    if (session?.user) {
      headers.set("Authorization", `Bearer ${session.user.accessToken}`);
    }
  }
  
  return headers;
};
```

**What Happens:**
1. **Server-side** (typeof window === "undefined"): Uses `auth()` from NextAuth
2. **Client-side**: Uses `getSession()` from next-auth/react
3. Extracts `accessToken` from session
4. Adds to Authorization header: `Bearer eyJhbGciOiJI...`

**Example API Call:**
```typescript
// Automatically adds auth header
const { data, error } = await API.Get("user/profile");

// Disable auth for public endpoints
const { data, error } = await API.Post(
  "auth/forgot-password",
  { email },
  undefined,
  { secured: false }  // No auth header
);
```

---

## **6. TOKEN REFRESH FLOW**

### **Why Token Refresh?**
- Access tokens expire after ~1 hour (configured by backend)
- Refresh tokens last longer (~30 days)
- Allows maintaining session without re-login

---

### **Automatic Refresh on Every Request**
**File**: `auth.ts` (lines 175-191)

```typescript
async jwt(params) {
  const tokenUser = token.user as SessionUser;
  
  // Check if token expired
  if (tokenUser?.tokenExpiry && new Date() < new Date(tokenUser.tokenExpiry)) {
    return token;  // Still valid, return as-is
  }
  
  // Token expired, refresh it
  return refreshAccessToken(token);
}
```

**What Happens:**
1. On **every request**, JWT callback runs
2. Compares current time vs `tokenExpiry`
3. If expired: Calls `refreshAccessToken()`

---

### **Refresh Token Function**
**File**: `auth.ts` (lines 200-230)

```typescript
const refreshAccessToken = async (token: JWT) => {
  try {
    const tokenUser = token.user as SessionUser;
    
    const { data, error } = await API.Post(
      "auth/token",
      {
        token: tokenUser.accessToken,
        refresh_token: tokenUser.refreshToken,
      },
      undefined,
      { secured: false }  // Don't use expired token
    );
    
    if (error || !data) {
      throw new Error("Something went wrong!");
    }
    
    // Update token with new access token
    return {
      ...token,
      user: {
        ...getSessionProps(tokenUser),
        accessToken: data.token,
        tokenExpiry: data.token_expiry,
      },
    };
  } catch {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
};
```

**What Happens:**
1. Calls backend: `POST /auth/token`
2. Sends old `accessToken` + `refreshToken`
3. Backend validates refresh token
4. Backend issues new `accessToken` with new expiry
5. Updates JWT token with new values
6. **Refresh token stays the same** (reused until it expires)

---

### **Handling Refresh Failures**
**File**: `auth.ts` (lines 151-157)

```typescript
async session({ session, token }) {
  session.user = getSessionProps(token.user);
  session.error = token.error;
  
  if (token.error === "RefreshAccessTokenError") {
    return { ...session, error: "RefreshAccessTokenError" };
  }
  
  return session;
}
```

**What Happens:**
- If refresh fails, `error` added to session
- Client can detect this and force logout:

```tsx
const { data: session } = useSession();

if (session?.error === "RefreshAccessTokenError") {
  signOut();  // Force user to re-login
}
```

---

## **7. ROUTE PROTECTION**

### **Three Layers of Protection**

#### **Layer 1: Middleware (Global)**
**File**: `middleware.ts`

```typescript
export default auth(async (request) => {
  const isLoggedIn = !!request.auth;
  
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }
  
  return NextResponse.next();
});
```

**Runs on:**
- Every single request
- Before page renders

**What it checks:**
```typescript
publicRoutes = ["/", "/features", "/pricing", "/faq", "/about", "/privacy", "/terms"];
authRoutes = ["/login", "/register"];
protectedRoutes = ["/dashboard", "/chat", "/employees", "/profile", "/settings"];
```

**Behavior:**
- ✅ **Public routes**: Anyone can access
- 🔐 **Auth routes** (/login, /register): Redirect to dashboard if already logged in
- 🔒 **Protected routes**: Redirect to login if not authenticated

---

#### **Layer 2: Authorized Callback (NextAuth)**
**File**: `auth.ts` (lines 143-149)

```typescript
callbacks: {
  authorized({ auth, request: { nextUrl } }) {
    const isLoggedIn = !!auth?.user;
    const isOnProtected = ["/dashboard", "/chat", "/profile", "/settings", "/employees"].some(
      path => nextUrl.pathname.startsWith(path)
    );
    
    if (isOnProtected && !isLoggedIn) {
      return false;  // Block access
    }
    
    return true;  // Allow access
  },
}
```

**Difference from Middleware:**
- More granular control
- Runs as part of NextAuth
- Can check session properties (role, permissions)

---

#### **Layer 3: Component-Level Protection**

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";

async function ProtectedPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }
  
  // Check permissions
  if (!session.user.permissions.includes("admin")) {
    redirect("/unauthorized");
  }
  
  return <div>Admin Content</div>;
}
```

---

## **8. TYPE SYSTEM**

### **Type Hierarchy**
```
User (models/user.ts)
  └─> Picked fields
      └─> Token properties added
          └─> SessionUserWithToken
              └─> KeyLogin added
                  └─> SessionUser (final type)
```

---

### **Type Definitions**
**File**: `types/next-auth.d.ts`

```typescript
// Base token properties
export interface Token {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: string;
}

// User + Token combined
export type SessionUserWithToken = Token &
  Pick<UserMe, "id" | "profile_image" | "role" | "full_name" | "email" | "phone" | "permissions"> & {
    emailVerified: null;
  };

// Admin impersonation support
export type KeyLogin = {
  keyLogin?: boolean;
  admin?: SessionUserWithToken;
};

// Final session user type
export type SessionUser = SessionUserWithToken & KeyLogin;
```

**Usage:**
```typescript
import { SessionUser } from "next-auth";

function getUserName(user: SessionUser): string {
  return user.full_name;
}

// TypeScript autocomplete works:
user.full_name ✅
user.email ✅
user.accessToken ✅
user.permissions ✅
user.keyLogin ✅ (optional)
```

---

### **JWT Token Type**
```typescript
interface JWT extends DefaultJWT {
  full_name?: string | null;
  email?: string | null;
  picture?: string | null;
  sub?: string;
  user: User;  // Full user object
}
```

---

### **Session Type**
```typescript
export interface Session {
  expires: ISODateString;
  user: SessionUser;
  error?: any;  // For handling refresh errors
}
```

---

## **9. ERROR HANDLING**

### **Custom Error Classes**
**File**: `auth.ts` (lines 8-16)

```typescript
class InvalidCredentialError extends CredentialsSignin {
  code = "credential_error";
}

class AccountInactiveError extends CredentialsSignin {
  code = "account_inactive";
}

class InvalidOtpError extends CredentialsSignin {
  code = "otp_error";
}
```

**Purpose:**
- Distinguish between error types
- Provide specific error messages
- Easier error handling in UI

---

### **Error Flow**

#### **1. Backend Returns Error**
```json
{
  "error": true,
  "message": "Invalid email or password"
}
```

#### **2. NextAuth Throws Error**
```typescript
if (!!error) {
  throw new InvalidCredentialError(message);
}
```

#### **3. Server Action Catches Error**
```typescript
export async function login(data) {
  try {
    const resp = await signIn("credentials", { ... });
  } catch (error) {
    if (error instanceof AuthError) {
      const cause = (error as any).cause;
      if (cause?.err?.message) {
        return { error: cause.err.message };
      }
    }
    
    return { error: "Invalid email or password" };
  }
}
```

#### **4. UI Displays Error**
```tsx
if (error) {
  if (error.startsWith("2FARequired:")) {
    // Handle 2FA
  } else {
    toast.error(error);  // Show error message
  }
}
```

---

### **Error Codes & Messages**

| Error Code | Cause | User Message |
|------------|-------|--------------|
| `credential_error` | Wrong email/password | "Invalid email or password" |
| `account_inactive` | Account disabled | "Account is inactive" |
| `otp_error` | Wrong OTP code | "Invalid OTP code" |
| `2FARequired:session_id` | 2FA enabled | "OTP sent to your email" |
| `RefreshAccessTokenError` | Refresh token expired | Forces logout |

---

## **10. KEY CONCEPTS TO REMEMBER**

### **1. Triple Validation Pattern**
```
Client-side (Zod) → Server Action (Zod) → NextAuth Provider (Zod)
```
**Why?** Each layer can be bypassed individually, defense in depth!

---

### **2. Token vs Session vs Cookie**

| Concept | What It Is | Where It Lives |
|---------|-----------|----------------|
| **JWT Token** | Encrypted user data | Browser cookie (httpOnly) |
| **Session** | Decrypted user data | Memory (per request) |
| **Access Token** | Backend auth token | Inside JWT token |
| **Refresh Token** | Long-lived token | Inside JWT token |

**Flow:**
```
Cookie → JWT Decoded → Session Object → session.user.accessToken → API Call
```

---

### **3. redirect: false Pattern**
```typescript
await signIn("credentials", {
  email,
  password,
  redirect: false,  // ← Important!
});
```

**Why?**
- Default behavior: Auto-redirects on success
- We want manual control (check for 2FA, show custom messages, etc.)

---

### **4. Server vs Client Session Access**

```typescript
// SERVER (app router, server actions, middleware)
import { auth } from "@/auth";
const session = await auth();

// CLIENT (useEffect, event handlers, client components)
import { useSession } from "next-auth/react";
const { data: session } = useSession();
```

**Never mix them!** Use `auth()` on server, `useSession()` on client.

---

### **5. Session Update Pattern**
```tsx
import { useSession } from "next-auth/react";

const { data: session, update } = useSession();

// Update session data (e.g., after profile change)
await update({
  ...session,
  user: {
    ...session.user,
    full_name: "New Name",
    profile_image: "new-url.jpg",
  },
});
```

**Triggers:**
- Re-runs JWT callback with `trigger: "update"`
- Updates session in memory
- Re-renders components using session

---

### **6. Logout Pattern**
```tsx
import { signOut } from "next-auth/react";

// Client-side logout
await signOut({ callbackUrl: "/login" });

// Server-side logout
"use server";
import { signOut } from "@/auth";
await signOut();
```

**What happens:**
1. Deletes session cookie
2. Redirects to login page
3. All protected routes become inaccessible

---

### **7. Callback URL Pattern**
```
User tries to access: /employees/123
↓
Not authenticated, redirect to:
/login?callbackUrl=%2Femployees%2F123
↓
After login, redirect to:
/employees/123
```

**Implementation:**
```typescript
// Middleware
const callbackUrl = nextUrl.pathname;
return Response.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl));

// After login
const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
router.push(callbackUrl);
```

---

### **8. Permission Checking**
```tsx
const session = await auth();

// Check single permission
if (!session.user.permissions.includes("users:write")) {
  return <div>Access Denied</div>;
}

// Check role
if (session.user.role !== "Admin") {
  redirect("/unauthorized");
}

// Check multiple permissions
const hasAccess = ["users:read", "users:write"].every(
  perm => session.user.permissions.includes(perm)
);
```

---

### **9. KeyLogin Feature (Admin Impersonation)**
```tsx
// Admin logs in as another user
const session = await update({
  ...targetUser,
  keyLogin: true,
  admin: session.user,  // Store original admin session
});

// Check if currently impersonating
if (session.user.keyLogin) {
  console.log("Logged in as:", session.user.full_name);
  console.log("Original admin:", session.user.admin.full_name);
}

// Stop impersonating
await update({
  ...session.user.admin,
  keyLogin: false,
  admin: undefined,
});
```

---

### **10. Debug Mode**
```typescript
// auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: process.env.NEXT_AUTH_DEBUG === "Y",  // Enable verbose logging
});
```

**Enable in `.env.local`:**
```
NEXT_AUTH_DEBUG=Y
```

**Shows in console:**
- Every callback execution
- JWT token contents
- Session updates
- API calls
- Error stack traces

---

## **SUMMARY DIAGRAM**

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LOGIN FLOW SUMMARY                          │
└─────────────────────────────────────────────────────────────────────┘

1. USER ENTERS CREDENTIALS
   └─> LoginForm (Zod validation)

2. FORM SUBMITTED
   └─> Server Action: login()
       └─> Validates with Zod (server-side)
       └─> Calls NextAuth signIn("credentials")

3. NEXTAUTH PROVIDER
   └─> Credentials Provider: authorize()
       └─> Validates with Zod (triple check!)
       └─> API.Login() → Backend API
       └─> Backend returns: user + tokens OR 2FA required
       
4. IF 2FA REQUIRED:
   └─> Show OTP form
   └─> Submit OTP
   └─> Server Action: verify2Fa()
   └─> NextAuth signIn("email-verify")
   └─> API.Post("auth/otp/verify")
   └─> Backend validates OTP

5. JWT CALLBACK
   └─> Stores user + tokens in JWT
   └─> Checks token expiry
   └─> Refreshes if expired

6. SESSION CALLBACK
   └─> Converts JWT → Session object
   └─> Available via useSession() / auth()

7. COOKIE STORED
   └─> HttpOnly, Secure, Encrypted
   └─> Auto-sent with every request

8. MIDDLEWARE PROTECTION
   └─> Checks session on every request
   └─> Redirects if unauthorized

9. API CALLS
   └─> getHttpOption() adds Bearer token
   └─> Backend validates token
   └─> Returns data

10. TOKEN REFRESH (Automatic)
    └─> JWT callback checks expiry
    └─> Calls refreshAccessToken()
    └─> Updates session transparently
```

---

## **TESTING CHECKLIST**

### **Test Normal Login**
- [ ] Valid credentials → Success
- [ ] Invalid email format → Validation error
- [ ] Short password → Validation error
- [ ] Wrong credentials → "Invalid email or password"
- [ ] Inactive account → "Account is inactive"

### **Test 2FA Flow**
- [ ] 2FA enabled user → OTP form shown
- [ ] Valid OTP → Success
- [ ] Invalid OTP → Error message
- [ ] Back button → Returns to login form

### **Test Session**
- [ ] Access protected route → Shows content
- [ ] Logout → Redirects to login
- [ ] Session expires → Redirects to login
- [ ] Token refresh works → No re-login needed

### **Test Route Protection**
- [ ] Public routes accessible without login
- [ ] Protected routes redirect to login
- [ ] Callback URL preserved after redirect
- [ ] Login page redirects to dashboard if already logged in

### **Test API Calls**
- [ ] Authenticated calls have Bearer token
- [ ] Token refresh happens automatically
- [ ] 401 errors handled gracefully
- [ ] Logout on refresh failure

---

## **COMMON ISSUES & SOLUTIONS**

| Issue | Cause | Solution |
|-------|-------|----------|
| "Cannot find module './schemas'" | TypeScript cache | Restart TS server |
| 401 on API calls | Wrong token path | `session.user.accessToken` not `session.accessToken` |
| Auto-logout after login | Middleware too aggressive | Check `publicRoutes` and `authRoutes` |
| Session not updating | Cache issue | Use `update()` from useSession |
| 2FA not triggering | Backend not returning `otp: true` | Check backend response format |
| Infinite redirect loop | Middleware config wrong | Check matcher in middleware config |

---

**End of Documentation** 🎉
