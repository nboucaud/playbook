import { test } from '@affine-test/kit/playwright';
import { createPageWithTag } from '@affine-test/kit/utils/filter';
import { openHomePage } from '@affine-test/kit/utils/load-page';
import {
  clickNewPageButton,
  dragTo,
  getBlockSuiteEditorTitle,
  waitForEditorLoad,
} from '@affine-test/kit/utils/page-logic';
import { clickSideBarCurrentWorkspaceBanner } from '@affine-test/kit/utils/sidebar';
import { createLocalWorkspace } from '@affine-test/kit/utils/workspace';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const saveAsCollection = async (
  page: Page,
  options?: {
    collectionName?: string;
    skipInitialPage?: boolean;
  }
) => {
  if (!options?.skipInitialPage) {
    await openHomePage(page);
    await waitForEditorLoad(page);
  }
  await clickNewPageButton(page);
  await getBlockSuiteEditorTitle(page).click();
  await getBlockSuiteEditorTitle(page).fill('test page');
  await page.getByTestId('all-pages').click();
  const cell = page.getByTestId('page-list-item-title').getByText('test page');
  await expect(cell).toBeVisible();
  await page.getByTestId('create-first-filter').click({
    delay: 200,
  });
  await page
    .getByTestId('variable-select')
    .getByTestId(`filter-tag-Created`)
    .click({
      delay: 200,
    });
  await page.getByTestId('save-as-collection').click({
    delay: 200,
  });
  const title = page.getByTestId('input-collection-title');
  await title.isVisible();
  await title.fill(options?.collectionName ?? 'test collection');
  await page.getByTestId('save-collection').click();
  await page.waitForTimeout(100);
};

const createCollection = async (page: Page, name: string) => {
  await page.getByTestId('slider-bar-add-collection-button').click();
  const title = page.getByTestId('input-collection-title');
  await title.isVisible();
  await title.fill(name);
  await page.getByTestId('save-collection').click();
  await page.waitForTimeout(100);
};
const selectPageByIndex = async (page: Page, indexList: number[]) => {
  for (const index of indexList) {
    await page.getByTestId('page-list-item').nth(index).click();
  }
};
const checkPagesCount = async (page: Page, count: number) => {
  expect(await page.getByTestId('page-list-item').count()).toBe(count);
};

const init = async (page: Page) => {
  await openHomePage(page);
  await waitForEditorLoad(page);
};
const getAddPagesButton = (page: Page) => {
  return page.getByTestId('add-pages-button');
};
const getSaveCollectionButton = (page: Page) => {
  return page.getByTestId('save-collection');
};
const gotoAllPages = async (page: Page) => {
  await page.getByTestId('all-pages').click();
};
const getCollectionByName = (page: Page, name: string) => {
  return page.getByTestId('collection-item').getByText(name);
};
const getFilterButton = (page: Page) => {
  return page.getByTestId('create-first-filter');
};

const createConditionByName = async (page: Page, name: string) => {
  await getFilterButton(page).click({
    delay: 200,
  });
  await page
    .getByTestId('variable-select')
    .getByTestId(`filter-tag-${name}`)
    .click({
      delay: 200,
    });
};
const getConditionItem = (page: Page, index = 0) => {
  return page.getByTestId('condition-item').nth(index);
};
const changeCondition = async (page: Page, name: string, index = 0) => {
  const item = getConditionItem(page, index);
  await item.getByTestId('filter-name').click({ delay: 200 });
  await page
    .getByTestId('filter-name-select')
    .getByTestId(`filter-tag-${name}`)
    .click({ delay: 200 });
};
const clickArg = async (page: Page, index = 0, argIndex = 0) => {
  const item = getConditionItem(page, index);
  await item.getByTestId('filter-arg').nth(argIndex).click({ delay: 200 });
};
const selectTags = async (page: Page, nameList: string[]) => {
  for (const name of nameList) {
    await page
      .getByTestId('multi-select')
      .getByTestId(`multi-select-${name}`)
      .click();
  }
  await page.keyboard.press('Escape', { delay: 200 });
};

const getSaveAsCollectionButton = (page: Page) => {
  return page.getByTestId('save-as-collection');
};
const saveAsCollectionWithName = async (page: Page, name: string) => {
  await getSaveAsCollectionButton(page).click();
  await page.getByTestId('input-collection-title').fill(name);
  await getSaveCollectionButton(page).click();
};
const checkCollectionPageName = async (page: Page, name: string) => {
  return expect(
    await page.getByTestId('collection-page-name').textContent()
  ).toBe(name);
};
test('Show collections items in sidebar', async ({ page }) => {
  await saveAsCollection(page);
  const collections = page.getByTestId('collections');
  const items = collections.getByTestId('collection-item');
  expect(await items.count()).toBe(1);
  const first = items.first();
  expect(await first.textContent()).toBe('test collection');
  await first.getByTestId('fav-collapsed-button').click();
  const collectionPage = collections.getByTestId('collection-page').nth(0);
  expect(await collectionPage.textContent()).toBe('test page');
  await collectionPage.hover();
  await collectionPage.getByTestId('collection-page-options').click();
  const deletePage = page
    .getByTestId('collection-page-option')
    .getByText('Delete');
  await deletePage.click();
  await page.getByTestId('confirm-delete-page').click();
  expect(await collections.getByTestId('collection-page').count()).toBe(0);
  await first.hover();
  await first.getByTestId('collection-options').click();
  const deleteCollection = page
    .getByTestId('collection-option')
    .getByText('Delete');
  await deleteCollection.click();
  await page.waitForTimeout(50);
  expect(await items.count()).toBe(0);
  await saveAsCollection(page, {
    skipInitialPage: true,
  });
  expect(await items.count()).toBe(1);
  await createLocalWorkspace(
    {
      name: 'Test 1',
    },
    page
  );
  await waitForEditorLoad(page);
  expect(await items.count()).toBe(0);
  await clickSideBarCurrentWorkspaceBanner(page);
  await page.getByTestId('workspace-card').nth(0).click();
});

test('edit collection', async ({ page }) => {
  await saveAsCollection(page);
  const collections = page.getByTestId('collections');
  const items = collections.getByTestId('collection-item');
  expect(await items.count()).toBe(1);
  const first = items.first();
  await first.hover();
  await first.getByTestId('collection-options').click();
  const editCollection = page
    .getByTestId('collection-option')
    .getByText('Rename');
  await editCollection.click();
  const title = page.getByTestId('input-collection-title');
  await title.fill('123');
  await page.getByTestId('save-collection').click();
  await page.waitForTimeout(100);
  expect(await first.textContent()).toBe('123');
});

test('edit collection and change filter date', async ({ page }) => {
  await saveAsCollection(page);
  const collections = page.getByTestId('collections');
  const items = collections.getByTestId('collection-item');
  expect(await items.count()).toBe(1);
  const first = items.first();
  await first.hover();
  await first.getByTestId('collection-options').click();
  const editCollection = page
    .getByTestId('collection-option')
    .getByText('Rename');
  await editCollection.click();
  const title = page.getByTestId('input-collection-title');
  await title.fill('123');
  await page.getByTestId('save-collection').click();
  await page.waitForTimeout(100);
  expect(await first.textContent()).toBe('123');
});

test('create temporary filter by click tag', async ({ page }) => {
  await openHomePage(page);
  await waitForEditorLoad(page);
  await clickNewPageButton(page);
  await getBlockSuiteEditorTitle(page).click();
  await getBlockSuiteEditorTitle(page).fill('test page');
  await page.locator('affine-page-meta-data').click();
  await page.locator('.add-tag').click();
  await page.keyboard.type('TODO Tag');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await page.locator('.tag', { hasText: 'TODO Tag' }).click();
  const cell = page.getByTestId('page-list-item-title').getByText('test page');
  await expect(cell).toBeVisible();
  expect(await page.getByTestId('page-list-item').count()).toBe(1);
  await page.getByTestId('filter-arg').click();

  await page.getByTestId('multi-select-TODO Tag').click();
  expect(
    await page.getByTestId('page-list-item').count()
  ).toBeGreaterThanOrEqual(2);
});

test('add collection from sidebar', async ({ page }) => {
  await openHomePage(page);
  await waitForEditorLoad(page);
  await clickNewPageButton(page);
  await getBlockSuiteEditorTitle(page).click();
  await getBlockSuiteEditorTitle(page).fill('test page');
  await page.getByTestId('all-pages').click();
  const cell = page.getByTestId('page-list-item-title').getByText('test page');
  await expect(cell).toBeVisible();
  const nullCollection = page.getByTestId(
    'slider-bar-collection-null-description'
  );
  await expect(nullCollection).toBeVisible();
  await page.getByTestId('slider-bar-add-collection-button').click();
  const title = page.getByTestId('input-collection-title');
  await title.isVisible();
  await title.fill('test collection');
  await page.getByTestId('save-collection').click();
  await page.waitForTimeout(100);
  const collections = page.getByTestId('collections');
  const items = collections.getByTestId('collection-item');
  expect(await items.count()).toBe(1);
  await expect(nullCollection).not.toBeVisible();
});

test('create empty collection from sidebar', async ({ page }) => {
  await init(page);
  await createCollection(page, 'test');
  await getAddPagesButton(page).isVisible();
});
test('add page to collection by select', async ({ page }) => {
  await init(page);
  await createCollection(page, 'test');
  await getAddPagesButton(page).click();
  await selectPageByIndex(page, [1]);
  await getSaveCollectionButton(page).click();
  await checkPagesCount(page, 1);
});

test('add page to collection by drag', async ({ page }) => {
  await init(page);
  await createCollection(page, 'test');
  await gotoAllPages(page);
  const testCollection = getCollectionByName(page, 'test');
  await dragTo(
    page,
    page.getByTestId('page-list-item').first(),
    testCollection
  );
  await testCollection.click();
  await checkPagesCount(page, 1);
});
test('create filter', async ({ page }) => {
  await init(page);
  await gotoAllPages(page);
  await createPageWithTag(page, { title: 'test page', tags: ['TODO Tag'] });
  await gotoAllPages(page);
  await createConditionByName(page, 'Tags');
  await changeCondition(page, 'contains all');
  await clickArg(page);
  await selectTags(page, ['TODO Tag']);
  await checkPagesCount(page, 1);
});

test('save filters as collection', async ({ page }) => {
  await init(page);
  await gotoAllPages(page);
  await createPageWithTag(page, { title: 'test page', tags: ['TODO Tag'] });
  await gotoAllPages(page);
  await createConditionByName(page, 'Tags');
  await changeCondition(page, 'contains all');
  await clickArg(page);
  await selectTags(page, ['TODO Tag']);
  await checkPagesCount(page, 1);
  await saveAsCollectionWithName(page, 'test collection');
  await checkCollectionPageName(page, 'test collection');
  await checkPagesCount(page, 1);
});

test('edit collection rule', async ({ page }) => {
  await init(page);
  await gotoAllPages(page);
  await createPageWithTag(page, { title: 'test page1', tags: ['A'] });
  await createPageWithTag(page, { title: 'test page2', tags: ['B', 'A'] });
  await gotoAllPages(page);
  await createConditionByName(page, 'Tags');
  await changeCondition(page, 'contains all');
  await clickArg(page);
  await selectTags(page, ['A']);
  await saveAsCollectionWithName(page, 'test collection');
});
