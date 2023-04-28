import { resolve } from 'node:path';

import { test, testResultDir } from '@affine-test/kit/playwright';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { ElectronApplication } from 'playwright';
import { _electron as electron } from 'playwright';

let electronApp: ElectronApplication;
let page: Page;

test.beforeEach(async () => {
  electronApp = await electron.launch({
    args: [resolve(__dirname, '..')],
    executablePath: resolve(__dirname, '../node_modules/.bin/electron'),
    colorScheme: 'light',
  });
  page = await electronApp.firstWindow();
  // cleanup page data
  await page.evaluate(() => localStorage.clear());
});

test.afterEach(async () => {
  // cleanup page data
  await page.evaluate(() => localStorage.clear());
  await page.close();
  await electronApp.close();
});

test('new page', async () => {
  await page.getByTestId('new-page-button').click({
    delay: 100,
  });
  await page.waitForSelector('v-line');
  const flavour = await page.evaluate(
    // @ts-expect-error
    () => globalThis.currentWorkspace.flavour
  );
  expect(flavour).toBe('local');
});

test('app theme', async () => {
  await page.waitForSelector('v-line');
  const root = page.locator('html');
  {
    const themeMode = await root.evaluate(element =>
      element.getAttribute('data-theme')
    );
    expect(themeMode).toBe('light');
  }
  await page.screenshot({
    path: resolve(testResultDir, 'affine-light-theme-electron.png'),
  });
  await page.getByTestId('change-theme-dark').click();
  await page.waitForTimeout(50);
  {
    const themeMode = await root.evaluate(element =>
      element.getAttribute('data-theme')
    );
    expect(themeMode).toBe('dark');
  }
  await page.screenshot({
    path: resolve(testResultDir, 'affine-dark-theme-electron.png'),
  });
});

test('affine cloud disabled', async () => {
  const electronApp = await electron.launch({
    args: [resolve(__dirname, '..')],
    executablePath: resolve(__dirname, '../node_modules/.bin/electron'),
  });
  const page = await electronApp.firstWindow();
  await page.getByTestId('new-page-button').click({
    delay: 100,
  });
  await page.waitForSelector('v-line');
  await page.getByTestId('current-workspace').click();
  await page.getByTestId('sign-in-button').click();
  await page.getByTestId('disable-affine-cloud-modal').waitFor({
    state: 'visible',
  });
  await electronApp.close();
});
