<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Curriculum extends Model {
    use HasFactory;
    protected $fillable = ['title', 'description', 'category', 'level', 'image', 'status'];
    protected $table = 'curriculums';
    public function courses() { return $this->hasMany(\App\Models\Course::class); }
    public function enrollments() { return $this->hasMany(\App\Models\Enrollment::class); }
    public function mentors() { return $this->hasMany(\App\Models\User::class, 'curriculum_id')->where('role', 'mentor'); }
}
