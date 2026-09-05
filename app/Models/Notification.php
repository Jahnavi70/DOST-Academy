<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model {
    use HasFactory;
    protected $fillable = ['user_id', 'title', 'message', 'type', 'is_read'];
    protected $table = 'notifications';
    protected $casts = ['is_read' => 'boolean', 'type' => 'string'];
    public function user() { return $this->belongsTo(\App\Models\User::class); }
}
