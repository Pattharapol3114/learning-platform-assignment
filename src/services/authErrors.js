const AUTH_MESSAGES = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/email-already-in-use": "An account with this email already exists. Try signing in instead.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Unable to connect. Check your internet connection and try again.",
  "auth/operation-not-allowed": "Email sign-in isn't enabled for this project yet.",
  "auth/configuration-not-found": "Email sign-in isn't enabled for this project yet.",
};

export function authErrorMessage(err) {
  return AUTH_MESSAGES[err?.code] ?? "Something went wrong. Please try again.";
}
