<?php
namespace App\Http\Controllers;

use App\Models\CourseContent;
use App\Models\CourseContentCompletion;
use App\Models\Enrollment;
use App\Models\Progress;
use Illuminate\Http\Request;

class CourseContentController extends Controller {
    public function complete(Request $request, $id) {
        $content = CourseContent::with('course')->findOrFail($id);

        $isEnrolled = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $content->course_id)
            ->whereIn('status', ['enrolled', 'in_progress', 'completed'])
            ->exists();

        if (!$isEnrolled) {
            $isEnrolled = Enrollment::where('user_id', $request->user()->id)
                ->whereNull('course_id')
                ->where('curriculum_id', $content->course->curriculum_id)
                ->whereIn('status', ['enrolled', 'in_progress', 'completed'])
                ->exists();
        }

        if (!$isEnrolled && !$request->user()->is_admin && !$request->user()->is_mentor) {
            return response()->json([
                'error' => 'Your enrollment in this course must be approved by the mentor before completing content.'
            ], 403);
        }

        CourseContentCompletion::updateOrCreate(
            ['course_content_id' => $content->id, 'user_id' => $request->user()->id],
            ['course_id' => $content->course_id, 'completed_at' => now()]
        );

        $total = CourseContent::where('course_id', $content->course_id)->where('is_published', true)->count();
        $completed = CourseContentCompletion::where('course_id', $content->course_id)
            ->where('user_id', $request->user()->id)
            ->count();
        $progressValue = $total > 0 ? min(100, round(($completed / $total) * 100)) : 0;

        $progress = Progress::updateOrCreate(
            ['user_id' => $request->user()->id, 'course_id' => $content->course_id],
            ['progress' => $progressValue, 'status' => $progressValue >= 100 ? 'completed' : 'in_progress']
        );

        if ($progressValue >= 100) {
            $cert = \App\Models\Certificate::firstOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'course_id' => $content->course_id,
                ],
                [
                    'certificate_number' => 'DOST-CERT-' . strtoupper(\Illuminate\Support\Str::random(8)),
                    'issued_date' => now()->toDateString(),
                ]
            );

            if ($cert->wasRecentlyCreated) {
                \App\Models\Notification::create([
                    'user_id' => $request->user()->id,
                    'title' => 'Course Completed & Certificate Earned!',
                    'message' => 'Congratulations on completing ' . $content->course->title . '! Certificate ' . $cert->certificate_number . ' has been issued.',
                    'type' => 'certificate',
                    'is_read' => false,
                ]);
            }
        }

        return response()->json([
            'message' => 'Content completed',
            'progress' => $progress,
            'completed_count' => $completed,
            'total_count' => $total,
        ]);
    }

    public function indexByCourse($courseId) {
        $contents = CourseContent::where('course_id', $courseId)
            ->orderBy('sort_order', 'asc')
            ->get();
        return response()->json($contents);
    }

    public function store(Request $request, $courseId) {
        $user = $request->user();
        $course = \App\Models\Course::findOrFail($courseId);

        if (!$user->is_admin && (int)$course->mentor_id !== (int)$user->id) {
            return response()->json(['error' => 'You do not have permission to manage content for this course.'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content_type' => 'nullable|in:lesson,video,document,link,practical',
            'content_url' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:1',
            'sort_order' => 'nullable|integer',
            'is_published' => 'nullable|boolean',
        ]);

        $maxOrder = CourseContent::where('course_id', $courseId)->max('sort_order') ?? 0;

        $content = CourseContent::create([
            'course_id' => $courseId,
            'mentor_id' => $course->mentor_id ?: $user->id,
            'title' => $request->title,
            'description' => $request->description,
            'content_type' => $request->content_type ?? 'lesson',
            'content_url' => $request->content_url,
            'duration_minutes' => (int)($request->duration_minutes ?? 30),
            'sort_order' => $request->sort_order ?? ($maxOrder + 1),
            'is_published' => $request->has('is_published') ? (bool)$request->is_published : true,
        ]);

        return response()->json($content, 201);
    }

    public function update(Request $request, $id) {
        $user = $request->user();
        $content = CourseContent::with('course')->findOrFail($id);

        if (!$user->is_admin && (int)$content->course->mentor_id !== (int)$user->id) {
            return response()->json(['error' => 'You do not have permission to edit this lesson.'], 403);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'content_type' => 'nullable|in:lesson,video,document,link,practical',
            'content_url' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:1',
            'sort_order' => 'nullable|integer',
            'is_published' => 'nullable|boolean',
        ]);

        $content->update($request->only([
            'title', 'description', 'content_type', 'content_url',
            'duration_minutes', 'sort_order', 'is_published'
        ]));

        return response()->json($content);
    }

    public function destroy(Request $request, $id) {
        $user = $request->user();
        $content = CourseContent::with('course')->findOrFail($id);

        if (!$user->is_admin && (int)$content->course->mentor_id !== (int)$user->id) {
            return response()->json(['error' => 'You do not have permission to delete this lesson.'], 403);
        }

        $content->delete();
        return response()->json(['message' => 'Lesson deleted successfully']);
    }
}
