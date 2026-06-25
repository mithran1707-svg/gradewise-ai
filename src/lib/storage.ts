import { AppData, SemesterRecord, StudentProfile, Subject } from "./types";

const DATA_PREFIX = "gradewise:data:";
const SESSION_KEY = "gradewise:session";
const USERS_KEY = "gradewise:users";
const GUEST_UID = "guest";

const isBrowser = () => typeof window !== "undefined";

const emptyData = (): AppData => ({ profile: null, subjects: [], semesterHistory: [] });

// ---------------- Session ----------------

export interface SessionUser {
  uid: string;
  isGuest: boolean;
}

export function getSession(): SessionUser | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as SessionUser) : null;
}

export function setSession(session: SessionUser | null) {
  if (!isBrowser()) return;
  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

// ---------------- Local "users" table ----------------
// NOTE: This is a lightweight stand-in for Firebase Authentication + Firestore
// so the app is fully usable offline / without API keys. Swap the functions in
// this file for Firestore reads/writes to enable real cloud sync (see
// src/lib/firebase.ts for the configuration stub and schema notes).

interface LocalUserRecord {
  uid: string;
  fullName: string;
  registerNumber: string;
  email: string;
  passwordHash: string;
  createdAt: number;
  lastLogin: number;
}

const hashPassword = (password: string): string => {
  // Simple non-cryptographic hash for local-only demo accounts.
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return `h${hash}`;
};

export function getUsers(): LocalUserRecord[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as LocalUserRecord[]) : [];
}

function saveUsers(users: LocalUserRecord[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export interface SignupInput {
  fullName: string;
  registerNumber: string;
  email: string;
  password: string;
}

export type AuthError =
  | "REGISTER_NUMBER_TAKEN"
  | "EMAIL_TAKEN"
  | "WEAK_PASSWORD"
  | "NOT_FOUND"
  | "WRONG_PASSWORD";

export function signup(input: SignupInput): { ok: true; uid: string } | { ok: false; error: AuthError } {
  const users = getUsers();
  const regLower = input.registerNumber.trim().toLowerCase();
  const adminReg = (process.env.NEXT_PUBLIC_ADMIN_REGISTER ?? "ADMIN").toLowerCase();
  if (regLower === adminReg) {
    return { ok: false, error: "REGISTER_NUMBER_TAKEN" };
  }
  const emailLower = input.email.trim().toLowerCase();

  if (users.some((u) => u.registerNumber.toLowerCase() === regLower)) {
    return { ok: false, error: "REGISTER_NUMBER_TAKEN" };
  }
  if (users.some((u) => u.email.toLowerCase() === emailLower)) {
    return { ok: false, error: "EMAIL_TAKEN" };
  }
  if (
    input.password.length < 8 ||
    !/[A-Z]/.test(input.password) ||
    !/[0-9]/.test(input.password)
  ) {
    return { ok: false, error: "WEAK_PASSWORD" };
  }

  const uid = `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = Date.now();
  users.push({
    uid,
    fullName: input.fullName.trim(),
    registerNumber: input.registerNumber.trim(),
    email: input.email.trim(),
    passwordHash: hashPassword(input.password),
    createdAt: now,
    lastLogin: now,
  });
  saveUsers(users);

  const profile: StudentProfile = {
    uid,
    fullName: input.fullName.trim(),
    registerNumber: input.registerNumber.trim(),
    email: input.email.trim(),
    memberSince: now,
    lastLogin: now,
    isGuest: false,
  };
  saveData(uid, { profile, subjects: [], semesterHistory: [] });
  setSession({ uid, isGuest: false });
  return { ok: true, uid };
}

export function login(
  identifier: string,
  password: string
): { ok: true; uid: string } | { ok: false; error: AuthError } {
  const users = getUsers();
  const idLower = identifier.trim().toLowerCase();
  const user = users.find(
    (u) => u.registerNumber.toLowerCase() === idLower || u.email.toLowerCase() === idLower
  );
  if (!user) return { ok: false, error: "NOT_FOUND" };
  if (user.passwordHash !== hashPassword(password)) return { ok: false, error: "WRONG_PASSWORD" };

  user.lastLogin = Date.now();
  saveUsers(users);

  const data = loadData(user.uid);
  if (data.profile) {
    data.profile.lastLogin = user.lastLogin;
    saveData(user.uid, data);
  }
  setSession({ uid: user.uid, isGuest: false });
  return { ok: true, uid: user.uid };
}

export function startGuestSession() {
  setSession({ uid: GUEST_UID, isGuest: true });
  if (!loadDataRaw(GUEST_UID)) {
    const now = Date.now();
    const profile: StudentProfile = {
      uid: GUEST_UID,
      fullName: "Guest Student",
      registerNumber: "GUEST",
      email: "",
      memberSince: now,
      lastLogin: now,
      isGuest: true,
    };
    saveData(GUEST_UID, { profile, subjects: [], semesterHistory: [] });
  }
}

export function logout() {
  setSession(null);
}

/** All registered users with only the fields an admin is permitted to view. */
export function getAdminUserList(): { fullName: string; registerNumber: string; lastLogin: number; createdAt: number }[] {
  return getUsers().map((u) => ({
    fullName: u.fullName,
    registerNumber: u.registerNumber,
    lastLogin: u.lastLogin,
    createdAt: u.createdAt,
  }));
}

// ---------------- App data (subjects, GPA, history) ----------------

function loadDataRaw(uid: string): AppData | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(DATA_PREFIX + uid);
  return raw ? (JSON.parse(raw) as AppData) : null;
}

export function loadData(uid: string): AppData {
  return loadDataRaw(uid) ?? emptyData();
}

export function saveData(uid: string, data: AppData) {
  if (!isBrowser()) return;
  window.localStorage.setItem(DATA_PREFIX + uid, JSON.stringify(data));
}

export function upsertSubject(uid: string, subject: Subject) {
  const data = loadData(uid);
  const idx = data.subjects.findIndex((s) => s.id === subject.id);
  if (idx >= 0) data.subjects[idx] = subject;
  else data.subjects.push(subject);
  saveData(uid, data);
}

export function deleteSubject(uid: string, subjectId: string) {
  const data = loadData(uid);
  data.subjects = data.subjects.filter((s) => s.id !== subjectId);
  saveData(uid, data);
}

export function addSemesterRecord(uid: string, record: SemesterRecord) {
  const data = loadData(uid);
  data.semesterHistory.push(record);
  saveData(uid, data);
}

export function newSubjectId(): string {
  return `subj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Contact Messages ─────────────────────────────────────────────────────────
const CONTACT_KEY = "gradewise:contact";

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  createdAt: number;
}

export function saveContactMessage(msg: ContactMessage): void {
  const existing = getContactMessages();
  existing.push(msg);
  localStorage.setItem(CONTACT_KEY, JSON.stringify(existing));
}

export function getContactMessages(): ContactMessage[] {
  try {
    return JSON.parse(localStorage.getItem(CONTACT_KEY) ?? "[]");
  } catch {
    return [];
  }
}
