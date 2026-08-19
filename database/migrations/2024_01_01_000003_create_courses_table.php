<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('curriculum_id')->constrained('curriculums')->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->string('department')->nullable();
            $table->string('duration');
            $table->string('level')->default('Beginner');
            $table->string('image')->nullable();
            $table->enum('status', ['draft', 'pending', 'approved', 'published'])->default('draft');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('courses'); }
};
