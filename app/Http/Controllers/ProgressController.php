<?php
namespace App\Http\Controllers;

use App\Models\Progress;
use Illuminate\Http\Request;

class ProgressController extends Controller {
    public function index(Request $request) {
        $progress = Progress::where('user_id', $request->user()->id)
            ->with('course')
            ->get();
        return response()->json($progress);
    }

    public function update(Request $request, $id) {
        $progress = Progress::where('user_id', $request->user()->id)
            ->where('course_id', $id)->first();
        if (!$progress) {
            $progress = Progress::create([
                'user_id' => $request->user()->id,
                'course_id' => $id,
                'progress' => $request->progress ?? 0,
                'status' => $request->status ?? 'in_progress',
            ]);
        } else {
            $progress->update($request->only(['progress', 'status']));
        }
        return response()->json($progress->load('course'));
    }

    public function dashboard(Request $request) {
        $user = $request->user();
        $enrollments = $user->enrollments()->count();
        $completed = $user->progress()->where('status', 'completed')->count();
        $certificates = $user->certificates()->count();
        $avgProgress = $user->progress()->avg('progress') ?? 0;
        return response()->json([
            'enrolled_count' => $enrollments,
            'completed_count' => $completed,
            'certificate_count' => $certificates,
            'average_progress' => round($avgProgress, 1),
        ]);
    }
}
