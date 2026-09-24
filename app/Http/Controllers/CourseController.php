<?php
namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseContent;
use App\Models\CourseContentCompletion;
use App\Models\Assignment;
use App\Models\Enrollment;
use App\Models\Progress;
use Illuminate\Http\Request;

class CourseController extends Controller {
    public function index(Request $request) {
        $query = Course::with(['curriculum', 'mentor']);
        if (!$request->user()->is_admin && !$request->user()->is_mentor) {
            $query->where('status', 'published');
        }
        if ($request->curriculum_id) $query->where('curriculum_id', $request->curriculum_id);
        if ($request->mentor_id) $query->where('mentor_id', $request->mentor_id);
        if ($request->search) $query->where('title', 'like', "%{$request->search}%");
        return response()->json($query->latest()->get());
    }

    public function show($id) {
        $user = request()->user();
        $course = Course::with([
            'curriculum',
            'mentor',
            'assignments' => function($query) {
                $query->latest();
            },
            'contents' => function($query) {
                $query->where('is_published', true)->orderBy('sort_order')->orderBy('id');
            }
        ])->findOrFail($id);

        $course->learner_count = Enrollment::where('course_id', $course->id)
            ->where('status', 'enrolled')
            ->distinct('user_id')
            ->count('user_id');

        $course->average_progress = round(Progress::where('course_id', $course->id)->avg('progress') ?? 0, 1);

        $enrollment = Enrollment::where('user_id', $user->id)
            ->where(function($q) use ($course) {
                $q->where('course_id', $course->id)
                  ->orWhere(function($sub) use ($course) {
                      $sub->whereNull('course_id')->where('curriculum_id', $course->curriculum_id);
                  });
            })
            ->latest()
            ->first();

        $course->enrollment_status = $enrollment ? $enrollment->status : null;
        $course->is_enrolled = $enrollment && in_array($enrollment->status, ['enrolled', 'in_progress', 'completed']);

        $completedContentIds = CourseContentCompletion::where('course_id', $course->id)
            ->where('user_id', $user->id)
            ->pluck('course_content_id')
            ->toArray();

        $course->contents->transform(function($content) use ($completedContentIds) {
            $content->is_completed = in_array($content->id, $completedContentIds);
            return $content;
        });

        return response()->json($course);
    }

    public function store(Request $request) {
        $user = $request->user();

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'duration' => 'required|string|max:100',
            'curriculum_id' => $user->is_admin ? 'required|exists:curriculums,id' : 'nullable|exists:curriculums,id',
            'mentor_id' => 'nullable|exists:users,id',
            'level' => 'nullable|string|in:Beginner,Intermediate,Advanced',
            'domain' => 'nullable|string|max:255',
            'image' => 'nullable|string',
            'status' => 'nullable|in:draft,published',
            'lessons' => 'nullable|array',
            'assessments' => 'nullable|array',
        ]);

        if ($user->is_admin) {
            $curriculumId = $request->curriculum_id;
            $mentorId = $request->mentor_id ?: null;
            $curriculum = \App\Models\Curriculum::find($curriculumId);
            $department = $curriculum ? $curriculum->title : 'Administration';
        } else {
            if (!$user->curriculum_id) {
                return response()->json([
                    'error' => 'You have not been assigned to a branch/curriculum yet. Please contact the administrator to assign your curriculum.'
                ], 422);
            }
            $curriculumId = $user->curriculum_id;
            $mentorId = $user->id;
            $department = $user->curriculum ? $user->curriculum->title : ($user->department ?? 'General');
        }

        $course = Course::create([
            'curriculum_id' => $curriculumId,
            'mentor_id' => $mentorId,
            'title' => $request->title,
            'description' => $request->description,
            'department' => $department,
            'domain' => $request->domain ?? $department,
            'duration' => $request->duration,
            'level' => $request->level ?? 'Beginner',
            'image' => $request->image,
            'status' => $request->status ?? 'published',
        ]);

        // Process nested lessons if provided from multi-step wizard or admin form
        if ($request->has('lessons') && is_array($request->lessons)) {
            foreach ($request->lessons as $index => $lesson) {
                if (!empty($lesson['title'])) {
                    CourseContent::create([
                        'course_id' => $course->id,
                        'mentor_id' => $mentorId,
                        'title' => $lesson['title'],
                        'description' => $lesson['description'] ?? null,
                        'content_type' => $lesson['content_type'] ?? 'lesson',
                        'content_url' => $lesson['content_url'] ?? null,
                        'duration_minutes' => (int)($lesson['duration_minutes'] ?? 30),
                        'sort_order' => $index + 1,
                        'is_published' => true,
                    ]);
                }
            }
        }

        // Process nested assessments/quizzes if provided
        if ($request->has('assessments') && is_array($request->assessments)) {
            foreach ($request->assessments as $assessment) {
                if (!empty($assessment['title'])) {
                    Assignment::create([
                        'course_id' => $course->id,
                        'mentor_id' => $mentorId,
                        'title' => $assessment['title'],
                        'description' => $assessment['description'] ?? null,
                        'assessment_type' => $assessment['assessment_type'] ?? 'quiz',
                        'max_score' => (int)($assessment['max_score'] ?? 100),
                        'due_date' => $assessment['due_date'] ?? now()->addDays(14)->toDateString(),
                        'status' => 'pending',
                    ]);
                }
            }
        }

        return response()->json($course->load(['curriculum', 'mentor', 'contents', 'assignments']), 201);
    }

    public function update(Request $request, $id) {
        $course = Course::findOrFail($id);
        $user = $request->user();

        if (!$user->is_admin && (int) $course->mentor_id !== (int) $user->id) {
            return response()->json(['error' => 'You can only update courses you created.'], 403);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'duration' => 'sometimes|string|max:100',
            'curriculum_id' => 'sometimes|nullable|exists:curriculums,id',
            'mentor_id' => 'sometimes|nullable|exists:users,id',
            'level' => 'sometimes|string|in:Beginner,Intermediate,Advanced',
            'domain' => 'nullable|string|max:255',
            'image' => 'nullable|string',
            'status' => 'sometimes|in:draft,published',
        ]);

        $updateData = $request->only(['title', 'description', 'duration', 'level', 'domain', 'image', 'status']);
        if ($user->is_admin) {
            if ($request->has('curriculum_id')) {
                $updateData['curriculum_id'] = $request->curriculum_id;
                $curriculum = \App\Models\Curriculum::find($request->curriculum_id);
                if ($curriculum) $updateData['department'] = $curriculum->title;
            }
            if ($request->has('mentor_id')) {
                $updateData['mentor_id'] = $request->mentor_id;
            }
        }

        $course->update($updateData);
        return response()->json($course->fresh(['curriculum', 'mentor', 'contents', 'assignments']));
    }

    public function destroy(Request $request, $id) {
        $course = Course::findOrFail($id);
        $user = $request->user();

        if (!$user->is_admin && (int) $course->mentor_id !== (int) $user->id) {
            return response()->json(['error' => 'You can only delete courses you created.'], 403);
        }

        $course->delete();
        return response()->json(['message' => 'Course deleted successfully']);
    }

    public function approve($id) {
        $course = Course::findOrFail($id);
        $course->update(['status' => 'published']);
        return response()->json(['message' => 'Course approved and published', 'course' => $course]);
    }

    public function toggleStatus($id) {
        $course = Course::findOrFail($id);
        $course->status = ($course->status === 'published') ? 'draft' : 'published';
        $course->save();
        return response()->json([
            'message' => 'Course status updated to ' . $course->status,
            'course' => $course->fresh(['curriculum', 'mentor'])
        ]);
    }
}
