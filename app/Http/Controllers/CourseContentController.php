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
}
