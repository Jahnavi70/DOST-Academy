# DOST Academy System

## Project Overview

DOST Academy System is a centralized Learning Management System (LMS) developed for the Department of Science and Technology (DOST). The system supports employee training, course access, assignment tracking, certificate management, and learning progress monitoring.

## Team Details

**Team Name:** Team 59 (AstraLink)  
**Unit:** IFN735 – Industry Project  
**Project Title:** DOST Academy System  
**Industry Partner:** Department of Science and Technology (DOST)  

### Team Roster
- **Jahnavi Kambhampati** (`jahnavikambhampati1109@gmail.com`) — Project Lead & System Delivery Owner
- **Satya Harika** (`satyaharika.nekkanti@gmail.com`) — Lead UI/UX Frontend Engineer
- **Rajashekar chava** (`rajachava27@gmail.com`) — Lead Backend & Database Architect
- **Nikhittha Mukkala** (`nikki6112002@gmail.com`) — QA Lead & Verification Engineer
- **Balaji Vamshi Pasala** (`balajivamshi4211@gmail.com`) — DevOps, Build & Public Asset Engineer
- **Reethika Katkuri** (`reethikakatkuri@gmail.com`) — Technical Documentation & Demonstration Specialist

## Technologies

| Component | Technology |
|-----------|-----------|
| Frontend | React JS, React Router DOM, Axios |
| Backend | Laravel 10 (PHP 8.1+) |
| Database | MySQL |
| Authentication | JWT (tymon/jwt-auth) |
| API Style | RESTful JSON API |

## Features

### Employee Side
- Login / Signup with JWT authentication
- User Landing Page with curriculum browser
- Employee Dashboard with progress tracking
- Department-Based Course Catalogue
- Course Details Page
- Assignments Page with submission
- Certificates Page
- Edit Profile Page
- Notifications

### Admin Side
- Admin Dashboard with live statistics
- Manage Users (CRUD)
- Manage Courses (Create, Approve)
- Manage Assignments (Create, View)
- Manage Certificates (Issue, View)
- Progress Reports (Organisation-wide analytics)

## Database Tables

| Table | Description |
|-------|-------------|
| users | All accounts with roles (employee/admin) |
| curriculums | Department groupings |
| courses | Individual courses within curriculums |
| enrollments | User-curriculum enrollment links |
| progress | Per-course progress tracking |
| assignments | Course assignments |
| submissions | Assignment submissions with results |
| certificates | Issued certificates |
| skills | Skill categories |
| user_skills | User skill progress |
| notifications | System notifications |

## Routes

### Employee Routes
```
/                    Public Home Page
/login               Login / Signup
/user-home           User Landing Page
/dashboard           Employee Dashboard
/courses             Course Catalogue
/course-details      Course Details
/assignments         Assignments
/certificates        Certificates
/edit-profile        Edit Profile
```

### Admin Routes
```
/admin-dashboard     Admin Dashboard
/manage-users        Manage Users
/manage-courses      Manage Courses
/manage-assignments  Manage Assignments
/manage-certificates Manage Certificates
/progress-reports    Progress Reports
```

### API Endpoints
```
POST   /api/auth/login          Login
POST   /api/auth/register       Register
GET    /api/auth/me              Current user
PUT    /api/auth/profile         Update profile
GET    /api/curriculums          List curriculums
GET    /api/courses              List courses
POST   /api/enroll               Enroll in curriculum
GET    /api/enrollments/user     My enrollments
GET    /api/progress/dashboard   Dashboard data
GET    /api/assignments          List assignments
PUT    /api/assignments/{id}/submit  Submit assignment
GET    /api/certificates         My certificates
GET    /api/submissions          List submissions
GET    /api/admin/dashboard      Admin stats
GET    /api/admin/users          All users
DELETE /api/admin/users/{id}     Delete user
GET    /api/admin/progress       All progress
POST   /api/courses              Create course (admin)
PUT    /api/courses/{id}/approve Approve course (admin)
POST   /api/assignments          Create assignment (admin)
POST   /api/certificates         Issue certificate (admin)
```

## Setup Instructions

### ONE-CLICK AUTO SETUP (Recommended)

1. Extract the ZIP file to any folder
2. Right-click `setup.bat`
3. Select **"Run as administrator"**
4. Wait 10-20 minutes (downloads everything automatically)
5. Double-click `start-all.bat` to launch

**That's it!** The script automatically:
- Installs Chocolatey (package manager)
- Downloads and installs PHP 8.1+
- Downloads and installs Composer
- Downloads and installs Node.js 18+
- Downloads and installs MySQL (or uses SQLite fallback)
- Installs all Laravel and React dependencies
- Creates database, runs migrations, seeds sample data
- Generates security keys
- Creates launcher scripts

### What You Need
- Windows 10/11
- Internet connection
- Run as Administrator

### Manual Setup (if auto setup fails)

#### Prerequisites
- PHP 8.1 or higher
- Composer
- Node.js 18 or higher
- MySQL 5.7+ (or SQLite)

#### Steps
```bash
# Install dependencies
composer install
npm install

# Configure
cp .env.example .env
php artisan key:generate
php artisan jwt:secret

# Setup database
mysql -u root -e "CREATE DATABASE dost_academy;"
php artisan migrate --seed

# Start servers
php artisan serve    # Terminal 1
npm start            # Terminal 2
```

### Access URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dost.gov.ph | password |
| Employee | james@dost.gov.ph | password |
| Employee | maria@dost.gov.ph | password |
| Employee | robert@dost.gov.ph | password |
| Employee | anna@dost.gov.ph | password |

## Project Structure

```
dost-lms-final/
├── app/
│   ├── Console/           # Artisan commands
│   ├── Exceptions/        # Exception handling
│   ├── Http/
│   │   ├── Controllers/   # 13 API controllers
│   │   └── Middleware/     # Auth + Admin middleware
│   └── Models/            # 10 Eloquent models
├── config/                # Laravel configuration
├── database/
│   ├── migrations/        # 10 database migrations
│   └── seeders/           # Sample data seeder
├── public/                # Web entry point
├── routes/
│   └── api.php            # 30+ API routes
├── src/                   # React frontend
│   ├── assets/            # Images and static files
│   ├── context/           # AuthContext provider
│   ├── pages/             # 15 React pages
│   ├── services/          # API client (axios)
│   └── __tests__/         # Jest tests
├── storage/               # Logs, cache, sessions
├── tests/                 # Backend tests
├── .env                   # Environment config
├── composer.json          # PHP dependencies
├── package.json           # JS dependencies
├── setup.bat              # One-click setup
├── setup.ps1              # PowerShell setup script
├── start-backend.bat      # Start Laravel server
├── start-frontend.bat     # Start React server
└── start-all.bat          # Start both servers
```

## Scrum Documents

The following scrum meeting briefs are included in the submission ZIP:

1. `DOST_Academy_API_Integration_Scrum_Brief.docx` – Sprint 2 Planning
2. `DOST_Academy_Sprint_Review_Next_Sprint_Brief.docx` – Sprint 2 Review + Sprint 3 Planning
3. `DOST_Academy_Next_Scrum_Brief_Sprint3_Continuation.docx` – Sprint 3 (Deployment/LMS)
4. `DOST_Academy_Next_Scrum_Brief_Sprint4_Followup.docx` – Sprint 4 (Production/Closure)

## Status

**Phase 1:** Frontend prototype completed
**Phase 2:** Backend, database, authentication, API integration completed
**Phase 3:** Deployment and testing ready
**Phase 4:** Production handover prepared

## Image & Visual Assets

All platform graphics, banners, icons, and branding are self-contained local device vectors (`src/assets/`) and official DOST departmental graphics.

## License

This project is developed for IFN735 Industry Project at RMIT University.
