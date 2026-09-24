# DOST Academy LMS — End-to-End Manual Demonstration Flow Script

**Department of Science and Technology (DOST) Enterprise Learning Management System**  
*Release: Client Deliverable 2026-10-18 | High-Resolution Fluid Layout & Institutional Executive Theme*

---

## 📌 Executive Summary of Applied Enhancements

1. **True Edge-to-Edge Fluid Layout**: Removed all hardcoded `1600px` container limits. Navigation bars, executive banners, interactive metric grids, and CRUD studios now expand to utilize 100% of widescreen displays (1080p, 1440p, 2K, 4K) without empty margins.
2. **Elevated DOST Institutional Visual Hierarchy**:
   - Signature **DOST Executive Gradient Banner** (`linear-gradient(135deg, #0B1F5E, #17337B, #1E3A8A, #2563EB)`) with electric cyan accents (`#38BDF8`).
   - High-contrast, enlarged KPI Metric Cards (`38px` bold typography) with top accent border lines (`borderTop: 4px solid ...`) and dedicated color-themed circular icon badges.
   - Comprehensive **6-Card Quick Controls Grid** spanning all administrative domains (Faculty, Curricula, Course Studio, Assessments, Certificates, Progress Telemetry).
3. **Full In-Browser CRUD Operational Flexibility**: Complete direct browser-level control over Agency Branches, Courses, Syllabus Lessons, Faculty/Trainees, Assessments/Quizzes, and Certificates without code modifications.

---

## 🔑 Demo Accounts Reference Directory

All seeded institutional accounts are pre-configured with the default password: **`password`**

| Role / Function | Account Name | Email Address | Password | Primary Scope & Access |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | DOST Executive Director | `admin@dost.gov.ph` | `password` | Universal platform oversight, 1-click workspace switcher, full CRUD |
| **Admin - Functional** | HR Director Elena Roxas | `hr.admin@dost.gov.ph` | `password` | Learning curricula, course oversight, faculty assignments, executive analytics |
| **Admin - Technical** | IT Systems Head Marco Diaz | `it.admin@dost.gov.ph` | `password` | IT telemetry, security, user role permissions, audit & integration logs |
| **Faculty Mentor (ASTI)** | Dr. Franz de Leon | `mentor.asti@dost.gov.ph` | `password` | Course syllabus authoring, student approval, grading submissions |
| **Faculty Mentor (PAGASA)**| Engr. Nathaniel Servando | `mentor.pagasa@dost.gov.ph`| `password` | Doppler radar courses, meteorology quizzes, trainee progress review |
| **Learner / Trainee** | Maria Santos | `user@dost.gov.ph` | `password` | Course enrollment, video lessons, quiz submissions, certificate verification |

---

## 🖥️ Active Local Services Verification

Ensure both services are running on your workstation:
- **Frontend Application**: `http://localhost:3000`
- **Backend API Service**: `http://localhost:8000`
- **MySQL Database**: Running on port `3306` (`dost_academy`)

---

## 🚀 Step-by-Step Manual Demonstration Script

---

### Step 1: Public Institutional Showcase & Responsive Navigation
1. Open your browser and navigate to: **`http://localhost:3000`**
2. **Verify Visuals & Full Screen**:
   - The navigation header stretches edge-to-edge across the screen with the official DOST Seal, navigation links ("Catalog", "Agency Curricula", "Faculty", "Contact"), and authentication pills.
   - The Hero Section features deep DOST Navy styling with agency badges: `DOST-ASTI`, `DOST-PAGASA`, `DOST-PHIVOLCS`, `DOST-ITDI`, `DOST-FNRI`, `DOST-MIRDC`.
3. **Explore Course Directory**:
   - Click **"Browse Course Catalog"** or the **"Catalog"** link in the header.
   - Verify all 7 official agency courses are categorized under their respective research institutes.
   - Test the live search filter (e.g. type `"Radar"` or `"Machine Learning"`).

---

### Step 2: Super Admin Login & Full Widescreen Executive Dashboard
1. Click **"Log In"** at the top right of the navigation bar.
2. Enter the Super Admin credentials:
   - **Email**: `admin@dost.gov.ph`
   - **Password**: `password`
3. Click **"Sign In"**.
4. **Inspect the Enhanced Executive UI**:
   - **Unified AdminHeader**: Spans the entire width of your monitor with the **"Super Admin"** badge, the 1-click workspace switcher (`🏛️ Functional HR` vs `⚙️ Technical IT`), and the Trainee Catalog preview link.
   - **DOST Executive Banner**: Deep navy gradient with official DOST Republic seal tag, title, and direct action buttons (`Executive Visual Analytics`, `IT Control Center`, `Manage Users`).
   - **Enlarged KPI Stat Cards**: Observe the 6 high-contrast metric cards with colored top accent borders and 38px bold values:
     - ⏳ *Pending User Approvals*: `0` (or amber if pending)
     - 🧑‍🏫 *Mentors & Faculty*: `6`
     - 👥 *Active Learners*: `6`
     - 🏛️ *Branches & Depts*: `6`
     - 📘 *Course Catalog*: `7`
     - 🎓 *Avg Completion*: `40%`
   - **6 Quick Controls**: Verify all 6 cards format evenly across the grid with hover elevation.
   - **Agency Roster**: Check the 6 agency tiles at the bottom (`DOST-ASTI`, `DOST-PAGASA`, etc.).

---

### Step 3: In-Browser CRUD Studio — Agency Branches & Curricula
1. In the header navigation or Quick Controls, click **"Branches"** (or `/manage-curriculums`).
2. **Verify Full-Width Layout**: Cards and table stretch edge-to-edge.
3. **Test Creating a Branch**:
   - Click **"＋ Add Department / Branch"**.
   - Enter:
     - **Agency Title**: `DOST-NRCP (National Research Council of the Philippines)`
     - **Category**: `Basic Research & Policy`
     - **Description**: `Promoting and supporting fundamental and policy research for national development.`
     - **Level**: `Advanced`
   - Click **"Save Curriculum Branch"**.
   - Notice the branch instantly appears in the grid!
4. **Test Editing a Branch**:
   - Click **"Edit"** on any existing branch card.
   - Modify the description or category and save.
   - Confirm immediate UI update.

---

### Step 4: In-Browser CRUD Studio — Full Course & Module Management
1. In the header navigation or Quick Controls, click **"Courses"** (or `/manage-courses`).
2. **Verify Full Administrative Authority**:
   - The toolbar shows the total course count, agency filter dropdown, search bar, and the primary **"＋ Create New Course"** button.
3. **Test Creating a Course Directly as Admin**:
   - Click **"＋ Create New Course"**.
   - Enter:
     - **Course Title**: `High-Performance Computing & Quantum Algorithms in DOST`
     - **Agency Branch**: Select `DOST-ASTI`
     - **Assigned Mentor**: Select `Dr. Franz de Leon`
     - **Duration**: `6 weeks`
     - **Level**: `Intermediate`
     - **Description**: `Advanced parallel computing architectures and quantum simulations applied to science and technology initiatives.`
   - Click **"Create Course"**.
   - Confirm success alert: "Course created successfully!"
4. **Test Syllabus & Module Manager**:
   - Find your newly created course (or any existing course) and click **"📚 Lessons"**.
   - The lesson manager modal opens, displaying all modules.
   - Click **"＋ Add New Lesson"**.
   - Enter:
     - **Lesson Title**: `Introduction to Slurm Clusters & Supercomputing Nodes`
     - **Content Type**: `video` (or `lesson`)
     - **Content URL**: `https://youtu.be/sample-hpc-intro`
     - **Estimated Duration**: `45` minutes
   - Click **"Save Lesson Module"**.
   - Notice the lesson appears immediately in the course syllabus list.
5. **Test Publishing Toggle & Course Editing**:
   - Click **"Draft / Unpublish"** to toggle status to `draft`.
   - Click **"Publish"** to restore to `published`.
   - Click **"Edit"** to test editing metadata directly.

---

### Step 5: In-Browser CRUD Studio — Assessments & Quizzes
1. In the header navigation, click **"Assignments"** (or `/manage-assignments`).
2. **Verify Assessments Studio**:
   - Filter by course or search by title.
   - Assessment types are highlighted with color-coded badges (`quiz`, `practical`, `project`).
3. **Test Creating an Assessment**:
   - Click **"＋ Create New Assessment"**.
   - Select Course: `Applied Machine Learning & AI in Public Services`
   - Title: `Hands-On Lab: Convolutional Neural Networks on Earth Observation Data`
   - Assessment Type: `practical`
   - Maximum Score: `100`
   - Due Date: Set to any future date.
   - Click **"Create Assessment"**.
   - Confirm the new assessment appears in the table.

---

### Step 6: In-Browser CRUD Studio — Institutional Certificate Registry
1. In the header navigation, click **"Certificates"** (or `/manage-certificates`).
2. **Inspect the Registry**:
   - Real-time search by recipient trainee, course title, or certificate verification number.
3. **Test Issuing a Certificate**:
   - Click **"＋ Issue Certificate"**.
   - Select Recipient Trainee: `Maria Santos`
   - Select Completed Course: `Applied Machine Learning & AI in Public Services`
   - Final Grade: `98`
   - Click **"Issue Official Certificate"**.
   - Note the newly generated Certificate ID (e.g., `DOST-2026-XXXX`).
4. **Test Public Verification Modal**:
   - Click **"🔍 Verify Credential"** in the top right.
   - Enter the generated Certificate ID.
   - Click **"Verify Authenticity"**.
   - Confirm the green verification badge: *"Verified Authentic DOST Credential"*, displaying recipient name, course, issue date, and grade.

---

### Step 7: Dual-Admin Mode Switcher — 1-Click Toggle
1. Look at the top navigation bar at the Super-Admin Switcher pill:
   - Click **"⚙️ Technical IT"**.
   - You are instantly transitioned to `/it-dashboard`!
   - Verify the IT Telemetry metrics:
     - Database Engine & Connection: `mysql (dost_academy)`
     - Schema Integrity & Migration Status: `All migrations up to date`
     - Active Users by Role breakdown
     - Security Audit Logs & Telemetry Events table
2. In the top navigation bar, click **"🏛️ Functional HR"**.
   - You are instantly transitioned to `/executive-dashboard`!
   - Verify the 100% dynamic analytical charts:
     - **Learning Inclination Radar**: Multi-axis polar chart reflecting competency categories.
     - **Department Velocity Chart**: Horizontal velocity bars comparing agency completion rates.
     - **Trainee Competency Matrix**: Matrix of personnel competency growth.
     - **Triage Alerts**: Dynamic alerts flagging at-risk enrollments.

---

### Step 8: Faculty Mentor Workflow
1. Click the profile avatar on the top right and click **"Logout"**.
2. Log in as a Faculty Mentor:
   - **Email**: `mentor.asti@dost.gov.ph`
   - **Password**: `password`
3. **Inspect the Mentor Experience**:
   - Header shows the mentor badge and assigned branch: `DOST-ASTI Computing & AI Division`.
   - The Mentor Dashboard displays courses published by this mentor, enrolled students, pending enrollment requests, and assignment submissions awaiting grading.
4. **Approve an Enrollment or Grade a Submission**:
   - If a student has submitted an assignment, enter a score and feedback, then click **"Submit Grade"**.

---

### Step 9: Trainee / Employee Learning & Syllabus Workflow
1. Click the profile menu and click **"Logout"**.
2. Log in as an Employee Trainee:
   - **Email**: `user@dost.gov.ph`
   - **Password**: `password`
3. **Inspect the Learner Experience**:
   - User Landing page displays assigned curriculum, recent announcements, and enrolled courses with full image previews.
   - Click **"Courses"** in the top navigation bar.
4. **Test "View Syllabus" Navigation (Verified Direct Routing)**:
   - On any course card (e.g. *Applied Machine Learning & AI in Public Services*), click the **"📖 View Syllabus"** button (or click the course title / image).
   - **Verify**: The browser navigates directly to the comprehensive **Course Syllabus & Overview page** (`/courses/1`) — **NO redirection to home page**!
   - **Inspect Syllabus Elements**:
     - Course Hero with agency branch badge, mentor name, level, duration, and learner count.
     - Course image loaded crisp and clear from `/assets/`.
     - **Structured Lessons & Video Lectures**: Lists Module 1, Module 2, Module 3 with lecture duration and **"▶ Open Video / Lecture Link"** pointing to real video sessions!
     - **Assessments & Quizzes**: Shows quizzes and practical labs with maximum score and due dates.
     - **Interactive Progress**: Mark lessons as completed to see the real-time progress bar increment!
5. **View Certificates**:
   - Navigate to **"Certificates"** in the navigation bar to inspect and download earned credentials.

---

### Step 10: Registration & Super Admin Approval Flow
1. Log out.
2. Click **"Register"** on the landing page.
3. Register a new test employee:
   - **Full Name**: `Engr. Alyssa Mercado`
   - **Email**: `alyssa.mercado@dost.gov.ph`
   - **Role**: `employee` (or `mentor`)
   - **Agency / Department**: `DOST-ASTI Computing & AI Division`
   - **Password**: `password`
4. Submit registration. Note the pending notice: *"Registration successful. Your account is pending administrative approval."*
5. Log back in as Super Admin (`admin@dost.gov.ph` / `password`).
6. Notice the **"Pending User Approvals"** stat card turns Amber with the **"Action Needed"** badge!
7. Click the card or go to **"Users"** (`/manage-users`), filter by **"Pending"**, and click **"Approve"**.
8. The account is now active and can immediately log in!

---

## 🏆 Demonstration Flow Complete
All features, layout responsiveness, edge-to-edge widescreen utilization, institutional DOST theme styling, dynamic visual charts, and full in-browser CRUD capabilities have been verified end-to-end.
