<?php
namespace App\Http\Controllers;

use App\Models\Skill;
use App\Models\Progress;
use Illuminate\Http\Request;

class SkillController extends Controller {
    public function index(Request $request) {
        $skills = Skill::all();
        $userSkills = $request->user()->skills;
        return response()->json(['all_skills' => $skills, 'user_skills' => $userSkills]);
    }

    public function userSkills(Request $request) {
        $userSkills = $request->user()->skills()->withPivot('progress')->get();
        return response()->json($userSkills);
    }

    public function updateProgress(Request $request, $skillId) {
        $request->validate(['progress' => 'required|integer|min:0|max:100']);
        $request->user()->skills()->syncWithoutDetaching([$skillId => ['progress' => $request->progress]]);
        return response()->json(['message' => 'Skill progress updated']);
    }
}
