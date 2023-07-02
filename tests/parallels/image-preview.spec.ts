import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import fs from 'fs';

import { openHomePage } from '../libs/load-page';
import {
  getBlockSuiteEditorTitle,
  newPage,
  waitEditorLoad,
} from '../libs/page-logic';

async function importImage(page: Page, url: string) {
  await page.evaluate(
    ([url]) => {
      const clipData = {
        'text/html': `<img alt={'Sample image'} src=${url} />`,
      };
      const e = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
      });
      Object.defineProperty(e, 'target', {
        writable: false,
        value: document.body,
      });
      Object.entries(clipData).forEach(([key, value]) => {
        e.clipboardData?.setData(key, value);
      });
      document.body.dispatchEvent(e);
    },
    [url]
  );
  await page.waitForTimeout(500);
}

async function closeImagePreviewModal(page: Page) {
  await page
    .getByTestId('image-preview-modal')
    .getByTestId('image-preview-close-button')
    .first()
    .click();
  await page.waitForTimeout(500);
}

test('image preview should be shown', async ({ page }) => {
  await openHomePage(page);
  await waitEditorLoad(page);
  await newPage(page);
  const title = await getBlockSuiteEditorTitle(page);
  await title.click();
  await page.keyboard.press('Enter');
  await importImage(page, 'http://localhost:8081/large-image.png');
  await page.locator('img').first().dblclick();
  const locator = page.getByTestId('image-preview-modal');
  expect(locator.isVisible()).toBeTruthy();
  await closeImagePreviewModal(page);
  expect(await locator.isVisible()).toBeFalsy();
});

test('image go left and right', async ({ page }) => {
  await openHomePage(page);
  await waitEditorLoad(page);
  await newPage(page);
  let blobId: string;
  {
    const title = await getBlockSuiteEditorTitle(page);
    await title.click();
    await page.keyboard.press('Enter');
    await importImage(page, 'http://localhost:8081/large-image.png');
    await page.locator('img').first().dblclick();
    await page.waitForTimeout(500);
    blobId = (await page
      .locator('img')
      .nth(1)
      .getAttribute('data-blob-id')) as string;
    expect(blobId).toBeTruthy();
    await closeImagePreviewModal(page);
  }
  {
    const title = await getBlockSuiteEditorTitle(page);
    await title.click();
    await page.keyboard.press('Enter');
    await importImage(page, 'http://localhost:8081/affine-preview.png');
  }
  const locator = page.getByTestId('image-preview-modal');
  expect(locator.isVisible()).toBeTruthy();
  await page.locator('img').first().dblclick();
  await page.waitForTimeout(1000);
  {
    const newBlobId = (await page
      .locator('img[data-blob-id]')
      .first()
      .getAttribute('data-blob-id')) as string;
    expect(newBlobId).not.toBe(blobId);
  }
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(1000);
  {
    const newBlobId = (await page
      .locator('img[data-blob-id]')
      .first()
      .getAttribute('data-blob-id')) as string;
    expect(newBlobId).toBe(blobId);
  }
});

test('image able to zoom in and out with mouse scroll', async ({ page }) => {
  await openHomePage(page);
  await waitEditorLoad(page);
  await newPage(page);
  let blobId: string;
  {
    const title = await getBlockSuiteEditorTitle(page);
    await title.click();
    await page.keyboard.press('Enter');
    await importImage(page, 'http://localhost:8081/large-image.png');
    await page.locator('img').first().dblclick();
    await page.waitForTimeout(500);
    blobId = (await page
      .locator('img')
      .nth(1)
      .getAttribute('data-blob-id')) as string;
    expect(blobId).toBeTruthy();
  }
  const locator = page.getByTestId('image-content');
  const naturalWidth = await locator.evaluate(
    (img: HTMLImageElement) => img.naturalWidth
  );
  expect(locator.isVisible()).toBeTruthy();
  const { width, height } = await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  // zooom in
  await page.mouse.move(width / 2, height / 2);
  await page.mouse.wheel(0, 100);
  await page.mouse.wheel(0, 100);
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(1000);
  let imageBoundary = await locator.boundingBox();
  let imageWidth = await imageBoundary?.width;
  if (imageWidth) {
    expect((imageWidth / naturalWidth).toFixed(2)).toBe('0.54');
  }

  // zooom in
  await page.mouse.move(width / 2, height / 2);
  await page.mouse.wheel(0, -100);
  await page.mouse.wheel(0, -100);
  await page.mouse.wheel(0, -100);
  await page.waitForTimeout(1000);
  imageBoundary = await locator.boundingBox();
  imageWidth = await imageBoundary?.width;
  if (imageWidth) {
    expect((imageWidth / naturalWidth).toFixed(2)).toBe('0.84');
  }
});

test('image able to zoom in and out with button click', async ({ page }) => {
  await openHomePage(page);
  await waitEditorLoad(page);
  await newPage(page);
  let blobId: string;
  {
    const title = await getBlockSuiteEditorTitle(page);
    await title.click();
    await page.keyboard.press('Enter');
    await importImage(page, 'http://localhost:8081/large-image.png');
    await page.locator('img').first().dblclick();
    await page.waitForTimeout(500);
    blobId = (await page
      .locator('img')
      .nth(1)
      .getAttribute('data-blob-id')) as string;
    expect(blobId).toBeTruthy();
  }
  const locator = page.getByTestId('image-content');
  expect(locator.isVisible()).toBeTruthy();
  const naturalWidth = await locator.evaluate(
    (img: HTMLImageElement) => img.naturalWidth
  );

  // zooom in
  await page.getByTestId('zoom-in-button').dblclick();
  await page.waitForTimeout(1000);
  let imageBoundary = await locator.boundingBox();
  let imageWidth = await imageBoundary?.width;
  if (imageWidth) {
    expect((imageWidth / naturalWidth).toFixed(2)).toBe('1.04');
  }

  // zooom out
  await page.getByTestId('zoom-out-button').dblclick();
  imageBoundary = await locator.boundingBox();
  imageWidth = await imageBoundary?.width;
  if (imageWidth) {
    expect((imageWidth / naturalWidth).toFixed(2)).toBe('0.84');
  }
});

test('image should able to go left and right by buttons', async ({ page }) => {
  await openHomePage(page);
  await waitEditorLoad(page);
  await newPage(page);
  let blobId: string;
  {
    const title = await getBlockSuiteEditorTitle(page);
    await title.click();
    await page.keyboard.press('Enter');
    await importImage(page, 'http://localhost:8081/large-image.png');
    await page.locator('img').first().dblclick();
    await page.waitForTimeout(500);
    blobId = (await page
      .locator('img')
      .nth(1)
      .getAttribute('data-blob-id')) as string;
    expect(blobId).toBeTruthy();
    await closeImagePreviewModal(page);
  }
  {
    const title = await getBlockSuiteEditorTitle(page);
    await title.click();
    await page.keyboard.press('Enter');
    await importImage(page, 'http://localhost:8081/affine-preview.png');
  }
  const locator = page.getByTestId('image-preview-modal');
  expect(locator.isVisible()).toBeTruthy();
  await page.locator('img').first().dblclick();
  // ensure the new image was imported
  await page.waitForTimeout(1000);
  {
    const newBlobId = (await page
      .getByTestId('image-content')
      .getAttribute('data-blob-id')) as string;
    expect(newBlobId).not.toBe(blobId);
  }
  await page.getByTestId('next-image-button').click();
  await page.waitForTimeout(1000);
  {
    const newBlobId = (await page
      .getByTestId('image-content')
      .getAttribute('data-blob-id')) as string;
    expect(newBlobId).toBe(blobId);
  }
  await page.getByTestId('previous-image-button').click();
  await page.waitForTimeout(1000);
  {
    const newBlobId = (await page
      .getByTestId('image-content')
      .getAttribute('data-blob-id')) as string;
    expect(newBlobId).not.toBe(blobId);
  }
});

test('image able to fit to screen by button', async ({ page }) => {
  await openHomePage(page);
  await waitEditorLoad(page);
  await newPage(page);
  let blobId: string;
  {
    const title = await getBlockSuiteEditorTitle(page);
    await title.click();
    await page.keyboard.press('Enter');
    await importImage(page, 'http://localhost:8081/large-image.png');
    await page.locator('img').first().dblclick();
    await page.waitForTimeout(500);
    blobId = (await page
      .locator('img')
      .nth(1)
      .getAttribute('data-blob-id')) as string;
    expect(blobId).toBeTruthy();
  }
  const locator = page.getByTestId('image-content');
  expect(locator.isVisible()).toBeTruthy();
  const naturalWidth = await locator.evaluate(
    (img: HTMLImageElement) => img.naturalWidth
  );
  const [viewportWidth, viewportHeight] = await page.evaluate(() => {
    return [window.innerWidth, window.innerHeight];
  });

  // zooom in
  await page.getByTestId('zoom-in-button').dblclick();
  await page.waitForTimeout(1000);
  let imageBoundary = await locator.boundingBox();
  let imageWidth = await imageBoundary?.width;
  if (imageWidth) {
    expect((imageWidth / naturalWidth).toFixed(2)).toBe('1.04');
  } else {
    throw new Error("Image doesn't exist!");
  }

  //reset zoom
  await page.getByTestId('fit-to-screen-button').click();
  imageBoundary = await locator.boundingBox();
  imageWidth = await imageBoundary?.width;
  const imageHeight = await imageBoundary?.height;
  if (imageWidth && imageHeight) {
    expect(imageWidth).toBeLessThan(viewportWidth);
    expect(imageHeight).toBeLessThan(viewportHeight);
  } else {
    throw new Error("Image doesn't exist!");
  }
});

test('image able to reset zoom to 100%', async ({ page }) => {
  await openHomePage(page);
  await waitEditorLoad(page);
  await newPage(page);
  let blobId: string;
  {
    const title = await getBlockSuiteEditorTitle(page);
    await title.click();
    await page.keyboard.press('Enter');
    await importImage(page, 'http://localhost:8081/large-image.png');
    await page.locator('img').first().dblclick();
    await page.waitForTimeout(500);
    blobId = (await page
      .locator('img')
      .nth(1)
      .getAttribute('data-blob-id')) as string;
    expect(blobId).toBeTruthy();
  }
  const locator = page.getByTestId('image-content');
  expect(locator.isVisible()).toBeTruthy();
  const naturalWidth = await locator.evaluate(
    (img: HTMLImageElement) => img.naturalWidth
  );

  // zooom in
  await page.getByTestId('zoom-in-button').dblclick();
  await page.waitForTimeout(1000);
  let imageBoundary = await locator.boundingBox();
  let imageWidth = await imageBoundary?.width;
  if (imageWidth) {
    expect((imageWidth / naturalWidth).toFixed(2)).toBe('1.04');
  } else {
    throw new Error("Image doesn't exist!");
  }

  //reset zoom
  await page.getByTestId('reset-scale-button').click();
  imageBoundary = await locator.boundingBox();
  imageWidth = await imageBoundary?.width;
  if (imageWidth) {
    expect((imageWidth / naturalWidth).toFixed(2)).toBe('1.00');
  } else {
    throw new Error("Image doesn't exist!");
  }
});

test('image able to copy to clipboard', async ({ page }) => {
  await openHomePage(page);
  await waitEditorLoad(page);
  await newPage(page);
  let blobId: string;
  {
    const title = await getBlockSuiteEditorTitle(page);
    await title.click();
    await page.keyboard.press('Enter');
    await importImage(page, 'http://localhost:8081/large-image.png');
    await page.locator('img').first().dblclick();
    await page.waitForTimeout(500);
    blobId = (await page
      .locator('img')
      .nth(1)
      .getAttribute('data-blob-id')) as string;
    expect(blobId).toBeTruthy();
  }
  const locator = page.getByTestId('image-preview-modal');
  expect(locator.isVisible()).toBeTruthy();
  await page.getByTestId('copy-to-clipboard-button').click();
  await page.on('console', message => {
    expect(message.text()).toBe('Image copied to clipboard');
  });
});

test('image able to download', async ({ page }) => {
  await openHomePage(page);
  await waitEditorLoad(page);
  await newPage(page);
  let blobId: string;
  {
    const title = await getBlockSuiteEditorTitle(page);
    await title.click();
    await page.keyboard.press('Enter');
    await importImage(page, 'http://localhost:8081/large-image.png');
    await page.locator('img').first().dblclick();
    await page.waitForTimeout(500);
    blobId = (await page
      .locator('img')
      .nth(1)
      .getAttribute('data-blob-id')) as string;
    expect(blobId).toBeTruthy();
  }
  const locator = page.getByTestId('image-preview-modal');
  expect(locator.isVisible()).toBeTruthy();
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('download-button').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(`${blobId}.png`);
  await download.saveAs(`download/ + ${download.suggestedFilename()}`);
  expect(
    fs.existsSync(`download/ + ${download.suggestedFilename()}`)
  ).toBeTruthy();
});

test('image should only able to move when image is larger than viewport', async ({
  page,
}) => {
  await openHomePage(page);
  await waitEditorLoad(page);
  await newPage(page);
  let blobId: string;
  {
    const title = await getBlockSuiteEditorTitle(page);
    await title.click();
    await page.keyboard.press('Enter');
    await importImage(page, 'http://localhost:8081/large-image.png');
    await page.locator('img').first().dblclick();
    await page.waitForTimeout(500);
    blobId = (await page
      .locator('img')
      .nth(1)
      .getAttribute('data-blob-id')) as string;
    expect(blobId).toBeTruthy();
  }
  const locator = page.getByTestId('image-content');
  expect(locator.isVisible()).toBeTruthy();
  const { width, height } = await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  let imageBoundary = await locator.boundingBox();
  const initialXPos = imageBoundary?.x;
  const initialYPos = imageBoundary?.y;
  // check will it able to move when zoomed in
  await page.getByTestId('zoom-in-button').dblclick();
  await page.getByTestId('zoom-in-button').dblclick();
  await page.mouse.move(width / 2, height / 2);
  await page.mouse.down();
  await page.mouse.move(20, 20);
  await page.mouse.up();
  imageBoundary = await locator.boundingBox();
  expect(initialXPos).not.toBe(imageBoundary?.x);
  expect(initialYPos).not.toBe(imageBoundary?.y);

  // check will it able to move when zoomed out
  await page.getByTestId('fit-to-screen-button').click();
  await page.mouse.move(width / 2, height / 2);
  await page.mouse.down();
  await page.mouse.move(20, 20);
  await page.mouse.up();
  imageBoundary = await locator.boundingBox();
  expect(initialXPos).toBe(imageBoundary?.x);
  expect(initialYPos).toBe(imageBoundary?.y);
});
