DOST Academy LMS - Client Deliverable
=======================================
Team 59 (AstraLink) - IFN735 Industry Project
Learning Management System for the Department of Science and Technology (DOST)

QUICK START
-----------
1. Extract this zip archive to any folder (e.g. C:\DOST_Academy_LMS).
2. Double-click setup.bat          (first time only; automated zero-config setup)
3. Double-click RUN_ALL.bat        (every session; launches backend, frontend, and browser)
4. Open http://localhost:3000

SYSTEM PREREQUISITES
--------------------
- PHP 8.1+ (or XAMPP with PHP on PATH / C:\xampp\php)
- Node.js LTS 18+ (https://nodejs.org)
- Database: MySQL on port 3306 (XAMPP / MySQL Server / MariaDB)
  * Note: If MySQL is not running on your machine, setup.bat will automatically
    activate the built-in SQLite engine with ZERO manual configuration required!

PRE-REGISTERED DEMO ACCOUNTS (Password: password for all)
---------------------------------------------------------
1. Super Administrator:      admin@dost.gov.ph
   - Access to all functional & technical studios, 1-click mode switcher pill.

2. IT Administrator:         it.admin@dost.gov.ph
   - Technical Admin portal: system telemetry, server health, database status, role matrices.

3. Functional Admin (HR):    functional.admin@dost.gov.ph
   - Content oversight, curriculum management, mentor assignments, approval workflows.

4. Faculty Mentor:           asti.mentor@dost.gov.ph
   - ASTI ICT branch faculty: course creation studio, lesson builder, grading desk.

5. Trainee / Employee:       mark.reyes@dost.gov.ph
   - Enrolled learner: dashboard, course catalog, interactive lessons, quizzes, certificates.

AUTHENTIC DOST WORKFLOW & FEATURES
----------------------------------
1. Dual Admin Portals:
   - Admin - Functional (HR / System Owner): Manages curriculums, courses, mentor approvals.
   - Admin - Technical (IT): Monitors system uptime, API response times, database tables, audit telemetry.
   - Super Administrator can seamlessly toggle between both workspaces with a single click.

2. Full In-Browser CRUD Studio:
   - Curriculums / Branches: Create, view, edit, delete, publish.
   - Courses: Direct creation, metadata editing, mentor assignment, publishing.
   - Course Lessons & Content: Add lessons, modular topics, YouTube/Vimeo embeds.
   - Users & Roles: Approve, promote/demote, change departments, manage all 5 roles.
   - Quizzes & Assignments: Create assessments, set deadlines, grade submissions.
   - Certificates: Authenticated digital certificates with DOST seal and PDF export.

3. Executive Analytics Dashboard:
   - Visualized radar inclination charts, department completion velocity bars, trainee competency matrix.

BATCH SCRIPTS
-------------
setup.bat            One-time hands-free installer (composer, npm, database, keys, seeds)
RUN_ALL.bat          Starts both backend (:8000) and frontend (:3000) and opens browser
RUN_BACKEND.bat      Starts Laravel API server only (port 8000)
RUN_FRONTEND.bat     Starts React development server only (port 3000)
RESET_DB.bat         Wipes and re-seeds the complete authentic DOST dataset
CLIENT_SETUP_AND_RUN.bat Automated setup and immediate server launch

MANUAL EVALUATION SCRIPT
------------------------
For a detailed step-by-step walkthrough of all features, please refer to:
MANUAL_DEMONSTRATION_FLOW_SCRIPT.md
