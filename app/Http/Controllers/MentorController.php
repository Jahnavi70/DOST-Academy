<?php
namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\CourseContent;
use App\Models\Enrollment;
use App\Models\Notification;
use App\Models\Progress;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MentorController extends Controller {
    private function mentorCourseQuery(Request $request) {
        return Course::where('mentor_id', $request->user()->id);
    }

    public function dashboard(Request $request) {
        $user = $request->user()->load('curriculum');
        $courses = $this->mentorCourseQuery($request)->with(['curriculum', 'assignments.submissions', 'contents'])->latest()->get();
        $courseIds = $courses->pluck('id');
        
        $assignmentIds = Assignment::whereIn('course_id', $courseIds)->pluck('id');
        $submissions = Submission::whereIn('assignment_id', $assignmentIds)->with(['assignment.course', 'user'])->latest()->get();
        
        $pendingEnrollments = Enrollment::whereIn('course_id', $courseIds)
            ->where('status', 'pending')
            ->with(['user', 'course'])
            ->latest()
            ->get();

        $activeLearnerCount = Enrollment::whereIn('course_id', $courseIds)
            ->where('status', 'enrolled')
            ->distinct('user_id')
            ->count('user_id');

        $pendingGrades = $submissions->where('status', 'submitted')->count();
        $graded = $submissions->where('status', 'graded');

        return response()->json([
            'assigned_curriculum' => $user->curriculum,
            'stats' => [
                'courses' => $courses->count(),
                'assignments' => $assignmentIds->count(),
                'contents' => $courses->sum(fn($course) => $course->contents->count()),
                'learners' => $activeLearnerCount,
                'pending_enrollments' => $pendingEnrollments->count(),
                'pending_grades' => $pendingGrades,
                'average_score' => $graded->count() > 0 ? round($graded->avg('result'), 1) : 0,
            ],
            'courses' => $courses,
            'pending_enrollments' => $pendingEnrollments,
            'submissions' => $submissions,
        ]);
    }

    public function courses(Request $request) {
        return response()->json(
            $this->mentorCourseQuery($request)->with(['curriculum', 'assignments.submissions', 'contents'])->latest()->get()
        );
    }

    public function enrollments(Request $request) {
        $courseIds = $this->mentorCourseQuery($request)->pluck('id');
        $enrollments = Enrollment::whereIn('course_id', $courseIds)
            ->with(['user', 'course.curriculum'])
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->latest()
            ->get();

        return response()->json($enrollments);
    }

    public function approveEnrollment(Request $request, $id) {
        $enrollment = Enrollment::with('course')->findOrFail($id);
        
        if ((int)$enrollment->course->mentor_id !== (int)$request->user()->id && !$request->user()->is_admin) {
            return response()->json(['error' => 'You can only approve enrollments for your own courses.'], 403);
        }

        $enrollment->update(['status' => 'enrolled']);

        Notification::create([
            'user_id' => $enrollment->user_id,
            'title' => 'Enrollment Approved!',
            'message' => 'Your enrollment request for ' . $enrollment->course->title . ' has been approved. You can now access lessons and start learning!',
            'type' => 'enrollment',
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'Enrollment approved successfully',
            'enrollment' => $enrollment->fresh(['user', 'course']),
        ]);
    }

    public function rejectEnrollment(Request $request, $id) {
        $enrollment = Enrollment::with('course')->findOrFail($id);

        if ((int)$enrollment->course->mentor_id !== (int)$request->user()->id && !$request->user()->is_admin) {
            return response()->json(['error' => 'You can only reject enrollments for your own courses.'], 403);
        }

        $enrollment->update(['status' => 'rejected']);

        Notification::create([
            'user_id' => $enrollment->user_id,
            'title' => 'Enrollment Request Declined',
            'message' => 'Your enrollment request for ' . $enrollment->course->title . ' was declined by the mentor.',
            'type' => 'enrollment',
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'Enrollment rejected',
            'enrollment' => $enrollment->fresh(['user', 'course']),
        ]);
    }

    public function storeAssignment(Request $request) {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assessment_type' => 'required|in:assignment,quiz,project,practical',
            'max_score' => 'required|integer|min:1|max:100',
            'due_date' => 'required|date',
        ]);

        $course = Course::findOrFail($request->course_id);
        if ($course->mentor_id !== $request->user()->id) {
            return response()->json(['error' => 'You can only create assessments for your assigned courses.'], 403);
        }

        $assignment = Assignment::create([
            'course_id' => $course->id,
            'mentor_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'assessment_type' => $request->assessment_type,
            'max_score' => $request->max_score,
            'due_date' => $request->due_date,
            'status' => 'pending',
        ]);

        $learnerIds = Enrollment::where('course_id', $course->id)->where('status', 'enrolled')->pluck('user_id');
        foreach ($learnerIds as $learnerId) {
            Notification::create([
                'user_id' => $learnerId,
                'title' => 'New ' . ucfirst($assignment->assessment_type),
                'message' => $assignment->title . ' has been assigned for ' . $course->title . '.',
                'type' => 'assignment',
                'is_read' => false,
            ]);
        }

        return response()->json($assignment->load('course'), 201);
    }

    public function destroyAssignment(Request $request, $id) {
        $assignment = Assignment::findOrFail($id);
        if ($assignment->mentor_id !== $request->user()->id && !$request->user()->is_admin) {
            return response()->json(['error' => 'You can only delete assessments for your assigned courses.'], 403);
        }
        $assignment->delete();
        return response()->json(['message' => 'Assessment deleted successfully']);
    }

    public function storeContent(Request $request) {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content_type' => 'required|in:lesson,video,document,link,practical',
            'content_url' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:1|max:600',
            'sort_order' => 'nullable|integer|min:1',
            'file' => 'nullable|file|max:20480',
        ]);

        $course = Course::findOrFail($request->course_id);
        if ($course->mentor_id !== $request->user()->id && !$request->user()->is_admin) {
            return response()->json(['error' => 'You can only upload content for your assigned courses.'], 403);
        }

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('course-content', 'public');
        }

        $content = CourseContent::create([
            'course_id' => $course->id,
            'mentor_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'content_type' => $request->content_type,
            'content_url' => $request->content_url,
            'file_path' => $filePath,
            'duration_minutes' => $request->duration_minutes ?? 30,
            'sort_order' => $request->sort_order ?? (CourseContent::where('course_id', $course->id)->max('sort_order') + 1),
            'is_published' => true,
        ]);

        return response()->json($content, 201);
    }

    public function destroyContent(Request $request, $id) {
        $content = CourseContent::findOrFail($id);
        if ($content->mentor_id !== $request->user()->id && !$request->user()->is_admin) {
            return response()->json(['error' => 'You can only delete content for your assigned courses.'], 403);
        }
        $content->delete();
        return response()->json(['message' => 'Content deleted successfully']);
    }

    public function submissions(Request $request) {
        $assignmentIds = Assignment::where('mentor_id', $request->user()->id)->pluck('id');
        return response()->json(
            Submission::whereIn('assignment_id', $assignmentIds)->with(['assignment.course', 'user'])->latest()->get()
        );
    }

    public function grade(Request $request, $id) {
        $request->validate([
            'result' => 'required|integer|min:0|max:100',
            'feedback' => 'nullable|string',
        ]);

        $submission = Submission::with(['assignment.course', 'user'])->findOrFail($id);
        if ($submission->assignment->mentor_id !== $request->user()->id && !$request->user()->is_admin) {
            return response()->json(['error' => 'You can only grade submissions for your assigned courses.'], 403);
        }

        $submission->update([
            'result' => $request->result,
            'feedback' => $request->feedback,
            'status' => 'graded',
        ]);

        Notification::create([
            'user_id' => $submission->user_id,
            'title' => 'Assessment Graded',
            'message' => $submission->assignment->title . ' was graded with ' . $submission->result . '%.',
            'type' => 'grade',
            'is_read' => false,
        ]);

        // Automatically generate Certificate when learner achieves passing grade (>= 50%)
        $course = $submission->assignment->course;
        $certificate = null;
        if ($course && (int)$request->result >= 50) {
            $certificate = Certificate::firstOrCreate(
                [
                    'user_id' => $submission->user_id,
                    'course_id' => $course->id,
                ],
                [
                    'certificate_number' => 'DOST-CERT-' . strtoupper(Str::random(8)),
                    'issued_date' => now()->toDateString(),
                ]
            );

            // Mark course progress as 100% completed
            Progress::updateOrCreate(
                ['user_id' => $submission->user_id, 'course_id' => $course->id],
                ['progress' => 100, 'status' => 'completed']
            );

            if ($certificate->wasRecentlyCreated) {
                Notification::create([
                    'user_id' => $submission->user_id,
                    'title' => 'Certificate Earned!',
                    'message' => 'Congratulations! You completed ' . $course->title . ' with ' . $submission->result . '% and earned certificate ' . $certificate->certificate_number . '.',
                    'type' => 'certificate',
                    'is_read' => false,
                ]);
            }
        }

        $res = $submission->fresh(['assignment.course', 'user'])->toArray();
        $res['certificate'] = $certificate;
        return response()->json($res);
    }
}
