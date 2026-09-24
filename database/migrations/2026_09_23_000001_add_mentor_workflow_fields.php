<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('courses', function (Blueprint $table) {
            $table->foreignId('mentor_id')->nullable()->after('curriculum_id')->constrained('users')->nullOnDelete();
            $table->string('domain')->nullable()->after('department');
        });

        Schema::table('assignments', function (Blueprint $table) {
            $table->foreignId('mentor_id')->nullable()->after('course_id')->constrained('users')->nullOnDelete();
            $table->string('assessment_type')->default('assignment')->after('description');
            $table->integer('max_score')->default(100)->after('assessment_type');
        });

        Schema::table('submissions', function (Blueprint $table) {
            $table->text('feedback')->nullable()->after('result');
        });
    }

    public function down(): void {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn('feedback');
        });

        Schema::table('assignments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('mentor_id');
            $table->dropColumn(['assessment_type', 'max_score']);
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->dropConstrainedForeignId('mentor_id');
            $table->dropColumn('domain');
        });
    }
};
