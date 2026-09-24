<?php
namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class AssignmentController extends Controller {
    public function index(Request $request) {
        if ($request->user()->is_admin) {
            return response()->json(Assignment::with(['course.mentor', 'mentor', 'submissions'])->get());
        }
        if ($request->user()->is_mentor) {
            return response()->json(Assignment::where('mentor_id', $request->user()->id)->with(['course', 'submissions.user'])->latest()->get());
        }

        $enrollments = Enrollment::where('user_id', $request->user()->id)
            ->whereIn('status', ['enrolled', 'in_progress', 'completed'])
            ->get();
        $courseIds = $enrollments->whereNotNull('course_id')->pluck('course_id')->all();
        $curriculumIds = $enrollments->whereNull('course_id')->pluck('curriculum_id')->all();

        $query = Assignment::with(['course', 'submissions' => function($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        }]);

        if (!empty($courseIds) && !empty($curriculumIds)) {
            $query->where(function($q) use ($courseIds, $curriculumIds) {
                $q->whereIn('course_id', $courseIds)
                  ->orWhereHas('course', function($cq) use ($curriculumIds) {
                      $cq->whereIn('curriculum_id', $curriculumIds);
                  });
            });
        } elseif (!empty($courseIds)) {
            $query->whereIn('course_id', $courseIds);
        } elseif (!empty($curriculumIds)) {
            $query->whereHas('course', function($cq) use ($curriculumIds) {
                $cq->whereIn('curriculum_id', $curriculumIds);
            });
        } else {
            return response()->json([]);
        }

        $assignments = $query->get()->map(function($assignment) {
            $assignment->user_submission = $assignment->submissions->first();
            unset($assignment->submissions);
            return $assignment;
        });
        return response()->json($assignments);
    }

    public function show($id) {
        return response()->json(Assignment::with(['course', 'mentor', 'submissions.user'])->findOrFail($id));
    }

    public function store(Request $request) {
        $user = $request->user();
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'due_date' => 'required|date',
            'description' => 'nullable|string',
            'assessment_type' => 'nullable|in:assignment,quiz,project,practical',
            'max_score' => 'nullable|integer|min:1|max:100',
        ]);

        $course = \App\Models\Course::findOrFail($request->course_id);
        if (!$user->is_admin && (int)$course->mentor_id !== (int)$user->id) {
            return response()->json(['error' => 'You do not have permission to create assignments for this course.'], 403);
        }

        $mentorId = $request->mentor_id ?: ($course->mentor_id ?: $user->id);

        $assignment = Assignment::create([
            'course_id' => $request->course_id,
            'mentor_id' => $mentorId,
            'title' => $request->title,
            'description' => $request->description,
            'assessment_type' => $request->assessment_type ?? 'quiz',
            'max_score' => (int)($request->max_score ?? 100),
            'due_date' => $request->due_date,
            'status' => 'pending',
        ]);

        return response()->json($assignment->load(['course', 'mentor']), 201);
    }

    public function update(Request $request, $id) {
        $user = $request->user();
        $assignment = Assignment::with('course')->findOrFail($id);

        if (!$user->is_admin && (int)$assignment->mentor_id !== (int)$user->id && (int)optional($assignment->course)->mentor_id !== (int)$user->id) {
            return response()->json(['error' => 'You do not have permission to edit this assessment.'], 403);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'assessment_type' => 'nullable|in:assignment,quiz,project,practical',
            'max_score' => 'nullable|integer|min:1|max:100',
            'due_date' => 'sometimes|date',
            'status' => 'sometimes|in:pending,in_progress,submitted,graded',
        ]);

        $assignment->update($request->only(['title', 'description', 'assessment_type', 'max_score', 'due_date', 'status']));
        return response()->json($assignment->fresh(['course', 'mentor']));
    }

    public function destroy(Request $request, $id) {
        $user = $request->user();
        $assignment = Assignment::with('course')->findOrFail($id);

        if (!$user->is_admin && (int)$assignment->mentor_id !== (int)$user->id && (int)optional($assignment->course)->mentor_id !== (int)$user->id) {
            return response()->json(['error' => 'You do not have permission to delete this assessment.'], 403);
        }

        $assignment->delete();
        return response()->json(['message' => 'Assessment deleted successfully']);
    }

    public function submit($id) {
        $assignment = Assignment::findOrFail($id);
        $assignment->update(['status' => 'submitted']);
        return response()->json(['message' => 'Assignment submitted', 'assignment' => $assignment]);
    }
}
