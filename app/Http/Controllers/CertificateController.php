<?php
namespace App\Http\Controllers;

use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CertificateController extends Controller {
    public function index(Request $request) {
        if ($request->user()->is_admin) {
            return response()->json(Certificate::with(['user', 'course.curriculum', 'course.mentor'])->latest()->get());
        }
        return response()->json(Certificate::where('user_id', $request->user()->id)->with(['course.curriculum', 'course.mentor'])->latest()->get());
    }

    public function show($id) {
        $cert = Certificate::with(['user', 'course.curriculum', 'course.mentor'])->findOrFail($id);
        return response()->json($cert);
    }

    public function store(Request $request) {
        $currentUser = $request->user();
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $targetUserId = ($currentUser->is_admin && $request->filled('user_id'))
            ? $request->user_id
            : $currentUser->id;

        $existing = Certificate::where('user_id', $targetUserId)->where('course_id', $request->course_id)->first();
        if ($existing) {
            return response()->json(['error' => 'A certificate has already been issued for this employee and course.'], 409);
        }

        $certificate = Certificate::create([
            'user_id' => $targetUserId,
            'course_id' => $request->course_id,
            'certificate_number' => 'DOST-CERT-' . strtoupper(Str::random(8)),
            'issued_date' => $request->issued_date ?: now()->toDateString(),
        ]);

        \App\Models\Notification::create([
            'user_id' => $targetUserId,
            'title' => 'Certificate Issued',
            'message' => 'Your official certificate has been issued: ' . $certificate->certificate_number,
            'type' => 'certificate',
        ]);

        return response()->json($certificate->load(['user', 'course.curriculum', 'course.mentor']), 201);
    }

    public function destroy(Request $request, $id) {
        $user = $request->user();
        if (!$user->is_admin) {
            return response()->json(['error' => 'Only administrators can revoke certificates.'], 403);
        }

        $cert = Certificate::findOrFail($id);
        $cert->delete();
        return response()->json(['message' => 'Certificate revoked successfully']);
    }

    public function verify($certificate_number) {
        $cert = Certificate::with(['user', 'course.curriculum', 'course.mentor'])
            ->where('certificate_number', $certificate_number)
            ->first();

        if (!$cert) {
            return response()->json([
                'valid' => false,
                'message' => 'Certificate not found in official DOST Registry.'
            ], 404);
        }

        return response()->json([
            'valid' => true,
            'certificate_number' => $cert->certificate_number,
            'recipient' => $cert->user ? $cert->user->name : 'N/A',
            'recipient_email' => $cert->user ? $cert->user->email : 'N/A',
            'course' => $cert->course ? $cert->course->title : 'N/A',
            'branch' => optional(optional($cert->course)->curriculum)->title ?? 'DOST Academy',
            'mentor' => optional(optional($cert->course)->mentor)->name ?? 'DOST Faculty',
            'issued_date' => $cert->issued_date,
            'status' => 'Verified Authentic'
        ]);
    }
}
