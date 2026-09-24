<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Skill extends Model {
    use HasFactory;
    protected $fillable = ['name', 'category'];
    protected $table = 'skills';
    public function users() { return $this->belongsToMany(\App\Models\User::class, 'user_skills')->withPivot('progress'); }
}
