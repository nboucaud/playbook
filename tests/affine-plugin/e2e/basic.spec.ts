import { test } from '@affine-test/kit/playwright';
import { openHomePage } from '@affine-test/kit/utils/load-page';
import { waitEditorLoad } from '@affine-test/kit/utils/page-logic';
import { expect } from '@playwright/test';

test('plugin should exist', async ({ page }) => {
  await openHomePage(page);
  await waitEditorLoad(page);
  const packageJson = await page.evaluate(
    // @ts-expect-error
    () => window.__pluginPackageJson__,
    []
  );
  await page.route('**/plugins/**/package.json', route => route.fetch(), {
    times: 3,
  });
  await page.waitForTimeout(50);
  expect(packageJson).toEqual([
    {
      name: '@affine/bookmark-plugin',
      affinePlugin: expect.anything(),
    },
    {
      name: '@affine/copilot-plugin',
      affinePlugin: expect.anything(),
    },
    {
      name: '@affine/hello-world-plugin',
      affinePlugin: expect.anything(),
    },
  ]);
});
