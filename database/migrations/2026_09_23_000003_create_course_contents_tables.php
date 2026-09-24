<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('course_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('mentor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('content_type', ['lesson', 'video', 'document', 'link', 'practical'])->default('lesson');
            $table->string('content_url')->nullable();
            $table->string('file_path')->nullable();
            $table->integer('duration_minutes')->default(30);
            $table->integer('sort_order')->default(1);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        Schema::create('course_content_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_content_id')->constrained('course_contents')->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique(['course_content_id', 'user_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('course_content_completions');
        Schema::dropIfExists('course_contents');
    }
};
