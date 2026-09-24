<?php
namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Notification;
use Illuminate\Http\Request;

class EnrollmentController extends Controller {
    public function index(Request $request) {
        $enrollments = Enrollment::where('user_id', $request->user()->id)
            ->with(['curriculum.courses', 'course.curriculum', 'course.mentor'])
            ->latest()
            ->get();
        return response()->json($enrollments);
    }

    public function store(Request $request) {
        $request->validate([
            'course_id' => 'required_without:curriculum_id|integer|exists:courses,id',
            'curriculum_id' => 'sometimes|nullable|integer|exists:curriculums,id',
        ]);

        $userId = $request->user()->id;

        if ($request->filled('course_id')) {
            $course = Course::findOrFail($request->course_id);
            if ($course->status !== 'published') {
                return response()->json(['error' => 'This course is not open for enrollment.'], 403);
            }

            $existing = Enrollment::where('user_id', $userId)
                ->where('course_id', $course->id)
                ->first();

            if ($existing) {
                if ($existing->status === 'enrolled' || $existing->status === 'completed' || $existing->status === 'in_progress') {
                    return response()->json(['error' => 'Already enrolled in this course.'], 409);
                }
                if ($existing->status === 'pending') {
                    return response()->json(['error' => 'Your enrollment request is pending approval by the mentor.'], 409);
                }
                // If rejected, allow re-requesting
                $existing->update(['status' => 'pending']);
                $enrollment = $existing;
            } else {
                $enrollment = Enrollment::create([
                    'user_id' => $userId,
                    'curriculum_id' => $course->curriculum_id,
                    'course_id' => $course->id,
                    'status' => 'pending', // Requires mentor approval
                ]);
            }

            // Notify mentor
            if ($course->mentor_id) {
                Notification::create([
                    'user_id' => $course->mentor_id,
                    'title' => 'New Enrollment Request',
                    'message' => $request->user()->name . ' requested to enroll in ' . $course->title . '.',
                    'type' => 'enrollment',
                    'is_read' => false,
                ]);
            }

            // Notify learner
            Notification::create([
                'user_id' => $userId,
                'title' => 'Enrollment Request Submitted',
                'message' => 'Your request to enroll in ' . $course->title . ' has been submitted and is awaiting mentor approval.',
                'type' => 'enrollment',
                'is_read' => false,
            ]);

            return response()->json([
                'message' => 'Enrollment request submitted. Awaiting mentor approval.',
                'enrollment' => $enrollment->load(['curriculum', 'course.mentor']),
            ], 201);
        }

        $curriculumId = $request->input('curriculum_id');
        $existing = Enrollment::where('user_id', $userId)
            ->whereNull('course_id')
            ->where('curriculum_id', $curriculumId)
            ->first();

        if ($existing) {
            return response()->json(['error' => 'Already requested or enrolled in this curriculum.'], 409);
        }

        $enrollment = Enrollment::create([
            'user_id' => $userId,
            'curriculum_id' => $curriculumId,
            'course_id' => null,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Enrollment request submitted.',
            'enrollment' => $enrollment->load('curriculum'),
        ], 201);
    }

    public function userEnrollments(Request $request) {
        $enrollments = Enrollment::where('user_id', $request->user()->id)
            ->with(['curriculum', 'course.mentor'])
            ->latest()
            ->get();
        return response()->json($enrollments);
    }

    public function updateStatus(Request $request, $id) {
        $enrollment = Enrollment::findOrFail($id);
        $request->validate(['status' => 'required|in:pending,enrolled,in_progress,completed,rejected']);
        $enrollment->update(['status' => $request->status]);
        return response()->json($enrollment);
    }
}
