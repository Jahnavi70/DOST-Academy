<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Progress;
use App\Models\Enrollment;
use App\Models\Course;
use App\Models\Certificate;
use Illuminate\Http\Request;

class AdminProgressController extends Controller {
    public function index() {
        $users = User::where('role', 'employee')->get();
        $reports = [];
        foreach ($users as $user) {
            $enrollments = $user->enrollments()->with(['curriculum', 'course'])->get();
            foreach ($enrollments as $enrollment) {
                if ($enrollment->course_id) {
                    $courseIds = [$enrollment->course_id];
                    $course = $enrollment->course;
                    $progressData = Progress::where('user_id', $user->id)
                        ->whereIn('course_id', $courseIds)
                        ->get();
                    $avgProgress = $progressData->count() > 0 ? round($progressData->avg('progress'), 1) : 0;
                    $hasCertificate = Certificate::where('user_id', $user->id)
                        ->whereIn('course_id', $courseIds)->exists();
                    $reports[] = [
                        'user' => $user,
                        'curriculum' => $enrollment->curriculum,
                        'course' => $course,
                        'enrollment_status' => $enrollment->status,
                        'average_progress' => $avgProgress,
                        'certificate_status' => $hasCertificate ? 'Issued' : 'Not Issued',
                    ];
                    continue;
                }

                $courses = $enrollment->curriculum->courses ?? collect();
                $progressData = Progress::where('user_id', $user->id)
                    ->whereIn('course_id', $courses->pluck('id'))
                    ->get();
                $avgProgress = $progressData->count() > 0 ? round($progressData->avg('progress'), 1) : 0;
                $hasCertificate = Certificate::where('user_id', $user->id)
                    ->whereIn('course_id', $courses->pluck('id'))->exists();
                $reports[] = [
                    'user' => $user,
                    'curriculum' => $enrollment->curriculum,
                    'course' => null,
                    'enrollment_status' => $enrollment->status,
                    'average_progress' => $avgProgress,
                    'certificate_status' => $hasCertificate ? 'Issued' : 'Not Issued',
                ];
            }
        }
        return response()->json($reports);
    }
}
