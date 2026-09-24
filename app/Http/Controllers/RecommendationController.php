<?php
namespace App\Http\Controllers;

use App\Models\Curriculum;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class RecommendationController extends Controller {
    public function index(Request $request) {
        $enrolledIds = Enrollment::where('user_id', $request->user()->id)
            ->pluck('curriculum_id')->toArray();
        $recommendations = Curriculum::with('courses')
            ->whereNotIn('id', $enrolledIds)
            ->where('status', 'published')
            ->limit(6)
            ->get();
        return response()->json($recommendations);
    }
}
