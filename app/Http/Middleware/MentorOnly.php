<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class MentorOnly {
    public function handle(Request $request, Closure $next) {
        if (!$request->user() || (!$request->user()->is_mentor && !$request->user()->is_admin)) {
            return response()->json(['error' => 'Mentor access required'], 403);
        }
        return $next($request);
    }
}
