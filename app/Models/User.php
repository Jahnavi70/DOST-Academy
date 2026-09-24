<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject {
    use HasFactory, Notifiable;
    protected $fillable = ['name', 'email', 'password', 'role', 'status', 'department', 'curriculum_id', 'avatar', 'bio'];
    protected $table = 'users';
    protected $hidden = ['password', 'remember_token'];
    protected $casts = ['password' => 'hashed'];
    public function getJWTIdentifier() { return $this->getKey(); }
    public function getJWTCustomClaims() { return ['role' => $this->role]; }
    public function curriculum() { return $this->belongsTo(\App\Models\Curriculum::class, 'curriculum_id'); }
    public function enrollments() { return $this->hasMany(\App\Models\Enrollment::class); }
    public function progress() { return $this->hasMany(\App\Models\Progress::class); }
    public function skills() { return $this->belongsToMany(\App\Models\Skill::class, 'user_skills')->withPivot('progress'); }
    public function certificates() { return $this->hasMany(\App\Models\Certificate::class); }
    public function notifications() { return $this->hasMany(\App\Models\Notification::class); }
    public function mentoredCourses() { return $this->hasMany(\App\Models\Course::class, 'mentor_id'); }
    public function getIsSuperAdminAttribute() { return $this->role === 'admin'; }
    public function getIsAdminFunctionalAttribute() { return in_array($this->role, ['admin', 'admin_functional']); }
    public function getIsAdminTechnicalAttribute() { return in_array($this->role, ['admin', 'admin_technical']); }
    public function getIsAdminAttribute() { return in_array($this->role, ['admin', 'admin_functional', 'admin_technical']); }
    public function getIsMentorAttribute() { return $this->role === 'mentor'; }
    public function getIsEmployeeAttribute() { return $this->role === 'employee'; }
    public function getIsApprovedAttribute() { return $this->status === 'approved'; }
}
