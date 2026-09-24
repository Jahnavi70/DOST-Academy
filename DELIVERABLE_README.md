# DOST Academy LMS — Client Deliverable

**Team 59 (AstraLink) · IFN735 Industry Project**  
Learning Management System for the Department of Science and Technology (DOST)

### Team Roster & Roles
- **Jahnavi Kambhampati** (`jahnavikambhampati1109@gmail.com`) — Project Lead & System Delivery Owner
- **Satya Harika** (`satyaharika.nekkanti@gmail.com`) — Lead UI/UX Frontend Engineer
- **Rajashekar chava** (`rajachava27@gmail.com`) — Lead Backend & Database Architect
- **Nikhittha Mukkala** (`nikki6112002@gmail.com`) — QA Lead & Verification Engineer
- **Balaji Vamshi Pasala** (`balajivamshi4211@gmail.com`) — DevOps, Build & Public Asset Engineer
- **Reethika Katkuri** (`reethikakatkuri@gmail.com`) — Technical Documentation & Demonstration Specialist

---

## 1. Contents

| Item | Purpose |
|------|---------|
| `setup.bat` | One-time install: dependencies, keys, SQLite DB, seed data |
| `RUN_ALL.bat` | Start backend **and** frontend together |
| `RUN_BACKEND.bat` | Start Laravel API only (port 8000) |
| `RUN_FRONTEND.bat` | Start React app only (port 3000) |
| `RESET_DB.bat` | Wipe and re-seed demo data |
| `MANUAL_DEMONSTRATION_FLOW_SCRIPT.md` | Comprehensive 10-step client evaluation walkthrough |
| `PACKAGE_CLIENT_DELIVERABLE.ps1` | Rebuild this zip from source |

Source layout: Laravel 10 backend (`app/`, `routes/`, `database/`) + React 18 frontend (`src/`).

---

## 2. Prerequisites

Install once on the target PC:

1. **PHP 8.1+** (or XAMPP with PHP on PATH / `C:\xampp\php\php.exe`)
2. **Node.js LTS** 18+ (includes `npm`)
3. **MySQL on port 3306** (e.g. MySQL Server / MySQL Workbench / XAMPP MySQL)
4. Internet on first setup (Composer + npm packages)

The database used is **MySQL** (`dost_academy`), automatically provisioned and migrated by `setup.bat`.

---

## 3. Quick start

```text
1. Extract the zip to any folder, e.g. C:\DOST_Academy_LMS
2. Double-click setup.bat           (first time only; automated hands-free setup)
3. Double-click RUN_ALL.bat         (every session)
4. Open http://localhost:3000
```

Backend health: `http://127.0.0.1:8000/api/curriculums` (login required for most routes).

---

## 4. Pre-registered Demo Accounts

Password for all accounts: `password`

| Role | Email | Status | Description |
|------|-------|--------|-------------|
| **Super Admin** | `admin@dost.gov.ph` | Approved | Full administrative access + 1-click mode switcher |
| **IT Admin** | `it.admin@dost.gov.ph` | Approved | Technical admin: telemetry, uptime, database & role matrix |
| **Functional Admin** | `functional.admin@dost.gov.ph` | Approved | HR / Content admin: curriculums, courses, mentor approvals |
| **Faculty Mentor** | `asti.mentor@dost.gov.ph` | Approved | ASTI ICT mentor: course creation studio & grading desk |
| **Learner / Employee** | `mark.reyes@dost.gov.ph` | Approved | Enrolled trainee: dashboard, interactive syllabus, quizzes |

---

## 5. What setup.bat does

- **Automated PHP & Node Discovery:** Detects PHP (XAMPP, Laragon, tools, Chocolatey, etc.) and Node.js.
- **Dual-Engine Database Setup:** Connects to MySQL on port 3306 and creates `dost_academy`. If MySQL is unavailable on the client PC, it automatically activates the zero-config built-in SQLite engine with zero client intervention required!
- **Self-Healing Dependencies:** Installs Composer packages (using bundled `composer.phar` with `--ignore-platform-reqs`) and React npm packages (with `--legacy-peer-deps`).
- **Cryptographic Keys & Storage:** Generates `APP_KEY` and `JWT_SECRET`, and links `public/storage`.
- **Seeding:** Runs migrations and seeds the 6 DOST agency branches, accredited courses, mentors, and demo learners.
- **Auto Launch:** Starts backend on port 8000, frontend on port 3000, and opens `http://localhost:3000` in the browser!

Logs: `_client_setup_logs\` (if created). Re-run is safe; it skips completed steps.

---

## 6. Run scripts

| Script | Starts | URL |
|--------|--------|-----|
| `RUN_ALL.bat` | Backend + Frontend (two windows) | :8000 and :3000 |
| `RUN_BACKEND.bat` | `php artisan serve` | http://localhost:8000 |
| `RUN_FRONTEND.bat` | `npm start` | http://localhost:3000 |

Stop a server with **Ctrl+C** in its window, or close the window.

If port 3000 or 8000 is busy, close the other process or change ports in `.env` / frontend API base (`src/services/api.js` → `REACT_APP_API_URL`).

---

## 7. Reset demo data

Double-click `RESET_DB.bat`  
(or `powershell -ExecutionPolicy Bypass -File .\CLIENT_SETUP_AND_RUN.ps1 -FreshDatabase`)

This **deletes** all users, courses, enrollments, and uploads metadata, then reseeds.

---

## 8. Feature summary

- **Roles:** employee · mentor · admin (route + nav isolation)
- **Catalog:** curriculums, courses, enroll per course
- **Mentor:** create/publish courses, content, assessments, grade submissions
- **Admin:** users, courses, assignments, certificates, progress reports
- **Learner:** dashboard, assignments, certificates, progress, notifications

Mentor-created courses publish immediately and appear in the learner catalog.

---

## 9. Tests (optional)

```powershell
# Unit tests (frontend)
$env:CI='true'; npm test -- --watchAll=false --maxWorkers=1

# Browser smoke tests (requires RUN_ALL or both servers up)
npx playwright install chromium   # once
npx playwright test
```

---

## 10. Troubleshooting

| Issue | Fix |
|-------|-----|
| PHP not found | Install PHP 8.1+ or XAMPP; ensure `php` is on PATH |
| `vendor/` missing | Run `setup.bat` or `composer install` |
| `node_modules/` missing | Run `setup.bat` or `npm install` |
| Login / CORS errors | Start `RUN_BACKEND.bat` first, then `RUN_FRONTEND.bat` |
| Port in use | Close the other app on 3000/8000 |
| Broken data | Run `RESET_DB.bat` |

---

## 11. Rebuild deliverable zip

From the project root:

```powershell
powershell -ExecutionPolicy Bypass -File .\PACKAGE_CLIENT_DELIVERABLE.ps1
```

Output: sibling folder + `.zip` (excludes `node_modules`, `vendor`, `build`, test artifacts, local DB).

---

## 12. Support

- Project README: `README.md`
- Demo script: `DEMO_SCRIPT.md`
- Client setup log: `_client_setup_logs\` or `_setup_logs\`
