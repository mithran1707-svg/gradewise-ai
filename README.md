# GradeWise AI

A complete academic management app for college students — Internal Mark Calculator, Grade Predictor, GPA & CGPA Tracker, Credit Tracker, and Semester Dashboard.

## ✨ Features

- **Landing page** — Login / Signup / Guest mode with confirmation prompt
- **Authentication** — Register with unique reg number + email, password validation (8 chars, uppercase, number)
- **Auto-save** — Every mark change saves instantly with "✓ Changes saved" indicator
- **Subjects** — Add any subject type: Theory, Practical, T-1 P-1 through T-3 P-2
- **Mark calculator** — Exact university formulas for CIA, SA, IAPR, ML, Activity marks
- **Grade predictor** — Slide end-semester mark to instantly see Final mark + Grade
- **Grade requirement calculator** — "Need X% for Grade S/A+/A/B+/B/C+/C"
- **GPA Calculator** — Manual entry or load from your subjects
- **CGPA Calculator** — Track across all semesters
- **Semester Dashboard** — GPA trend bar chart, grade distribution pie, performance radar, subject table
- **Lock semesters** — Archive current semester GPA into history for CGPA tracking
- **PDF Export** — Full semester report with subject table, grades, GPA, CGPA
- **Dark/Light mode** — Persists across sessions
- **Admin panel** — User list (name, reg no, last login only — academic data never shown)
- **Privacy** — Marks, GPA, CGPA never visible to admins (by design + documented Firestore rules)
- **Mobile-first** — Bottom nav, responsive grid, glassmorphism cards

## 🧮 Grade Scale

| Mark | Grade | Points |
|------|-------|--------|
| 91–100 | S | 10 |
| 81–90 | A+ | 9 |
| 71–80 | A | 8 |
| 66–70 | B+ | 7 |
| 61–65 | B | 6.5 |
| 56–60 | C+ | 6 |
| 50–55 | C | 5 |
| < 50 | U | 0 |

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Guest mode** works immediately — no account needed. Data is stored in localStorage.

## 🔥 Firebase / Cloud Sync (Optional)

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password) and **Firestore Database**
3. Create `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Re-point the functions in `src/lib/storage.ts` to Firestore. See `src/lib/firebase.ts` for full schema + security rule guidance.

## 🌐 Deploy to Vercel

```bash
npx vercel
```

Set the Firebase env vars in Vercel project settings.

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Login
│   ├── signup/page.tsx       # Signup with validation
│   ├── dashboard/page.tsx    # Home dashboard (KPIs, recent activity)
│   ├── subjects/
│   │   ├── page.tsx          # Subject cards grid
│   │   ├── add/page.tsx      # 4-step add wizard
│   │   └── [id]/page.tsx     # Subject detail: edit marks + predictor
│   ├── semester/page.tsx     # Semester dashboard + charts + export
│   ├── gpa/page.tsx          # Standalone GPA/CGPA calculator
│   ├── profile/page.tsx      # Profile, history, sign out
│   └── admin/page.tsx        # Admin user list (no academic data)
├── components/
│   ├── AppShell.tsx          # Top bar + mobile bottom nav
│   ├── GradeRing.tsx         # Radial gauge with tick marks (signature element)
│   ├── ThemeToggle.tsx       # Dark/light toggle
│   └── ui.tsx                # GlassCard, Button, Badge, Input
└── lib/
    ├── types.ts              # All domain types + grade scale + weightages
    ├── calculations.ts       # Theory/Practical/TCP formulas, GPA, CGPA, requirements
    ├── storage.ts            # localStorage auth + data (Firebase-ready swap)
    ├── firebase.ts           # Firebase config stub + Firestore schema notes
    ├── pdfExport.ts          # jsPDF semester report generator
    ├── useSession.ts         # Session hook with redirect
    └── useAutoSave.ts        # Debounced auto-save + SaveIndicator
```
