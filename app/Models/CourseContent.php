<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseContent extends Model {
    use HasFactory;
    protected $fillable = ['course_id', 'mentor_id', 'title', 'description', 'content_type', 'content_url', 'file_path', 'duration_minutes', 'sort_order', 'is_published'];
    protected $casts = ['is_published' => 'boolean'];

    public function course() { return $this->belongsTo(Course::class); }
    public function mentor() { return $this->belongsTo(User::class, 'mentor_id'); }
    public function completions() { return $this->hasMany(CourseContentCompletion::class); }
}
