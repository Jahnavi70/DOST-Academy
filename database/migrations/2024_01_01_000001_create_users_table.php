<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['employee', 'mentor', 'admin'])->default('employee');
            $table->string('status')->default('pending');
            $table->unsignedBigInteger('curriculum_id')->nullable();
            $table->string('department')->nullable();
            $table->string('avatar')->nullable();
            $table->text('bio')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('users'); }
};
