import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { registerInstructor, signInInstructor, signOutInstructor, subscribeToAuth } from "../services/authService";
import { profileApi } from "../services/api";

const AuthContext = createContext(null);

// Keeps the name partner teams see up to date. Best effort: a failure here
// must never stop the instructor from using the app.
function syncProfile(user) {
  if (user?.displayName) profileApi.save(user.displayName).catch(() => {});
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: true });

  useEffect(
    () =>
      subscribeToAuth((user) => {
        setState({ user, loading: false });
        syncProfile(user);
      }),
    [],
  );

  const signIn = useCallback((email, password) => signInInstructor(email, password), []);

  const signUp = useCallback(async (fullName, email, password) => {
    const user = await registerInstructor(fullName, email, password);
    // The auth listener fires before the display name is set, so update again here.
    setState({ user, loading: false });
    syncProfile(user);
  }, []);

  const value = useMemo(() => ({ ...state, signIn, signUp, signOut: signOutInstructor }), [state, signIn, signUp]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
