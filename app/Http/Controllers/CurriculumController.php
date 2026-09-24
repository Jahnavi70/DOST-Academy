<?php
namespace App\Http\Controllers;

use App\Models\Curriculum;
use Illuminate\Http\Request;

class CurriculumController extends Controller {
    public function index(Request $request) {
        $query = Curriculum::with([
            'courses' => function ($q) use ($request) {
                if ($request->level) $q->where('level', $request->level);
            },
            'mentors'
        ]);

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%")
                  ->orWhere('category', 'like', "%{$request->search}%")
                  ->orWhereHas('courses', function($courseQuery) use ($request) {
                      $courseQuery->where('title', 'like', "%{$request->search}%")
                          ->orWhere('description', 'like', "%{$request->search}%")
                          ->orWhere('department', 'like', "%{$request->search}%")
                          ->orWhere('domain', 'like', "%{$request->search}%");
                  });
            });
        }

        if ($request->category) $query->where('category', $request->category);
        if ($request->level) {
            $query->whereHas('courses', function ($q) use ($request) {
                $q->where('level', $request->level);
            });
        }

        if ($request->sort === 'name') $query->orderBy('title');
        elseif ($request->sort === 'recent') $query->latest();

        return response()->json($query->get());
    }

    public function show($id) {
        $curriculum = Curriculum::with(['courses.mentor', 'mentors'])->findOrFail($id);
        return response()->json($curriculum);
    }

    public function store(Request $request) {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:255',
            'level' => 'nullable|string',
            'image' => 'nullable|string',
            'status' => 'nullable|in:draft,published',
        ]);

        $curriculum = Curriculum::create([
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'level' => $request->level ?? 'Beginner',
            'image' => $request->image,
            'status' => $request->status ?? 'published',
        ]);

        return response()->json($curriculum->load('mentors'), 201);
    }

    public function update(Request $request, $id) {
        $curriculum = Curriculum::findOrFail($id);
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'category' => 'sometimes|string|max:255',
            'level' => 'nullable|string',
            'image' => 'nullable|string',
            'status' => 'sometimes|in:draft,published',
        ]);

        $curriculum->update($request->only(['title', 'description', 'category', 'level', 'image', 'status']));
        return response()->json($curriculum->load('mentors'));
    }

    public function destroy($id) {
        $curriculum = Curriculum::findOrFail($id);
        $curriculum->delete();
        return response()->json(['message' => 'Curriculum deleted successfully']);
    }
}
