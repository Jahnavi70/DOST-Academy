<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model {
    use HasFactory;
    protected $fillable = ['curriculum_id', 'mentor_id', 'title', 'description', 'department', 'domain', 'duration', 'level', 'image', 'status'];
    protected $table = 'courses';
    public function curriculum() { return $this->belongsTo(\App\Models\Curriculum::class); }
    public function mentor() { return $this->belongsTo(\App\Models\User::class, 'mentor_id'); }
    public function progress() { return $this->hasMany(\App\Models\Progress::class); }
    public function assignments() { return $this->hasMany(\App\Models\Assignment::class); }
    public function contents() { return $this->hasMany(\App\Models\CourseContent::class); }
}
