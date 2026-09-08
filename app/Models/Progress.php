<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Progress extends Model {
    use HasFactory;
    protected $fillable = ['user_id', 'course_id', 'progress', 'status'];
    protected $table = 'progress';
    protected $casts = ['status' => 'string'];
    public function user() { return $this->belongsTo(\App\Models\User::class); }
    public function course() { return $this->belongsTo(\App\Models\Course::class); }
}
