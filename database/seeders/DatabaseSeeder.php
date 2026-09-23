<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Curriculum;
use App\Models\Course;
use App\Models\CourseContent;
use App\Models\CourseContentCompletion;
use App\Models\Assignment;
use App\Models\Submission;
use App\Models\Enrollment;
use App\Models\Progress;
use App\Models\Certificate;
use App\Models\Notification;
use App\Models\Skill;

class DatabaseSeeder extends Seeder {
    public function run(): void {
        // Disable foreign key constraints during purge
        $driver = DB::getDriverName();
        if ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF;');
        } elseif ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS = 0;');
        }

        CourseContentCompletion::query()->delete();
        CourseContent::query()->delete();
        Submission::query()->delete();
        Assignment::query()->delete();
        Progress::query()->delete();
        Enrollment::query()->delete();
        Certificate::query()->delete();
        Notification::query()->delete();
        DB::table('user_skills')->delete();
        Skill::query()->delete();
        Course::query()->delete();
        Curriculum::query()->delete();
        User::query()->delete();

        if ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = ON;');
        } elseif ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS = 1;');
        }

        // Pre-register ONLY one Admin User
        User::create([
            'name' => 'DOST Administrator',
            'email' => 'admin@dost.gov.ph',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status' => 'approved',
            'department' => 'Administration',
        ]);
    }
}
