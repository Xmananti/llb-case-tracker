/**
 * Maps Firebase Auth error codes to human-readable messages for the UI.
 */
export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  const message = error instanceof Error ? error.message : String(error);

  // Map known Firebase Auth codes to friendly messages
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again.";
    case "auth/requires-recent-login":
      return "Please sign in again to continue.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled.";
    default:
      // If message looks like raw Firebase error, show a generic message
      if (message.includes("auth/") && message.includes("Firebase")) {
        return "Something went wrong. Please try again.";
      }
      return message || "Something went wrong. Please try again.";
  }
}
