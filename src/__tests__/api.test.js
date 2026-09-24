import { authAPI, curriculumAPI, enrollmentAPI, progressAPI, skillAPI, recommendationAPI, assignmentAPI, certificateAPI, adminAPI, mentorAPI } from '../services/api';

describe('API Service', () => {
  test('authAPI has all methods', () => {
    expect(authAPI.login).toBeDefined();
    expect(authAPI.register).toBeDefined();
    expect(authAPI.me).toBeDefined();
    expect(authAPI.updateProfile).toBeDefined();
    expect(authAPI.logout).toBeDefined();
  });

  test('curriculumAPI has all methods', () => {
    expect(curriculumAPI.getAll).toBeDefined();
    expect(curriculumAPI.getOne).toBeDefined();
    expect(curriculumAPI.create).toBeDefined();
    expect(curriculumAPI.update).toBeDefined();
    expect(curriculumAPI.delete).toBeDefined();
  });

  test('enrollmentAPI has all methods', () => {
    expect(enrollmentAPI.enroll).toBeDefined();
    expect(enrollmentAPI.getAll).toBeDefined();
    expect(enrollmentAPI.userEnrollments).toBeDefined();
    expect(enrollmentAPI.updateStatus).toBeDefined();
  });

  test('progressAPI has all methods', () => {
    expect(progressAPI.getAll).toBeDefined();
    expect(progressAPI.update).toBeDefined();
    expect(progressAPI.dashboard).toBeDefined();
  });

  test('skillAPI has all methods', () => {
    expect(skillAPI.getAll).toBeDefined();
    expect(skillAPI.userSkills).toBeDefined();
    expect(skillAPI.updateProgress).toBeDefined();
  });

  test('recommendationAPI has get method', () => {
    expect(recommendationAPI.get).toBeDefined();
  });

  test('assignmentAPI has all methods', () => {
    expect(assignmentAPI.getAll).toBeDefined();
    expect(assignmentAPI.create).toBeDefined();
    expect(assignmentAPI.submit).toBeDefined();
  });

  test('mentorAPI has course and content methods', () => {
    expect(mentorAPI.dashboard).toBeDefined();
    expect(mentorAPI.courses).toBeDefined();
    expect(mentorAPI.createCourse).toBeDefined();
    expect(mentorAPI.createContent).toBeDefined();
    expect(mentorAPI.createAssignment).toBeDefined();
    expect(mentorAPI.grade).toBeDefined();
  });

  test('certificateAPI has all methods', () => {
    expect(certificateAPI.getAll).toBeDefined();
    expect(certificateAPI.generate).toBeDefined();
  });

  test('adminAPI has all methods', () => {
    expect(adminAPI.dashboard).toBeDefined();
    expect(adminAPI.users).toBeDefined();
    expect(adminAPI.updateUser).toBeDefined();
    expect(adminAPI.deleteUser).toBeDefined();
    expect(adminAPI.allProgress).toBeDefined();
  });
});
