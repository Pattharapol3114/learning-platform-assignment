import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { firebaseApp } from "../firebaseApp";
import { setAuthTokenProvider } from "./httpClient";

const auth = getAuth(firebaseApp);

setAuthTokenProvider(() => auth.currentUser?.getIdToken() ?? null);

const toUser = (user) => (user ? { uid: user.uid, email: user.email, displayName: user.displayName } : null);

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, (user) => callback(toUser(user)));
}

export async function signInInstructor(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return toUser(user);
}

export async function registerInstructor(fullName, email, password) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: fullName });
  return toUser(user);
}

export function signOutInstructor() {
  return signOut(auth);
}
