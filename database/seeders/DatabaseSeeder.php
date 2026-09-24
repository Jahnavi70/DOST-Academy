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

        $defaultPassword = Hash::make('password');

        // ==========================================
        // 1. ADMINISTRATORS (Super, Functional, Technical)
        // ==========================================
        $superAdmin = User::create([
            'name' => 'DOST Executive Director (Super Admin)',
            'email' => 'admin@dost.gov.ph',
            'password' => $defaultPassword,
            'role' => 'admin',
            'status' => 'approved',
            'department' => 'DOST Central Executive Office',
            'bio' => 'Oversees agency-wide digital transformation, research governance, and academic LMS telemetry.',
        ]);

        $functionalAdmin = User::create([
            'name' => 'HR Director Elena Roxas',
            'email' => 'hr.admin@dost.gov.ph',
            'password' => $defaultPassword,
            'role' => 'admin_functional',
            'status' => 'approved',
            'department' => 'Human Resource & Development Service',
            'bio' => 'Manages national talent development, capacity-building curriculums, and staff accreditations.',
        ]);

        $technicalAdmin = User::create([
            'name' => 'IT Systems Head Engr. Marco Diaz',
            'email' => 'it.admin@dost.gov.ph',
            'password' => $defaultPassword,
            'role' => 'admin_technical',
            'status' => 'approved',
            'department' => 'Management Information System Division',
            'bio' => 'Manages server infrastructure, database clustering, role security policies, and API integrations.',
        ]);

        // ==========================================
        // 2. INSTITUTIONAL AGENCY BRANCHES (Curriculums)
        // ==========================================
        $curriculumsData = [
            [
                'title' => 'DOST-ASTI (Advanced Science & Technology Institute)',
                'category' => 'AI & Emerging Technologies',
                'description' => 'Philippine premier R&D institute for artificial intelligence, microelectronics, satellite earth observation, and high-performance computing infrastructure.',
                'level' => 'All Levels',
                'image' => '/assets/branch-it.jpg',
                'status' => 'published',
            ],
            [
                'title' => 'DOST-PAGASA (Atmospheric, Geophysical & Astronomical Services)',
                'category' => 'Disaster Risk & Climate Resilience',
                'description' => 'National meteorological telemetry, Doppler radar analytics, climate resilience modeling, and typhoon warning operations.',
                'level' => 'Intermediate',
                'image' => '/assets/branch-disaster.jpg',
                'status' => 'published',
            ],
            [
                'title' => 'DOST-PHIVOLCS (Volcanology & Seismology)',
                'category' => 'Disaster Risk & Climate Resilience',
                'description' => 'Seismic sensor networks, volcanic deformation monitoring, tsunami simulation protocols, and rapid earthquake damage assessment.',
                'level' => 'Intermediate',
                'image' => '/assets/branch-disaster.jpg',
                'status' => 'published',
            ],
            [
                'title' => 'DOST-ITDI (Industrial Technology Development Institute)',
                'category' => 'Advanced Materials & Nanotech',
                'description' => 'Applied materials science, polymer characterization, chemical standards, food processing engineering, and environmental technologies.',
                'level' => 'Intermediate',
                'image' => '/assets/branch-materials.jpg',
                'status' => 'published',
            ],
            [
                'title' => 'DOST-FNRI (Food & Nutrition Research Institute)',
                'category' => 'Biotechnology & Health',
                'description' => 'Nutritional biochemistry, clinical dietary surveys, functional food formulation, and national public health interventions.',
                'level' => 'Intermediate',
                'image' => '/assets/branch-biotech.jpg',
                'status' => 'published',
            ],
            [
                'title' => 'DOST-MIRDC (Metals Industry Research & Development Center)',
                'category' => 'Smart Manufacturing & Automation',
                'description' => 'Additive manufacturing (3D printing), precision CNC machining, industrial robotics, metallurgy, and automated production telemetry.',
                'level' => 'Advanced',
                'image' => '/assets/branch-manufacturing.jpg',
                'status' => 'published',
            ],
        ];

        $curriculums = [];
        foreach ($curriculumsData as $cData) {
            $curriculums[$cData['title']] = Curriculum::create($cData);
        }

        // ==========================================
        // 3. MENTORS (Assigned to Agency Branches)
        // ==========================================
        $mentorsData = [
            [
                'name' => 'Dr. Franz de Leon',
                'email' => 'mentor.asti@dost.gov.ph',
                'department' => 'DOST-ASTI Computing & AI Division',
                'curriculum_title' => 'DOST-ASTI (Advanced Science & Technology Institute)',
                'bio' => 'Senior Research Fellow in Deep Learning and Embedded Edge Computing with over 15 years in government IoT deployments.',
            ],
            [
                'name' => 'Engr. Nathaniel Servando',
                'email' => 'mentor.pagasa@dost.gov.ph',
                'department' => 'DOST-PAGASA Weather Forecasting Center',
                'curriculum_title' => 'DOST-PAGASA (Atmospheric, Geophysical & Astronomical Services)',
                'bio' => 'Lead Atmospheric Scientist specialized in Numerical Weather Prediction and Doppler Radar Telemetry.',
            ],
            [
                'name' => 'Dr. Teresito Bacolcol',
                'email' => 'mentor.phivolcs@dost.gov.ph',
                'department' => 'DOST-PHIVOLCS Geophysics Division',
                'curriculum_title' => 'DOST-PHIVOLCS (Volcanology & Seismology)',
                'bio' => 'Principal Seismologist directing national seismic sensor arrays and earthquake disaster hazard assessment.',
            ],
            [
                'name' => 'Dr. Annabelle Briones',
                'email' => 'mentor.itdi@dost.gov.ph',
                'department' => 'DOST-ITDI Materials Science Division',
                'curriculum_title' => 'DOST-ITDI (Industrial Technology Development Institute)',
                'bio' => 'Expert Materials Chemist specializing in biopolymer composites, packaging technologies, and ISO standards.',
            ],
            [
                'name' => 'Dr. Imelda Angeles-Agdeppa',
                'email' => 'mentor.fnri@dost.gov.ph',
                'department' => 'DOST-FNRI Nutritional Biochemistry',
                'curriculum_title' => 'DOST-FNRI (Food & Nutrition Research Institute)',
                'bio' => 'Lead Scientist in National Nutrition Surveys and micronutrient fortification programs across the Philippines.',
            ],
            [
                'name' => 'Engr. Robert Dizon',
                'email' => 'mentor.mirdc@dost.gov.ph',
                'department' => 'DOST-MIRDC Automation Division',
                'curriculum_title' => 'DOST-MIRDC (Metals Industry Research & Development Center)',
                'bio' => 'Mechatronics Engineer leading Industry 4.0 adoption, CNC tooling certification, and metal casting automation.',
            ],
        ];

        $mentors = [];
        foreach ($mentorsData as $mData) {
            $curr = $curriculums[$mData['curriculum_title']];
            $mentors[$mData['curriculum_title']] = User::create([
                'name' => $mData['name'],
                'email' => $mData['email'],
                'password' => $defaultPassword,
                'role' => 'mentor',
                'status' => 'approved',
                'department' => $mData['department'],
                'curriculum_id' => $curr->id,
                'bio' => $mData['bio'],
            ]);
        }

        // ==========================================
        // 4. AUTHENTIC COURSES & MODULES
        // ==========================================
        $coursesData = [
            [
                'curriculum_title' => 'DOST-ASTI (Advanced Science & Technology Institute)',
                'title' => 'Applied Machine Learning & AI in Public Services',
                'description' => 'Practical training on deploying Python-based neural networks, data cleaning pipelines, and predictive models for government agencies.',
                'duration' => '4 weeks',
                'level' => 'Beginner',
                'domain' => 'AI & Emerging Technologies',
                'lessons' => [
                    ['title' => 'Module 1: Orientation & Foundations of Data Engineering', 'duration' => 45, 'url' => 'https://www.youtube.com/watch?v=7eh4d6sabA0', 'desc' => 'Architecture of public sector machine learning pipelines and data ethics.'],
                    ['title' => 'Module 2: Supervised Classification with Scikit-Learn', 'duration' => 60, 'url' => 'https://www.youtube.com/watch?v=0B5eIE_1vpU', 'desc' => 'Implementing decision trees, random forests, and logistic regression on government datasets.'],
                    ['title' => 'Module 3: Neural Networks & Edge Deployment', 'duration' => 75, 'url' => 'https://www.youtube.com/watch?v=aircAruvnKk', 'desc' => 'Training deep neural networks and deploying lightweight models on edge microcomputers.'],
                ],
                'assessments' => [
                    ['title' => 'Knowledge Check Quiz 1: ML Foundations', 'type' => 'quiz', 'score' => 100, 'desc' => 'Evaluating core principles of model training, overfitting, and validation metrics.'],
                    ['title' => 'Capstone Project: Public Service Predictive Model', 'type' => 'project', 'score' => 100, 'desc' => 'End-to-end dataset analysis and deployed API endpoint.'],
                ],
            ],
            [
                'curriculum_title' => 'DOST-ASTI (Advanced Science & Technology Institute)',
                'title' => 'Satellite Telemetry & Earth Observation Data Analysis',
                'description' => 'Multi-spectral satellite imagery processing, geospatial analysis with QGIS and Python GDAL, and disaster monitoring telemetry.',
                'duration' => '6 weeks',
                'level' => 'Intermediate',
                'domain' => 'AI & Emerging Technologies',
                'lessons' => [
                    ['title' => 'Module 1: Remote Sensing Principles & Satellite Orbits', 'duration' => 50, 'url' => 'https://www.youtube.com/watch?v=7eh4d6sabA0', 'desc' => 'Electromagnetic spectrum, sensor resolutions, and Diwata/Sentinel constellation overview.'],
                    ['title' => 'Module 2: Multi-Spectral Band Indices (NDVI & NDWI)', 'duration' => 65, 'url' => 'https://www.youtube.com/watch?v=0B5eIE_1vpU', 'desc' => 'Calculating vegetation health and flood surface water extents.'],
                ],
                'assessments' => [
                    ['title' => 'Satellite Telemetry Milestone Quiz', 'type' => 'quiz', 'score' => 100, 'desc' => 'Remote sensing calibration and index interpretation.'],
                ],
            ],
            [
                'curriculum_title' => 'DOST-PAGASA (Atmospheric, Geophysical & Astronomical Services)',
                'title' => 'Doppler Radar Interpretation & Severe Weather Forecasting',
                'description' => 'Comprehensive operational training on analyzing Doppler radar reflectivity, velocity azimuth displays, and early typhoon trajectory warnings.',
                'duration' => '5 weeks',
                'level' => 'Intermediate',
                'domain' => 'Disaster Risk & Climate Resilience',
                'lessons' => [
                    ['title' => 'Module 1: Radar Telemetry & Reflectivity Signatures', 'duration' => 55, 'url' => 'https://www.youtube.com/watch?v=aircAruvnKk', 'desc' => 'Understanding dBZ values, hydrometeor classification, and ground clutter attenuation.'],
                    ['title' => 'Module 2: Mesoscale Convective Systems & Typhoon Eyewalls', 'duration' => 70, 'url' => 'https://www.youtube.com/watch?v=0B5eIE_1vpU', 'desc' => 'Tracking storm cell dynamics and heavy precipitation swaths.'],
                ],
                'assessments' => [
                    ['title' => 'Radar Analysis Operational Assessment', 'type' => 'practical', 'score' => 100, 'desc' => 'Real-time case study decoding Doppler velocity anomalies during severe storm events.'],
                ],
            ],
            [
                'curriculum_title' => 'DOST-PHIVOLCS (Volcanology & Seismology)',
                'title' => 'Seismic Hazard Mapping & Rapid Earthquake Damage Assessment',
                'description' => 'Seismological sensor telemetry, REDAS (Rapid Earthquake Damage Assessment System) training, and ground-shaking hazard zonation.',
                'duration' => '4 weeks',
                'level' => 'Intermediate',
                'domain' => 'Disaster Risk & Climate Resilience',
                'lessons' => [
                    ['title' => 'Module 1: Seismic Wave Propagation & Sensor Networks', 'duration' => 45, 'url' => 'https://www.youtube.com/watch?v=7eh4d6sabA0', 'desc' => 'P and S wave telemetry, broadband seismometers, and epicenter triangulation.'],
                    ['title' => 'Module 2: REDAS Software Execution & Exposure Database', 'duration' => 60, 'url' => 'https://www.youtube.com/watch?v=aircAruvnKk', 'desc' => 'Simulating ground motion and estimating building damage probabilities.'],
                ],
                'assessments' => [
                    ['title' => 'REDAS Simulation Practical Examination', 'type' => 'practical', 'score' => 100, 'desc' => 'Generating impact shake maps for local government units.'],
                ],
            ],
            [
                'curriculum_title' => 'DOST-ITDI (Industrial Technology Development Institute)',
                'title' => 'Polymer Characterization & Green Nanomaterials in Industry',
                'description' => 'Thermomechanical testing, FTIR spectroscopy, biodegradable packaging formulations, and ISO quality assurance in industrial chemistry.',
                'duration' => '6 weeks',
                'level' => 'Intermediate',
                'domain' => 'Advanced Materials & Nanotech',
                'lessons' => [
                    ['title' => 'Module 1: Advanced Polymer Synthesis & Testing Protocols', 'duration' => 50, 'url' => 'https://www.youtube.com/watch?v=0B5eIE_1vpU', 'desc' => 'Tensile testing, melt flow index, and environmental degradation standards.'],
                ],
                'assessments' => [
                    ['title' => 'Polymer Testing Knowledge Quiz', 'type' => 'quiz', 'score' => 100, 'desc' => 'Spectroscopy analysis and laboratory compliance standards.'],
                ],
            ],
            [
                'curriculum_title' => 'DOST-FNRI (Food & Nutrition Research Institute)',
                'title' => 'Public Nutrition Interventions & Anthropometric Analytics',
                'description' => 'Epidemiological survey methods, dietary intake modeling, community-based fortification interventions, and clinical nutritional statistics.',
                'duration' => '4 weeks',
                'level' => 'Beginner',
                'domain' => 'Biotechnology & Health',
                'lessons' => [
                    ['title' => 'Module 1: Anthropometric Measurement & Data Standards', 'duration' => 40, 'url' => 'https://www.youtube.com/watch?v=7eh4d6sabA0', 'desc' => 'WHO Child Growth Standards and statistical calibration for field researchers.'],
                ],
                'assessments' => [
                    ['title' => 'Nutritional Data Analysis Assessment', 'type' => 'quiz', 'score' => 100, 'desc' => 'Statistical calculation of Z-scores and prevalence indicators.'],
                ],
            ],
            [
                'curriculum_title' => 'DOST-MIRDC (Metals Industry Research & Development Center)',
                'title' => 'Industrial Automation, CNC Machining & IoT Telemetry',
                'description' => 'G-code programming, multi-axis CNC machine operation, industrial sensor integration, and smart factory preventive maintenance.',
                'duration' => '6 weeks',
                'level' => 'Advanced',
                'domain' => 'Smart Manufacturing & Automation',
                'lessons' => [
                    ['title' => 'Module 1: Precision G-Code Toolpaths & Tooling Offsets', 'duration' => 60, 'url' => 'https://www.youtube.com/watch?v=aircAruvnKk', 'desc' => 'CAD/CAM toolpath generation, spindle speeds, and surface finish optimization.'],
                ],
                'assessments' => [
                    ['title' => 'CNC Practical Machining Assessment', 'type' => 'practical', 'score' => 100, 'desc' => 'Precision manufacturing tolerance verification.'],
                ],
            ],
        ];

        $createdCourses = [];
        foreach ($coursesData as $c) {
            $curr = $curriculums[$c['curriculum_title']];
            $mentor = $mentors[$c['curriculum_title']];

            $course = Course::create([
                'curriculum_id' => $curr->id,
                'mentor_id' => $mentor->id,
                'title' => $c['title'],
                'description' => $c['description'],
                'department' => $curr->title,
                'domain' => $c['domain'],
                'duration' => $c['duration'],
                'level' => $c['level'],
                'image' => $curr->image,
                'status' => 'published',
            ]);

            foreach ($c['lessons'] as $idx => $lesson) {
                CourseContent::create([
                    'course_id' => $course->id,
                    'mentor_id' => $mentor->id,
                    'title' => $lesson['title'],
                    'description' => $lesson['desc'],
                    'content_type' => 'lesson',
                    'content_url' => $lesson['url'],
                    'duration_minutes' => $lesson['duration'],
                    'sort_order' => $idx + 1,
                    'is_published' => true,
                ]);
            }

            foreach ($c['assessments'] as $assess) {
                Assignment::create([
                    'course_id' => $course->id,
                    'mentor_id' => $mentor->id,
                    'title' => $assess['title'],
                    'description' => $assess['desc'],
                    'assessment_type' => $assess['type'],
                    'max_score' => $assess['score'],
                    'due_date' => now()->addDays(14)->toDateString(),
                    'status' => 'pending',
                ]);
            }

            $createdCourses[$c['title']] = $course;
        }

        // ==========================================
        // 5. LEARNERS / EMPLOYEES (Affiliated with Agencies)
        // ==========================================
        $learnersData = [
            [
                'name' => 'Maria Santos',
                'email' => 'user@dost.gov.ph', // standard demo account
                'department' => 'DOST-ASTI Computing & AI Division',
                'curriculum_title' => 'DOST-ASTI (Advanced Science & Technology Institute)',
                'bio' => 'Junior Software Engineer interested in machine learning and data pipelines.',
            ],
            [
                'name' => 'Juan Dela Cruz',
                'email' => 'juan.delacruz@dost.gov.ph',
                'department' => 'DOST-PAGASA Weather Forecasting Center',
                'curriculum_title' => 'DOST-PAGASA (Atmospheric, Geophysical & Astronomical Services)',
                'bio' => 'Meteorological Specialist tracking typhoon dynamics and Doppler radar readings.',
            ],
            [
                'name' => 'Ana Reyes',
                'email' => 'ana.reyes@dost.gov.ph',
                'department' => 'DOST-PHIVOLCS Geophysics Division',
                'curriculum_title' => 'DOST-PHIVOLCS (Volcanology & Seismology)',
                'bio' => 'Geophysicist working on real-time earthquake telemetry networks.',
            ],
            [
                'name' => 'Mark Villanueva',
                'email' => 'mark.villanueva@dost.gov.ph',
                'department' => 'DOST-ITDI Materials Science Division',
                'curriculum_title' => 'DOST-ITDI (Industrial Technology Development Institute)',
                'bio' => 'Research Assistant testing biodegradable composites and polymer durability.',
            ],
            [
                'name' => 'Clara Bautista',
                'email' => 'clara.bautista@dost.gov.ph',
                'department' => 'DOST-FNRI Nutritional Biochemistry',
                'curriculum_title' => 'DOST-FNRI (Food & Nutrition Research Institute)',
                'bio' => 'Nutritionist conducting national dietary intake and fortification studies.',
            ],
            [
                'name' => 'Gabriel Tan',
                'email' => 'gabriel.tan@dost.gov.ph',
                'department' => 'DOST-MIRDC Automation Division',
                'curriculum_title' => 'DOST-MIRDC (Metals Industry Research & Development Center)',
                'bio' => 'Mechanical Technician operating multi-axis CNC milling machines.',
            ],
        ];

        $learners = [];
        foreach ($learnersData as $lData) {
            $curr = $curriculums[$lData['curriculum_title']];
            $learners[$lData['name']] = User::create([
                'name' => $lData['name'],
                'email' => $lData['email'],
                'password' => $defaultPassword,
                'role' => 'employee',
                'status' => 'approved',
                'department' => $lData['department'],
                'curriculum_id' => $curr->id,
                'bio' => $lData['bio'],
            ]);
        }

        // ==========================================
        // 6. ENROLLMENTS, PROGRESS & CERTIFICATES
        // ==========================================
        // Learner 1: Maria Santos -> Completed "Applied Machine Learning & AI in Public Services"
        $maria = $learners['Maria Santos'];
        $course1 = $createdCourses['Applied Machine Learning & AI in Public Services'];

        Enrollment::create([
            'user_id' => $maria->id,
            'course_id' => $course1->id,
            'curriculum_id' => $course1->curriculum_id,
            'status' => 'completed',
        ]);

        // Complete all lessons
        foreach ($course1->contents as $content) {
            CourseContentCompletion::create([
                'course_content_id' => $content->id,
                'course_id' => $course1->id,
                'user_id' => $maria->id,
                'completed_at' => now()->subDays(2),
            ]);
        }

        Progress::create([
            'user_id' => $maria->id,
            'course_id' => $course1->id,
            'progress' => 100,
            'status' => 'completed',
        ]);

        Certificate::create([
            'user_id' => $maria->id,
            'course_id' => $course1->id,
            'certificate_number' => 'DOST-CERT-ASTI-8801',
            'issued_date' => now()->subDays(2)->toDateString(),
        ]);

        Notification::create([
            'user_id' => $maria->id,
            'title' => 'Certificate Issued: Applied Machine Learning',
            'message' => 'Congratulations! Your certificate DOST-CERT-ASTI-8801 has been issued and is available for download.',
            'type' => 'certificate',
            'is_read' => true,
        ]);

        // Learner 2: Juan Dela Cruz -> Completed "Doppler Radar Interpretation & Severe Weather Forecasting"
        $juan = $learners['Juan Dela Cruz'];
        $course2 = $createdCourses['Doppler Radar Interpretation & Severe Weather Forecasting'];

        Enrollment::create([
            'user_id' => $juan->id,
            'course_id' => $course2->id,
            'curriculum_id' => $course2->curriculum_id,
            'status' => 'completed',
        ]);

        foreach ($course2->contents as $content) {
            CourseContentCompletion::create([
                'course_content_id' => $content->id,
                'course_id' => $course2->id,
                'user_id' => $juan->id,
                'completed_at' => now()->subDay(),
            ]);
        }

        Progress::create([
            'user_id' => $juan->id,
            'course_id' => $course2->id,
            'progress' => 100,
            'status' => 'completed',
        ]);

        Certificate::create([
            'user_id' => $juan->id,
            'course_id' => $course2->id,
            'certificate_number' => 'DOST-CERT-PAGASA-7702',
            'issued_date' => now()->subDay()->toDateString(),
        ]);

        // Learner 3: Ana Reyes -> In Progress on PHIVOLCS Course
        $ana = $learners['Ana Reyes'];
        $course3 = $createdCourses['Seismic Hazard Mapping & Rapid Earthquake Damage Assessment'];

        Enrollment::create([
            'user_id' => $ana->id,
            'course_id' => $course3->id,
            'curriculum_id' => $course3->curriculum_id,
            'status' => 'in_progress',
        ]);

        $firstContent = $course3->contents->first();
        if ($firstContent) {
            CourseContentCompletion::create([
                'course_content_id' => $firstContent->id,
                'course_id' => $course3->id,
                'user_id' => $ana->id,
                'completed_at' => now()->subHours(6),
            ]);
        }

        Progress::create([
            'user_id' => $ana->id,
            'course_id' => $course3->id,
            'progress' => 50,
            'status' => 'in_progress',
        ]);

        // Learner 4: Mark Villanueva -> Enrolled in ITDI Course
        $mark = $learners['Mark Villanueva'];
        $course4 = $createdCourses['Polymer Characterization & Green Nanomaterials in Industry'];

        Enrollment::create([
            'user_id' => $mark->id,
            'course_id' => $course4->id,
            'curriculum_id' => $course4->curriculum_id,
            'status' => 'in_progress',
        ]);

        Progress::create([
            'user_id' => $mark->id,
            'course_id' => $course4->id,
            'progress' => 25,
            'status' => 'in_progress',
        ]);

        // Learner 5: Clara Bautista -> Pending Enrollment Request in FNRI Course
        $clara = $learners['Clara Bautista'];
        $course5 = $createdCourses['Public Nutrition Interventions & Anthropometric Analytics'];

        Enrollment::create([
            'user_id' => $clara->id,
            'course_id' => $course5->id,
            'curriculum_id' => $course5->curriculum_id,
            'status' => 'pending',
        ]);

        Notification::create([
            'user_id' => $mentors['DOST-FNRI (Food & Nutrition Research Institute)']->id,
            'title' => 'New Enrollment Request',
            'message' => 'Clara Bautista requested to enroll in Public Nutrition Interventions & Anthropometric Analytics.',
            'type' => 'enrollment',
            'is_read' => false,
        ]);

        // ==========================================
        // 7. CORE DOST SKILLS & COMPETENCY MATRIX
        // ==========================================
        $skillsData = [
            ['name' => 'R&D Grant Lifecycle & Technical Writing', 'category' => 'Governance'],
            ['name' => 'Laboratory ISO & Scientific Safety Protocols', 'category' => 'Quality Standards'],
            ['name' => 'Data Engineering & Emerging Technologies', 'category' => 'Digital Tech'],
            ['name' => 'Disaster Telemetry & Climate Resilience', 'category' => 'Resilience'],
            ['name' => 'IP Commercialization & Tech Transfer', 'category' => 'Innovation'],
        ];

        foreach ($skillsData as $s) {
            $skill = Skill::create($s);
            // Attach skills to sample learners
            DB::table('user_skills')->insert([
                'user_id' => $maria->id,
                'skill_id' => $skill->id,
                'progress' => rand(70, 95),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            DB::table('user_skills')->insert([
                'user_id' => $juan->id,
                'skill_id' => $skill->id,
                'progress' => rand(65, 90),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
