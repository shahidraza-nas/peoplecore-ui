/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = ["/", "/features", "/pricing", "/faq", "/about", "/privacy", "/terms"];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to DEFAULT_LOGIN_REDIRECT
 * @type {string[]}
 */
export const authRoutes = ["/login", "/register"];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

/**
 * An array of protected routes that require authentication
 * Routes under (authenticated) group are automatically protected
 * @type {string[]}
 */
export const protectedRoutes = [
  "/dashboard",
  "/chat",
  "/employees",
  "/profile",
  "/settings",
];
