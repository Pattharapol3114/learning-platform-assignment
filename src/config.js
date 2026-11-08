export function resolveApiBaseUrl({
  env = import.meta.env,
  location = typeof window !== "undefined" ? window.location : {},
} = {}) {
  const configuredBaseUrl = env.VITE_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, "");
  }

  if (location.origin) {
    return location.origin.replace(/\/+$/, "");
  }

  return "";
}

// Production builds set VITE_API_BASE_URL to the Vercel API. Without it (local
// development) requests stay on the current origin and go through the Vite proxy.
export const API_BASE_URL = resolveApiBaseUrl();

// Client-side timeout for every request (ms). The Team 06 proxy itself gives
// up after 5s, so this leaves headroom for Vercel cold starts.
export const REQUEST_TIMEOUT_MS = 10000;

// FR-01 (Firebase Auth) is not wired into the frontend yet, so assignments
// are created on behalf of the same mock instructor used in Assignment 3.
export const CURRENT_INSTRUCTOR_ID = "instructor_test_01";

// An assignment counts as "due soon" inside this window.
export const DUE_SOON_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
