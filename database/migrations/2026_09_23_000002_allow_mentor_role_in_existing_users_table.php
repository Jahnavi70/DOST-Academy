<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        if (DB::getDriverName() !== 'sqlite') return;

        DB::statement('PRAGMA foreign_keys=off');
        DB::statement("
            CREATE TABLE users_rebuild (
                id integer primary key autoincrement not null,
                name varchar not null,
                email varchar not null,
                password varchar not null,
                role varchar check (role in ('employee', 'mentor', 'admin')) not null default 'employee',
                department varchar,
                avatar varchar,
                bio text,
                created_at datetime,
                updated_at datetime
            )
        ");
        DB::statement("
            INSERT INTO users_rebuild (id, name, email, password, role, department, avatar, bio, created_at, updated_at)
            SELECT id, name, email, password, role, department, avatar, bio, created_at, updated_at FROM users
        ");
        DB::statement('DROP TABLE users');
        DB::statement('ALTER TABLE users_rebuild RENAME TO users');
        DB::statement('CREATE UNIQUE INDEX users_email_unique ON users (email)');
        DB::statement('PRAGMA foreign_keys=on');
    }

    public function down(): void {
        if (DB::getDriverName() !== 'sqlite') return;

        DB::statement("UPDATE users SET role = 'employee' WHERE role = 'mentor'");
        DB::statement('PRAGMA foreign_keys=off');
        DB::statement("
            CREATE TABLE users_rebuild (
                id integer primary key autoincrement not null,
                name varchar not null,
                email varchar not null,
                password varchar not null,
                role varchar check (role in ('employee', 'admin')) not null default 'employee',
                department varchar,
                avatar varchar,
                bio text,
                created_at datetime,
                updated_at datetime
            )
        ");
        DB::statement("
            INSERT INTO users_rebuild (id, name, email, password, role, department, avatar, bio, created_at, updated_at)
            SELECT id, name, email, password, role, department, avatar, bio, created_at, updated_at FROM users
        ");
        DB::statement('DROP TABLE users');
        DB::statement('ALTER TABLE users_rebuild RENAME TO users');
        DB::statement('CREATE UNIQUE INDEX users_email_unique ON users (email)');
        DB::statement('PRAGMA foreign_keys=on');
    }
};
