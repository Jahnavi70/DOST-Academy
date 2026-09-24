<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificate extends Model {
    use HasFactory;
    protected $fillable = ['user_id', 'course_id', 'certificate_number', 'issued_date'];
    protected $table = 'certificates';
    protected $casts = ['issued_date' => 'date'];
    public function user() { return $this->belongsTo(\App\Models\User::class); }
    public function course() { return $this->belongsTo(\App\Models\Course::class); }
}
