// Firebase configuration stub.
//
// GradeWise AI runs fully offline using localStorage (see src/lib/storage.ts).
// To enable real accounts + cloud sync across devices:
//
// 1. Create a Firebase project, enable Authentication (Email/Password) and
//    Firestore Database.
// 2. Copy your web app config into the object below (or, better, into
//    environment variables prefixed NEXT_PUBLIC_FIREBASE_*).
// 3. Re-point the functions in src/lib/storage.ts (signup, login, loadData,
//    saveData, upsertSubject, etc.) to the Firestore equivalents exported
//    from this file. The AppData / Subject / StudentProfile shapes in
//    src/lib/types.ts map directly onto the Firestore schema below.
//
// FIRESTORE SCHEMA
// -----------------
// users/{uid}
//   fullName: string
//   registerNumber: string        (unique - enforce via security rules / a
//                                   registerNumbers/{regNo} -> uid lookup doc)
//   email: string
//   memberSince: number (ms epoch)
//   lastLogin: number (ms epoch)
//   role: "student" | "admin"
//
// users/{uid}/subjects/{subjectId}
//   name, type, marks, credits, theoryCredits, practicalCredits,
//   createdAt, updatedAt   (matches Subject in src/lib/types.ts)
//
// users/{uid}/semesterHistory/{semesterId}
//   label, gpa, totalCredits, createdAt  (matches SemesterRecord)
//
// SECURITY RULES (sketch)
// -----------------------
// match /users/{uid}/{document=**} {
//   allow read, write: if request.auth.uid == uid;
//   allow read: if isAdmin(request.auth.uid) && resource.id == uid
//                  && document in ["fullName", "registerNumber", "lastLogin"];
// }
// Admins must NEVER be granted read access to the `subjects` or
// `semesterHistory` subcollections, or to marks/GPA/CGPA fields on the user
// document - this is enforced both by these rules and by only ever exposing
// getAdminUserList()-style projections in the client code.

import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

export const firebaseEnabled = Boolean(firebaseConfig.apiKey);

export const firebaseApp = firebaseEnabled
  ? getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig)
  : null;
