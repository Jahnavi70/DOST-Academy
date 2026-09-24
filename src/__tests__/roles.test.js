import {
  canAccess,
  roleHome,
  navItemsFor,
  employeeNavItems,
  mentorNavItems,
  adminNavItems,
} from '../utils/roles';

describe('role helpers', () => {
  test('roleHome maps each role', () => {
    expect(roleHome('admin')).toBe('/admin-dashboard');
    expect(roleHome('mentor')).toBe('/mentor-dashboard');
    expect(roleHome('employee')).toBe('/user-home');
    expect(roleHome(undefined)).toBe('/');
  });

  test('employee cannot access mentor or admin routes', () => {
    expect(canAccess('employee', '/mentor-dashboard')).toBe(false);
    expect(canAccess('employee', '/admin-dashboard')).toBe(false);
    expect(canAccess('employee', '/manage-users')).toBe(false);
    expect(canAccess('employee', '/user-home')).toBe(true);
    expect(canAccess('employee', '/courses')).toBe(true);
    expect(canAccess('employee', '/edit-profile')).toBe(true);
  });

  test('mentor cannot access admin or employee-only routes', () => {
    expect(canAccess('mentor', '/admin-dashboard')).toBe(false);
    expect(canAccess('mentor', '/manage-users')).toBe(false);
    expect(canAccess('mentor', '/user-home')).toBe(false);
    expect(canAccess('mentor', '/dashboard')).toBe(false);
    expect(canAccess('mentor', '/assignments')).toBe(false);
    expect(canAccess('mentor', '/certificates')).toBe(false);
    expect(canAccess('mentor', '/mentor-dashboard')).toBe(true);
    expect(canAccess('mentor', '/courses')).toBe(true);
  });

  test('admin cannot access mentor or employee-only routes', () => {
    expect(canAccess('admin', '/mentor-dashboard')).toBe(false);
    expect(canAccess('admin', '/user-home')).toBe(false);
    expect(canAccess('admin', '/dashboard')).toBe(false);
    expect(canAccess('admin', '/assignments')).toBe(false);
    expect(canAccess('admin', '/admin-dashboard')).toBe(true);
    expect(canAccess('admin', '/manage-users')).toBe(true);
    expect(canAccess('admin', '/progress-reports')).toBe(true);
    expect(canAccess('admin', '/edit-profile')).toBe(true);
  });

  test('nav items are role-specific', () => {
    expect(employeeNavItems().map(i => i.path)).not.toContain('/mentor-dashboard');
    expect(employeeNavItems().map(i => i.path)).not.toContain('/admin-dashboard');
    expect(mentorNavItems().map(i => i.path)).not.toContain('/user-home');
    expect(mentorNavItems().map(i => i.path)).not.toContain('/admin-dashboard');
    expect(adminNavItems().map(i => i.path)).not.toContain('/mentor-dashboard');
    expect(adminNavItems().map(i => i.path)).not.toContain('/user-home');
    expect(navItemsFor('mentor').map(i => i.label)).toContain('Mentor Dashboard');
    expect(navItemsFor('admin').map(i => i.label)).toContain('Users');
    expect(navItemsFor('employee').map(i => i.label)).toContain('Assignments');
  });
});
