<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        try {
            Schema::table('enrollments', function (Blueprint $table) {
                $table->index('user_id');
            });
        } catch (\Throwable $e) {}

        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'curriculum_id']);
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->foreignId('course_id')->nullable()->after('curriculum_id')->constrained('courses')->nullOnDelete();
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->unique(['user_id', 'course_id']);
        });
    }

    public function down(): void {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'course_id']);
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('course_id');
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->unique(['user_id', 'curriculum_id']);
        });
    }
};
