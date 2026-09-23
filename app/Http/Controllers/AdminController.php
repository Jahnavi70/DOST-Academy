<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Enrollment;
use App\Models\Progress;
use App\Models\Course;
use App\Models\Curriculum;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller {
    public function dashboard() {
        $totalUsers = User::where('role', 'employee')->count();
        $totalMentors = User::where('role', 'mentor')->count();
        $pendingApprovals = User::where('status', 'pending')->count();
        $totalCurriculums = Curriculum::count();
        $totalCourses = Course::count();
        $totalEnrollments = Enrollment::count();
        $completedEnrollments = Enrollment::where('status', 'completed')->count();
        $avgCompletion = $totalEnrollments > 0 ? round(($completedEnrollments / $totalEnrollments) * 100, 1) : 0;
        $recentEnrollments = Enrollment::with('user', 'course', 'curriculum')->latest()->limit(5)->get();
        $recentUsers = User::with('curriculum')->latest()->limit(5)->get();

        return response()->json([
            'total_employees' => $totalUsers,
            'total_mentors' => $totalMentors,
            'pending_approvals' => $pendingApprovals,
            'total_curriculums' => $totalCurriculums,
            'total_courses' => $totalCourses,
            'total_enrollments' => $totalEnrollments,
            'completed_enrollments' => $completedEnrollments,
            'average_completion' => $avgCompletion,
            'recent_enrollments' => $recentEnrollments,
            'recent_users' => $recentUsers,
        ]);
    }

    public function users() {
        return response()->json(
            User::with('curriculum')
                ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
                ->orderBy('role')
                ->orderBy('name')
                ->get()
        );
    }

    public function createUser(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:employee,mentor,admin',
            'department' => 'nullable|string|max:255',
            'curriculum_id' => 'nullable|exists:curriculums,id',
            'bio' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'status' => 'approved', // Pre-approved when created directly by admin
            'department' => $request->department,
            'curriculum_id' => $request->curriculum_id,
            'bio' => $request->bio,
        ]);

        return response()->json($user->load('curriculum'), 201);
    }

    public function updateUser(Request $request, $id) {
        $user = User::findOrFail($id);
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'role' => 'sometimes|in:employee,mentor,admin',
            'status' => 'sometimes|in:pending,approved,rejected',
            'department' => 'nullable|string|max:255',
            'curriculum_id' => 'nullable|exists:curriculums,id',
            'password' => 'nullable|string|min:6',
            'bio' => 'nullable|string',
        ]);

        $data = $request->only(['name', 'email', 'role', 'status', 'department', 'curriculum_id', 'bio']);
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);
        return response()->json($user->fresh(['curriculum']));
    }

    public function approveUser($id) {
        $user = User::findOrFail($id);
        $user->update(['status' => 'approved']);

        Notification::create([
            'user_id' => $user->id,
            'title' => 'Account Approved',
            'message' => 'Your DOST Academy account registration has been approved. Welcome!',
            'type' => 'enrollment',
            'is_read' => false,
        ]);

        return response()->json(['message' => 'User approved successfully', 'user' => $user->fresh(['curriculum'])]);
    }

    public function rejectUser($id) {
        $user = User::findOrFail($id);
        $user->update(['status' => 'rejected']);
        return response()->json(['message' => 'User registration rejected', 'user' => $user->fresh(['curriculum'])]);
    }

    public function deleteUser(Request $request, $id) {
        if ((int)$request->user()->id === (int)$id) {
            return response()->json(['error' => 'You cannot delete your own account.'], 403);
        }

        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}
