DOST Academy LMS - Client Delivery
==================================

QUICK START
-----------
1. Extract this deliverable folder.
2. Double-click setup.bat          (first time only)
3. Double-click RUN_ALL.bat      (each session)
4. Open http://localhost:3000

PREREQUISITES
-------------
- PHP 8.1+ (or XAMPP with PHP)
- Node.js LTS 18+
- MySQL on port 3306 (database: dost_academy)

SYSTEM WORKFLOW & ROLES
-----------------------
1. Administrator:
   - Login: admin@dost.gov.ph / password
   - Pre-registered system administrator.
   - Adds branches/curriculums (e.g. IT Department, Mechanical Engineering).
   - Adds mentors/teachers and assigns them to their respective branch.
   - Full CRUD on users and teachers.
   - Reviews and Approves/Rejects new learner account registrations.
   - Monitors courses and training completion institutional-wide.
   - Note: Admin does not create courses or quizzes directly.

2. Teacher / Mentor:
   - Created and assigned to a branch by the Administrator.
   - Logs into Mentor Workspace.
   - Creates courses within their assigned branch using the structured step-by-step course builder (banner, lessons, chapters, video links, quizzes).
   - Full CRUD over their courses, lessons, and assessments.
   - Reviews and Approves/Rejects learner enrollment requests for their courses.
   - Grades learner submissions and leaves feedback.

3. Learner / Employee:
   - Registers via public registration form.
   - Account requires Administrator approval before login is permitted.
   - Browses branch courses and requests course enrollment.
   - Requires Mentor enrollment approval before learning content, videos, and quizzes are unlocked.

SCRIPTS
-------
setup.bat           Install dependencies + seed database
RUN_ALL.bat        Start backend (:8000) and frontend (:3000)
RUN_BACKEND.bat    Backend only
RUN_FRONTEND.bat   Frontend only
RESET_DB.bat       Wipes all data and reseeds initial Admin user

PRE-REGISTERED ACCOUNT
----------------------
Admin:    admin@dost.gov.ph
Password: password
Role:     admin (Approved)
