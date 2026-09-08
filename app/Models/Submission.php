<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Submission extends Model {
    protected $fillable = ['assignment_id', 'user_id', 'content', 'file_path', 'result', 'feedback', 'status'];

    public function assignment() { return $this->belongsTo(Assignment::class); }
    public function user() { return $this->belongsTo(User::class); }
}
