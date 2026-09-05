<?php
namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller {
    public function index(Request $request) {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()->limit(20)->get();
        return response()->json($notifications);
    }

    public function markRead($id) {
        Notification::where('user_id', request()->user()->id)->where('id', $id)->update(['is_read' => true]);
        return response()->json(['message' => 'Marked as read']);
    }

    public function unreadCount(Request $request) {
        $count = Notification::where('user_id', $request->user()->id)->where('is_read', false)->count();
        return response()->json(['count' => $count]);
    }
}
