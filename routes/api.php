<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CurriculumController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\AdminProgressController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\MentorController;
use App\Http\Controllers\CourseContentController;
use App\Http\Controllers\ExecutiveAnalyticsController;
use App\Http\Controllers\SystemHealthController;
use App\Http\Middleware\Authenticate;
use App\Http\Middleware\AdminOnly;
use App\Http\Middleware\MentorOnly;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Public catalog routes for Landing Page and Course Explorer
Route::get('/curriculums', [CurriculumController::class, 'index']);
Route::get('/curriculums/{id}', [CurriculumController::class, 'show']);
Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/{id}', [CourseController::class, 'show']);
Route::get('/certificates/verify/{certificate_number}', [CertificateController::class, 'verify']);

Route::group(['middleware' => Authenticate::class], function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::post('/course-contents/{id}/complete', [CourseContentController::class, 'complete']);

    Route::post('/enroll', [EnrollmentController::class, 'store']);
    Route::get('/enrollments', [EnrollmentController::class, 'index']);
    Route::get('/enrollments/user', [EnrollmentController::class, 'userEnrollments']);
    Route::put('/enrollments/{id}/status', [EnrollmentController::class, 'updateStatus']);

    Route::get('/progress', [ProgressController::class, 'index']);
    Route::put('/progress/{course_id}', [ProgressController::class, 'update']);
    Route::get('/progress/dashboard', [ProgressController::class, 'dashboard']);

    Route::get('/skills', [SkillController::class, 'index']);
    Route::get('/skills/user', [SkillController::class, 'userSkills']);
    Route::put('/skills/{skill_id}/progress', [SkillController::class, 'updateProgress']);

    Route::get('/recommendations', [RecommendationController::class, 'index']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::get('/notifications/unread', [NotificationController::class, 'unreadCount']);

    Route::get('/assignments', [AssignmentController::class, 'index']);
    Route::get('/assignments/{id}', [AssignmentController::class, 'show']);
    Route::put('/assignments/{id}/submit', [AssignmentController::class, 'submit']);

    Route::get('/courses/{id}/contents', [CourseContentController::class, 'indexByCourse']);
    Route::get('/certificates', [CertificateController::class, 'index']);
    Route::get('/certificates/{id}', [CertificateController::class, 'show']);

    Route::get('/submissions', [SubmissionController::class, 'index']);
    Route::get('/submissions/user', [SubmissionController::class, 'userSubmissions']);
    Route::post('/submissions', [SubmissionController::class, 'store']);

    // Mentor Scoped Routes
    Route::group(['middleware' => MentorOnly::class], function () {
        Route::get('/mentor/dashboard', [MentorController::class, 'dashboard']);
        Route::get('/mentor/courses', [MentorController::class, 'courses']);
        Route::post('/mentor/courses', [CourseController::class, 'store']);
        Route::put('/mentor/courses/{id}', [CourseController::class, 'update']);
        Route::delete('/mentor/courses/{id}', [CourseController::class, 'destroy']);
        Route::get('/mentor/curriculums', [CurriculumController::class, 'index']);
        Route::post('/mentor/course-contents', [MentorController::class, 'storeContent']);
        Route::delete('/mentor/course-contents/{id}', [MentorController::class, 'destroyContent']);
        Route::post('/mentor/assignments', [MentorController::class, 'storeAssignment']);
        Route::delete('/mentor/assignments/{id}', [MentorController::class, 'destroyAssignment']);
        Route::get('/mentor/enrollments', [MentorController::class, 'enrollments']);
        Route::put('/mentor/enrollments/{id}/approve', [MentorController::class, 'approveEnrollment']);
        Route::put('/mentor/enrollments/{id}/reject', [MentorController::class, 'rejectEnrollment']);
        Route::get('/mentor/submissions', [MentorController::class, 'submissions']);
        Route::put('/mentor/submissions/{id}/grade', [MentorController::class, 'grade']);
    });

    // Admin Scoped Routes
    Route::group(['middleware' => AdminOnly::class], function () {
        Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::post('/admin/users', [AdminController::class, 'createUser']);
        Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
        Route::put('/admin/users/{id}/approve', [AdminController::class, 'approveUser']);
        Route::put('/admin/users/{id}/reject', [AdminController::class, 'rejectUser']);
        Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
        Route::get('/admin/roles', [AdminController::class, 'availableRoles']);
        Route::get('/admin/progress', [AdminProgressController::class, 'index']);
        Route::get('/analytics/executive', [ExecutiveAnalyticsController::class, 'getAnalytics']);
        Route::get('/admin/system-health', [SystemHealthController::class, 'getHealth']);
        Route::post('/admin/cache-flush', [SystemHealthController::class, 'flushCache']);

        // Admin manages Curriculums / Branches
        Route::post('/curriculums', [CurriculumController::class, 'store']);
        Route::put('/curriculums/{id}', [CurriculumController::class, 'update']);
        Route::delete('/curriculums/{id}', [CurriculumController::class, 'destroy']);
        Route::get('/admin/curriculums', [CurriculumController::class, 'index']);
        Route::post('/admin/curriculums', [CurriculumController::class, 'store']);
        Route::put('/admin/curriculums/{id}', [CurriculumController::class, 'update']);
        Route::delete('/admin/curriculums/{id}', [CurriculumController::class, 'destroy']);

        // Full Admin Course Management (Create, Edit, Toggle Status, Approve, Delete)
        Route::post('/courses', [CourseController::class, 'store']);
        Route::put('/courses/{id}', [CourseController::class, 'update']);
        Route::put('/courses/{id}/toggle-status', [CourseController::class, 'toggleStatus']);
        Route::put('/courses/{id}/approve', [CourseController::class, 'approve']);
        Route::delete('/courses/{id}', [CourseController::class, 'destroy']);

        // Full Admin Course Contents / Lessons CRUD
        Route::post('/courses/{courseId}/contents', [CourseContentController::class, 'store']);
        Route::put('/course-contents/{id}', [CourseContentController::class, 'update']);
        Route::delete('/course-contents/{id}', [CourseContentController::class, 'destroy']);

        // Full Admin Assessments / Quizzes CRUD
        Route::post('/assignments', [AssignmentController::class, 'store']);
        Route::put('/assignments/{id}', [AssignmentController::class, 'update']);
        Route::delete('/assignments/{id}', [AssignmentController::class, 'destroy']);

        // Full Admin Certificates CRUD
        Route::post('/certificates', [CertificateController::class, 'store']);
        Route::delete('/certificates/{id}', [CertificateController::class, 'destroy']);

        // Admin Submissions & Grading
        Route::get('/admin/submissions', [SubmissionController::class, 'adminIndex']);
        Route::put('/submissions/{id}/grade', [SubmissionController::class, 'grade']);
    });
});
