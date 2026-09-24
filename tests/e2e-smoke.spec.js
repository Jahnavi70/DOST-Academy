const { test, expect } = require('@playwright/test');

const baseURL = 'http://localhost:3000';

async function login(page, email, password) {
  await page.goto(baseURL);
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL(url => url.pathname !== '/', { timeout: 15000 });
}

async function logoutIfVisible(page) {
  const profile = page.getByRole('button', { name: /Profile|Admin|Mentor|Dr\.|Engr\./ }).first();
  if (await profile.isVisible().catch(() => false)) {
    await profile.click();
    const logout = page.getByText('Logout').first();
    if (await logout.isVisible().catch(() => false)) await logout.click();
  }
}

test.describe('DOST Academy LMS full browser smoke test', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', async dialog => dialog.accept());
    page.on('console', msg => {
      if (msg.type() === 'error') console.log('BROWSER_CONSOLE_ERROR:', msg.text());
    });
  });

  test('learner can search, open course, complete content, and view assignments', async ({ page }) => {
    await login(page, 'james@dost.gov.ph', 'password');
    await expect(page).toHaveURL(/user-home/);
    await expect(page.getByRole('heading', { name: /Available Curriculums/i })).toBeVisible();

    await page.getByRole('button', { name: 'Courses', exact: true }).first().click();
    await expect(page).toHaveURL(/courses/);
    await page.getByPlaceholder('Search curriculums...').fill('cloud');
    await expect(page.getByRole('heading', { name: 'Cloud Computing Basics' })).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByRole('heading', { name: 'Cybersecurity Fundamentals' })).toBeVisible({ timeout: 20000 });

    const cyberHeading = page.getByRole('heading', { name: 'Cybersecurity Fundamentals', exact: true }).first();
    const cyberCard = cyberHeading.locator('xpath=ancestor::div[.//button[normalize-space()="View Course" or normalize-space()="Start Learning"]][1]');
    await cyberCard.getByRole('button', { name: /View Course|Start Learning/ }).first().click();
    await expect(page).toHaveURL(/course-details\/\d+/);
    await expect(page.getByRole('heading', { name: 'Cybersecurity Fundamentals', exact: true })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Assigned Mentor', { exact: true })).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Course Content', exact: true })).toBeVisible({ timeout: 20000 });

    const startLearning = page.getByRole('button', { name: 'Start Learning' });
    if (await startLearning.isVisible().catch(() => false)) await startLearning.click();

    const markComplete = page.getByRole('button', { name: 'Mark Complete' }).first();
    if (await markComplete.isVisible().catch(() => false)) {
      await markComplete.click();
      await expect(page.getByText(/Completed/).first()).toBeVisible();
    }

    await page.getByRole('button', { name: 'Assignments', exact: true }).first().click();
    await expect(page).toHaveURL(/assignments/);
    await expect(page.getByRole('heading', { name: /My Assignments/i })).toBeVisible();
  });

  test('mentor can upload content and create an assessment', async ({ page }) => {
    await login(page, 'mentor.it@dost.gov.ph', 'password');
    await expect(page).toHaveURL(/mentor-dashboard/);
    await expect(page.getByRole('heading', { name: /Manage your courses/i })).toBeVisible();
    await expect(page.getByText('Upload Course Content')).toBeVisible();

    const contentForm = page.locator('form').filter({ hasText: 'Upload Course Content' });
    await contentForm.locator('select').first().selectOption({ label: 'Cybersecurity Fundamentals' });
    await contentForm.getByPlaceholder('Content title').fill(`Browser Tested Lesson ${Date.now()}`);
    await contentForm.getByPlaceholder('What the learner should read, watch, or do').fill('Automated browser smoke test content item.');
    await contentForm.getByPlaceholder('Optional video/resource URL').fill('https://example.com/dost-learning-resource');
    await contentForm.getByRole('button', { name: 'Publish Content' }).click();
    await expect(page.getByText('Course content published.')).toBeVisible({ timeout: 10000 }).catch(async () => {
      await expect(page.getByText(/Browser Tested Lesson/).first()).toBeVisible({ timeout: 10000 });
    });
    await expect(contentForm.getByPlaceholder('Content title')).toHaveValue('', { timeout: 15000 });

    const assessmentForm = page.locator('form').filter({ hasText: 'Assign Work' });
    const quizTitle = `Browser Test Quiz ${Date.now()}`;
    await assessmentForm.locator('select').first().selectOption({ label: 'Cybersecurity Fundamentals' });
    await assessmentForm.getByPlaceholder('Title').fill(quizTitle);
    await assessmentForm.getByPlaceholder(/Instructions/).fill('Answer the smoke-test quiz prompt.');
    await assessmentForm.locator('input[type="date"]').fill('2026-12-31');
    await assessmentForm.getByRole('button', { name: 'Assign to Learners' }).click();
    await expect(assessmentForm.getByPlaceholder('Title')).toHaveValue('', { timeout: 15000 });
  });

  test('admin can access management pages and see mentor users', async ({ page }) => {
    await login(page, 'admin@dost.gov.ph', 'password');
    await expect(page).toHaveURL(/admin-dashboard/);
    await expect(page.getByRole('heading', { name: /Welcome Admin/i })).toBeVisible();
    await expect(page.getByText('Mentors')).toBeVisible();

    await page.getByRole('button', { name: 'Users', exact: true }).first().click();
    await expect(page).toHaveURL(/manage-users/);
    await expect(page.getByText('mentor.it@dost.gov.ph')).toBeVisible();
    await expect(page.getByText('mentor.engineering@dost.gov.ph')).toBeVisible();

    await page.getByRole('button', { name: 'Courses', exact: true }).first().click();
    await expect(page).toHaveURL(/manage-courses/);
    await expect(page.getByText(/Mentor:/).first()).toBeVisible();
  });

  test('role protection isolates learner, mentor, and admin routes', async ({ page }) => {
    test.setTimeout(120000);
    await login(page, 'james@dost.gov.ph', 'password');
    await page.goto(`${baseURL}/mentor-dashboard`);
    await expect(page).toHaveURL(/user-home/, { timeout: 15000 });
    await page.goto(`${baseURL}/admin-dashboard`);
    await expect(page).toHaveURL(/user-home/, { timeout: 15000 });
    await page.goto(`${baseURL}/manage-users`);
    await expect(page).toHaveURL(/user-home/, { timeout: 15000 });
    await logoutIfVisible(page);

    await login(page, 'mentor.it@dost.gov.ph', 'password');
    await expect(page).toHaveURL(/mentor-dashboard/, { timeout: 15000 });
    await page.goto(`${baseURL}/admin-dashboard`);
    await expect(page).toHaveURL(/mentor-dashboard/, { timeout: 15000 });
    await page.goto(`${baseURL}/manage-users`);
    await expect(page).toHaveURL(/mentor-dashboard/, { timeout: 15000 });
    await page.goto(`${baseURL}/user-home`);
    await expect(page).toHaveURL(/mentor-dashboard/, { timeout: 15000 });
    await page.goto(`${baseURL}/dashboard`);
    await expect(page).toHaveURL(/mentor-dashboard/, { timeout: 15000 });
    await logoutIfVisible(page);

    await login(page, 'admin@dost.gov.ph', 'password');
    await expect(page).toHaveURL(/admin-dashboard/, { timeout: 15000 });
    await page.goto(`${baseURL}/mentor-dashboard`);
    await expect(page).toHaveURL(/admin-dashboard/, { timeout: 15000 });
    await page.goto(`${baseURL}/user-home`);
    await expect(page).toHaveURL(/admin-dashboard/, { timeout: 15000 });
    await page.goto(`${baseURL}/assignments`);
    await expect(page).toHaveURL(/admin-dashboard/, { timeout: 15000 });
    await logoutIfVisible(page);
  });
});
