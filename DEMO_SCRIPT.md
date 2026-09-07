# DOST Academy LMS — Live Demonstration Script
### Team 59 (AstraLink) | IFN735 Industry Project
### Duration: 20–25 minutes | All data below verified against seed + source code

---

## PRE-DEMO CHECKLIST (15 min before audience arrives)

- [ ] `start-all.bat` run — backend on http://localhost:8000, frontend on http://localhost:3000
- [ ] Fresh database: run `RESET_DB.bat` once, so all seed data is pristine
- [ ] Browser open at http://localhost:3000, zoom 100%, cache cleared
- [ ] This script open on a second screen or printed
- [ ] Log in once as each role to confirm data loads, then log out

### Test Accounts (seeded, password = `password` for all)

| Role | Name | Email | Department |
|---|---|---|---|
| Admin | Admin User | admin@dost.gov.ph | Administration |
| Employee | James Carter | james@dost.gov.ph | IT Department |
| Employee | Maria Santos | maria@dost.gov.ph | IT Department |
| Employee | Robert Cruz | robert@dost.gov.ph | Mechanical Engineering |
| Employee | Anna Reyes | anna@dost.gov.ph | IT Department |

### Seed snapshot (what you WILL see on screen)

- 4 curriculums: IT Department, Mechanical Engineering, Civil Engineering, Electrical Engineering
- 11 courses (4 IT, 3 Mechanical, 2 Civil, 2 Electrical)
- James: enrolled in IT curriculum, progress Cybersecurity 75% / Cloud 52% / Database 60%, 1 certificate `DOST-CERT-001A`
- Robert: enrolled in Mechanical, Thermodynamics 90%
- 4 assignments: Cybersecurity Awareness Quiz (pending), Cloud Deployment Report (in_progress), Database Design Assignment (pending), Thermodynamics Problem Set (pending)

### ⚠️ Presenter warnings (read once)

1. **NEVER click "View Course"** on a course card — `/course-details` is a placeholder page ("Select a course from the Courses page"). Skip it entirely.
2. **Enroll is per-curriculum, not per-course.** The "Enroll Now" button sits on the curriculum section header.
3. If you delete a user mid-demo, use **Anna Reyes** — James/Maria/Robert are needed for the rest of the demo.
4. If you create a demo course, name it clearly (e.g. `DEMO - Data Analytics`) so you can point at it.

---

## PART 1 — INTRODUCTION (2 min)

**Say:**
> "Good [morning/afternoon]. I'm presenting the DOST Academy System — a centralized Learning Management System for the Department of Science and Technology. It replaces scattered spreadsheets and file stores with one platform for training, assessment, and progress tracking."
>
> "Two roles: **Employees** who learn, and **Administrators** who run the platform. Stack: **React** frontend, **Laravel** REST API backend, **SQLite/MySQL** database — per the requested tech stack."
>
> "I'll do the full employee journey first, then the admin side. Everything you see is live database reads and writes — no mock data."

---

## PART 2 — LOGIN (2 min)

### Step 1: Login page → `http://localhost:3000/`

**Do:**
1. Show the page: DOST logo, "DOST Academy System / Centralized Learning Management System"
2. Point at the two tabs: **Login** and **Signup**
3. On Login tab: email + password fields, Remember checkbox, Forgot Password link

**Say:**
> "This is the entry point. Login and Signup are tabs on one screen. Login uses email and password with server-side validation — wrong credentials get a 401 and an inline error, which I'll show in a moment. That covers user stories US1 and US2."

### Step 2 (optional, 30 sec): show the Signup tab

**Do:**
1. Click the **Signup** tab — Full Name / Email / Password fields
2. Click back to **Login** (do NOT create an account — it would pollute the user table)

**Say:**
> "New staff can self-register here — it POSTs to the API and creates a real employee account. I won't submit one now to keep the demo data clean."

---

## PART 3 — EMPLOYEE JOURNEY (8 min)

### Step 3: Log in as James Carter

**Do:**
1. Enter `james@dost.gov.ph` / `password`, click **Login**
2. You land on **Home** (`/user-home`)

**Say:**
> "I'm now James Carter from the IT Department. The system reads my role from the JWT and routes me to the learner area — that's role-based access control, US4. An admin logging in with the same screen lands somewhere completely different, which you'll see later."

### Step 4: Home — hero, curriculums, recommendations

**Do:**
1. Point at the auto-rotating hero carousel + About panel ("Learn, track, and grow…")
2. Scroll to **Available Curriculums** — 4 cards (IT, Mechanical, Civil, Electrical), each showing category, level, course count
3. Scroll to **Recommended For You** — skill-gap based suggestions
4. Click a curriculum card → it goes to `/courses`

**Say:**
> "Home gives the big picture: a hero banner, all four department curriculums with live course counts, and personalised recommendations computed from James's skill progress — US6 and US7. Every card here came from the API, not hardcoded HTML."

### Step 5: Courses page — search + enroll (`/courses`)

**Do:**
1. Point at the **"Search curriculums…"** box in the header
2. Type `cloud` — list filters (server-side query, fires per keystroke)
3. Clear the search to restore the full list
4. Scroll to a curriculum James is NOT enrolled in (e.g. Mechanical Engineering) — click **Enroll Now**
5. Button flips to **"✓ Enrolled"** in green
6. ⚠️ Do NOT click "View Course" (placeholder page)

**Say:**
> "Search hits the API on every keystroke and filters server-side — try it with 'cloud', 'mechanical', anything. Enrollment is per-curriculum: one click writes a real row to the enrollments table, the button flips to Enrolled, and enrolling twice is rejected by backend validation. Duplicate-enrollment prevention, US6 acceptance criteria."

### Step 6: Dashboard — personal analytics (`/dashboard`)

**Do:**
1. Click **Dashboard** in nav
2. Read out the stat cards: enrolled count, completed count, certificate count, average progress
3. Point at James's course progress bars: **Cybersecurity 75%, Cloud 52%, Database 60%**
4. Show skills panel (mirrors the same percentages), recommendations, notifications

**Say:**
> "This is the personal analytics hub — US15. Five API calls build this one screen: stats, enrollments, skills, recommendations, notifications. James's numbers — 75, 52, 60 — are his real progress rows in the database. Skills mirror course progress, and recommendations are generated from skill gaps."

### Step 7: Assignments — submit work (`/assignments`)

**Do:**
1. Show the list: Cybersecurity Awareness Quiz (pending), Cloud Deployment Report (in_progress), Database Design Assignment (pending)
2. Point at the colour-coded status badges
3. Click **Submit** on "Cybersecurity Awareness Quiz" (only `pending` items have the button)
4. Badge flips to submitted — refresh to prove it persisted

**Say:**
> "All of James's work with clear status badges — US10. Submit writes to the submissions table with user ID, assignment ID, and timestamp. Refresh the page — it stays submitted, because it's a real database write, not UI state."

### Step 8: Certificates (`/certificates`)

**Do:**
1. Show James's certificate card: **Cybersecurity Fundamentals**, Certificate No: **DOST-CERT-001A**, Issued: **2026-03-12**

**Say:**
> "Earned certificates with unique numbers and issue dates — US11. These are issued by admins on course completion, which I'll demonstrate from the admin side."

### Step 9: Edit Profile → logout (`/edit-profile`)

**Do:**
1. My Profile ▾ → **Edit Profile**
2. Change the **bio** field, Save, show the updated value
3. My Profile ▾ → **Logout** → lands back on `/`

**Say:**
> "Staff keep their own details correct via a validated PUT — US3. Logout clears the JWT and returns to the login screen. Employee journey done — now the admin side."

---

## PART 4 — ADMIN JOURNEY (10 min)

### Step 10: Log in as admin

**Do:**
1. Enter `admin@dost.gov.ph` / `password`, click **Login**
2. You land on **Admin Dashboard** (`/admin-dashboard`) — completely different screen

**Say:**
> "Same login screen, totally different world. Role-based routing again — and this isn't just hidden UI: the backend AdminOnly middleware returns 403 if an employee token hits any of these endpoints. I verified that with API tests."

### Step 11: Admin Dashboard — system overview

**Do:**
1. Read the stat cards: total employees (5), total courses (11), assignments (4), certificates
2. Point at quick links to all management pages

**Say:**
> "System overview — US17. All totals are computed live by aggregating across tables, so the numbers move as I add or delete things in the next steps. Watch the course count after I create one."

### Step 12: Manage Users (`/manage-users`)

**Do:**
1. Show the table: 5 users with name, email, role, department
2. Click **Delete** on **Anna Reyes** → confirm → row disappears
3. Refresh — she stays deleted

**Say:**
> "User administration — US5. I deleted Anna deliberately: James, Maria, and Robert are load-bearing for this demo. Delete cascades to that user's enrollments, progress, submissions, and certificates, so no orphan rows."

### Step 13: Manage Courses (`/manage-courses`)

**Do:**
1. Show the table with status badges (draft / pending / approved / published)
2. If a pending course exists, click **Approve** and show the badge change
3. Click **Create New Course** (or Create Course), fill in:
   - Curriculum: **IT Department** (Select Curriculum dropdown)
   - Title: `DEMO - Data Analytics`
   - Description: `Intro to data analytics for DOST staff`
   - Department: `IT` — point out this field, it's straight from the design schema
   - Duration: `4 weeks`, Level: `Beginner`
4. Submit → new row appears with draft/pending status
5. Go back to Admin Dashboard — course count went up

**Say:**
> "Course management with an approval workflow — US8. New courses start unpublished; only approved/published ones reach employees. Note the department field — straight from the design document. And the dashboard total just ticked up, proving it's live aggregation."

### Step 14: Manage Assignments (`/manage-assignments`)

**Do:**
1. Show the table: title, course, due date, status
2. Add one: Course **Cybersecurity Fundamentals**, Title `Demo Quiz - Week 1`, Description `Complete the introductory quiz`, due date = next month
3. Submit → appears in the list

**Say:**
> "Assignment administration — US12. What I just created is immediately visible to every enrolled employee on their assignments page — same table, two roles, consistent data."

### Step 15: Manage Certificates (`/manage-certificates`)

**Do:**
1. Show the table: employee, course, certificate number, issued date — point at `DOST-CERT-001A`
2. Explain the flow: issue on course completion → unique number generated → employee notified

**Say:**
> "Certificate issuance and tracking — US13. Unique numbers, issue dates, and the employee gets a notification that surfaces on their dashboard. James's DOST-CERT-001A is the one we saw on the employee side."

### Step 16: Progress Reports (`/progress-reports`)

**Do:**
1. Show the org-wide table: employee, department, curriculum, average progress bar, enrollment status, certificate status
2. Point at James (~62% average across 75/52/60), Robert (90% Thermodynamics), Maria (30%)
3. Point at the colour coding: green = completed/issued, blue = in progress, amber = pending

**Say:**
> "The analytics layer — US16, and the money slide for leadership. One view joins users, enrollments, progress, and certificates: who's on track, which departments need support. James at ~62, Robert at 90 on Thermodynamics, Maria just starting at 30. This is what replaces the spreadsheet reporting."

---

## PART 5 — TECHNICAL DEEP-DIVE (3 min, only if asked)

**Say:**
> "Three tiers: React SPA → Laravel REST API over JSON → SQLite for zero-config demo, MySQL-ready via .env. 46 API routes."
>
> "Auth is JWT: login returns a token, the axios interceptor attaches it to every request, 401 auto-logs-out. Two middleware gates: Authenticate for logged-in users, AdminOnly for admins — 403s verified."
>
> "Database: 10 migrations matching the design doc — users, curriculums, courses with department field, enrollments, progress, skills, assignments, submissions with graded results, certificates, notifications."
>
> "Quality: all 15 pages fetch live API data, zero mock arrays. Server-side validation throughout — duplicate enrollments rejected, unique certificate numbers enforced."

**If asked "what's not done":**
> "Three items were explicitly marked Planned in the user stories: content upload for videos/documents (US9), in-app quizzes with auto-grading (US14), and live sync with DOST's existing LMS (US18–19). The submissions table and grading API already exist as the quiz foundation, and the REST structure is ready for LMS integration once DOST provides API access."

---

## PART 6 — CLOSE (1 min)

**Say:**
> "Recap: employees get a personalised hub — browse curriculums, enroll, track progress, submit work, earn certificates. Admins get full control — users, course approval, assignments, certificates, and org-wide analytics."
>
> "Everything you saw was live database reads and writes. Accounts: admin@dost.gov.ph and james@dost.gov.ph, password is 'password' for both."
>
> "Thank you — happy to take questions."

---

## TROUBLESHOOTING (if something breaks live)

| Problem | Fix (say it calmly, do it fast) |
|---|---|
| Backend terminal shows errors | `start-all.bat` already ran migrate + seed; worst case run `RESET_DB.bat` in a new terminal |
| Login fails for everyone | DB was wiped — run `RESET_DB.bat`, wait 10 sec, retry |
| Counts look wrong after my create/delete demos | That's the point — they're live. Narrate the change |
| Frontend shows Network Error | Backend window closed — re-run `start-all.bat`, wait for both windows |
| Accidentally clicked "View Course" | Smile: "That details view is still being finished — the Courses page itself is the finished surface" → click Back to Courses |
| Deleted the wrong user | Finish the demo with remaining accounts; `RESET_DB.bat` restores everything afterwards |
| Port 8000/3000 already in use | Close old terminal windows, re-run `start-all.bat` |
