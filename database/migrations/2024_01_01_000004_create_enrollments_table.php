<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('curriculum_id')->constrained('curriculums')->cascadeOnDelete();
            $table->enum('status', ['pending', 'enrolled', 'in_progress', 'completed', 'rejected'])->default('pending');
            $table->timestamps();
            $table->index('user_id');
            $table->unique(['user_id', 'curriculum_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('enrollments'); }
};
