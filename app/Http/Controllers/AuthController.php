<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller {
    public function register(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'department' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'department' => $request->department,
            'role' => 'employee',
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Registration successful! Your account is pending administrator approval before you can log in.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'role' => $user->role,
            ]
        ], 201);
    }

    public function login(Request $request) {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');
        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Invalid email or password'], 401);
        }

        $user = JWTAuth::user();

        // Approval checks for non-admin accounts
        if (!$user->is_admin) {
            if ($user->status === 'pending') {
                try { JWTAuth::invalidate($token); } catch (\Exception $e) {}
                return response()->json([
                    'error' => 'Your account is pending administrator approval. Please wait for an administrator to approve your account before logging in.'
                ], 403);
            }

            if ($user->status === 'rejected') {
                try { JWTAuth::invalidate($token); } catch (\Exception $e) {}
                return response()->json([
                    'error' => 'Your account registration has been rejected by the administrator. Please contact system administration.'
                ], 403);
            }
        }

        return response()->json([
            'user' => $user->load('curriculum'),
            'token' => $token,
        ]);
    }

    public function me(Request $request) {
        return response()->json($request->user()->load('curriculum'));
    }

    public function updateProfile(Request $request) {
        $user = $request->user();
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'department' => 'sometimes|nullable|string|max:255',
            'bio' => 'sometimes|nullable|string',
            'avatar' => 'sometimes|nullable|string',
        ]);
        $user->update($request->only(['name', 'department', 'bio', 'avatar']));
        return response()->json($user->load('curriculum'));
    }

    public function logout() {
        try {
            JWTAuth::invalidate(JWTAuth::parseToken());
        } catch (\Exception $e) {}
        return response()->json(['message' => 'Logged out successfully']);
    }
}
