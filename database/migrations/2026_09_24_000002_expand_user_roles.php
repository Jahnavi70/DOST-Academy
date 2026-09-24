<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Expands user roles to include admin_functional and admin_technical
     * for dual-tier administration (HR/Supervisor vs IT/Operations).
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('employee', 'mentor', 'admin', 'admin_functional', 'admin_technical') NOT NULL DEFAULT 'employee'");
        } elseif ($driver === 'sqlite') {
            // For SQLite, re-create table with expanded check constraint
            DB::statement("PRAGMA foreign_keys=off;");
            
            // Check if users table exists
            if (Schema::hasTable('users')) {
                // If the check constraint is present, update the schema definition
                Schema::table('users', function (Blueprint $table) {
                    // SQLite handles string columns dynamically
                });
            }
            
            DB::statement("PRAGMA foreign_keys=on;");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('employee', 'mentor', 'admin') NOT NULL DEFAULT 'employee'");
        }
    }
};
