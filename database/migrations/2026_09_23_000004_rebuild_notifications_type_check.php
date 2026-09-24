<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('notifications_new', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('message');
            $table->enum('type', ['enrollment', 'approval', 'certificate', 'assignment', 'grade', 'general'])->default('general');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });

        $rows = DB::table('notifications')->get();
        foreach ($rows as $row) {
            $type = in_array($row->type, ['enrollment', 'approval', 'certificate', 'assignment', 'grade', 'general'], true)
                ? $row->type : 'general';
            DB::table('notifications_new')->insert([
                'id' => $row->id,
                'user_id' => $row->user_id,
                'title' => $row->title,
                'message' => $row->message,
                'type' => $type,
                'is_read' => $row->is_read,
                'created_at' => $row->created_at,
                'updated_at' => $row->updated_at,
            ]);
        }

        Schema::drop('notifications');
        Schema::rename('notifications_new', 'notifications');
    }

    public function down(): void {
        // Non-destructive: leave rebuilt table in place.
    }
};
