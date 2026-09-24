<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model {
    use HasFactory;
    protected $fillable = ['user_id', 'curriculum_id', 'course_id', 'status'];
    protected $table = 'enrollments';
    protected $casts = ['status' => 'string'];
    public function user() { return $this->belongsTo(\App\Models\User::class); }
    public function curriculum() { return $this->belongsTo(\App\Models\Curriculum::class); }
    public function course() { return $this->belongsTo(\App\Models\Course::class); }
}
