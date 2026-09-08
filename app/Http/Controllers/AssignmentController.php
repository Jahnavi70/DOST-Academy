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
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'due_date' => 'required|date',
            'description' => 'nullable|string',
            'assessment_type' => 'nullable|in:assignment,quiz,project,practical',
            'max_score' => 'nullable|integer|min:1|max:100',
        ]);
        $assignment = Assignment::create($request->only(['course_id', 'mentor_id', 'title', 'description', 'assessment_type', 'max_score', 'due_date']));
        return response()->json($assignment, 201);
    }

    public function update(Request $request, $id) {
        $assignment = Assignment::findOrFail($id);
        $assignment->update($request->only(['title', 'description', 'assessment_type', 'max_score', 'due_date', 'status']));
        return response()->json($assignment);
    }

    public function submit($id) {
        $assignment = Assignment::findOrFail($id);
        $assignment->update(['status' => 'submitted']);
        return response()->json(['message' => 'Assignment submitted', 'assignment' => $assignment]);
    }
}
