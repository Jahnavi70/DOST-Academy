<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assignment extends Model {
    use HasFactory;
    protected $fillable = ['course_id', 'mentor_id', 'title', 'description', 'assessment_type', 'max_score', 'due_date', 'status'];
    protected $table = 'assignments';
    protected $casts = ['due_date' => 'date', 'status' => 'string'];
    public function course() { return $this->belongsTo(\App\Models\Course::class); }
    public function mentor() { return $this->belongsTo(\App\Models\User::class, 'mentor_id'); }
    public function submissions() { return $this->hasMany(\App\Models\Submission::class); }
}
