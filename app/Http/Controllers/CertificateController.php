<?php
namespace App\Http\Controllers;

use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CertificateController extends Controller {
    public function index(Request $request) {
        if ($request->user()->is_admin) {
            return response()->json(Certificate::with(['user', 'course'])->get());
        }
        return response()->json(Certificate::where('user_id', $request->user()->id)->with('course')->get());
    }

    public function store(Request $request) {
        $request->validate(['course_id' => 'required']);
        $existing = Certificate::where('user_id', $request->user()->id)->where('course_id', $request->course_id)->first();
        if ($existing) return response()->json(['error' => 'Certificate already exists'], 409);
        $certificate = Certificate::create([
            'user_id' => $request->user()->id,
            'course_id' => $request->course_id,
            'certificate_number' => 'DOST-CERT-' . strtoupper(Str::random(8)),
            'issued_date' => now()->toDateString(),
        ]);
        \App\Models\Notification::create([
            'user_id' => $request->user()->id,
            'title' => 'Certificate Issued',
            'message' => 'Your certificate has been generated: ' . $certificate->certificate_number,
            'type' => 'certificate',
        ]);
        return response()->json($certificate->load('course'), 201);
    }
}
