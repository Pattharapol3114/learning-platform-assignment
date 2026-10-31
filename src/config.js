// Base URL for the Team 05 API. Empty string = same origin (`/api/...`),
// which goes through the Vite dev proxy. Set VITE_API_BASE_URL for builds
// that call the API directly (the API must then allow CORS for that origin).
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// Client-side timeout for every request (ms). The Team 06 proxy itself gives
// up after 5s, so this leaves headroom for Vercel cold starts.
export const REQUEST_TIMEOUT_MS = 10000;

// FR-01 (Firebase Auth) is not wired into the frontend yet, so assignments
// are created on behalf of the same mock instructor used in Assignment 3.
export const CURRENT_INSTRUCTOR_ID = "instructor_test_01";

// An assignment counts as "due soon" inside this window.
export const DUE_SOON_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
