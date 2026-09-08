<?php
namespace App\Http\Controllers;

use App\Models\Submission;
use App\Models\Assignment;
use Illuminate\Http\Request;

class SubmissionController extends Controller {
    public function index(Request $request) {
        $assignments = Assignment::with('course')->get();
        if ($request->user()->is_mentor) {
            $assignments = Assignment::where('mentor_id', $request->user()->id)->with('course')->get();
        }
        $assignmentIds = $assignments->pluck('id');
        return Submission::whereIn('assignment_id', $assignmentIds)->with(['assignment', 'user'])->get();
    }

    public function userSubmissions(Request $request) {
        return Submission::where('user_id', $request->user()->id)->with(['assignment.course'])->get();
    }

    public function store(Request $request) {
        $request->validate([
            'assignment_id' => 'required|exists:assignments,id',
            'content' => 'nullable|string',
            'file' => 'nullable|file|max:10240',
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('submissions', 'public');
        }

        $existing = Submission::where('assignment_id', $request->assignment_id)
            ->where('user_id', $request->user()->id)->first();

        $payload = [
            'content' => $request->content,
            'status' => 'submitted',
        ];
        if ($filePath) {
            $payload['file_path'] = $filePath;
        }

        if ($existing) {
            if (!$request->filled('content') && !$filePath) {
                return response()->json(['error' => 'Add written answers or attach a file before submitting.'], 422);
            }
            $existing->update($payload);
            return $existing;
        }

        if (!$request->filled('content') && !$filePath) {
            return response()->json(['error' => 'Add written answers or attach a file before submitting.'], 422);
        }

        return Submission::create(array_merge([
            'assignment_id' => $request->assignment_id,
            'user_id' => $request->user()->id,
        ], $payload));
    }

    public function adminIndex() {
        return Submission::with(['assignment.course', 'user'])->get();
    }

    public function grade(Request $request, $id) {
        $request->validate(['result' => 'required|integer|min:0|max:100', 'feedback' => 'nullable|string']);
        $submission = Submission::with(['assignment.course', 'user'])->findOrFail($id);
        if ($request->user()->is_mentor && $submission->assignment->mentor_id !== $request->user()->id) {
            return response()->json(['error' => 'You can only grade submissions for your assigned courses.'], 403);
        }
        $submission->update(['result' => $request->result, 'feedback' => $request->feedback, 'status' => 'graded']);

        // Auto-generate Certificate on passing grade (>= 50%)
        $course = $submission->assignment->course;
        if ($course && (int)$request->result >= 50) {
            $certificate = \App\Models\Certificate::firstOrCreate(
                [
                    'user_id' => $submission->user_id,
                    'course_id' => $course->id,
                ],
                [
                    'certificate_number' => 'DOST-CERT-' . strtoupper(\Illuminate\Support\Str::random(8)),
                    'issued_date' => now()->toDateString(),
                ]
            );

            \App\Models\Progress::updateOrCreate(
                ['user_id' => $submission->user_id, 'course_id' => $course->id],
                ['progress' => 100, 'status' => 'completed']
            );

            if ($certificate->wasRecentlyCreated) {
                \App\Models\Notification::create([
                    'user_id' => $submission->user_id,
                    'title' => 'Certificate Earned!',
                    'message' => 'Congratulations! You completed ' . $course->title . ' with ' . $submission->result . '% and earned certificate ' . $certificate->certificate_number . '.',
                    'type' => 'certificate',
                    'is_read' => false,
                ]);
            }
        }

        return $submission;
    }
}
