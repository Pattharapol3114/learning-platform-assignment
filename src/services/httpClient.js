import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "../config";

export class ApiError extends Error {
  constructor(message, { status = null, kind = "http", body = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status; // HTTP status, or null for network/timeout failures
    this.kind = kind; // "http" | "network" | "timeout" | "parse" | "conflict"
    this.body = body;
  }
}

// Thin fetch wrapper: JSON in/out, per-request timeout, and one error type
// for every failure mode so UI code can branch on `kind` / `status`.
export async function request(path, { method = "GET", body, signal, timeout = REQUEST_TIMEOUT_MS } = {}) {
  const timeoutSignal = AbortSignal.timeout(timeout);
  const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const payload = isFormData ? body : body ? JSON.stringify(body) : undefined;
  const normalizedBaseUrl = (API_BASE_URL || "").replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${normalizedBaseUrl}${normalizedPath}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: isFormData ? undefined : body ? { "Content-Type": "application/json" } : undefined,
      body: payload,
      signal: combinedSignal,
    });
  } catch (err) {
    // Caller-initiated aborts (e.g. component unmount) are re-thrown as-is
    // so hooks can ignore them.
    if (signal?.aborted) throw err;
    if (timeoutSignal.aborted) {
      throw new ApiError("The server took too long to respond (timeout)", { kind: "timeout" });
    }
    throw new ApiError("Unable to connect to the server", { kind: "network" });
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (response.ok) {
        throw new ApiError("The server returned data in an unexpected format", { status: response.status, kind: "parse" });
      }
    }
  }

  if (!response.ok) {
    const message = data?.error || data?.message || `Request failed (HTTP ${response.status})`;
    throw new ApiError(message, { status: response.status, kind: "http", body: data });
  }

  return data;
}
