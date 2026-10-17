import assert from 'node:assert/strict';
import sharp from 'sharp';
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:4321/merchants/quick-start/';
const { data: source, info } = await sharp(
  new URL(
    '../src/content/docs/merchants/quick-start/images/author-get-started.png',
    import.meta.url
  ).pathname
)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const colors = [
  { name: 'background', rgb: [255, 255, 255] },
  { name: 'primary text', rgb: [0, 0, 0] },
  { name: 'secondary text', rgb: [119, 119, 119] },
  { name: 'red text and connectors', rgb: [197, 0, 0] },
  { name: 'red icons', rgb: [187, 0, 0] },
  { name: 'red accents', rgb: [188, 13, 13] },
];

// Sample solid source colors, not the blended pixels at anti-aliased edges.
for (const color of colors) {
  for (let offset = 0; offset < source.length; offset += info.channels) {
    if (color.rgb.every((value, channel) => source[offset + channel] === value)) {
      const pixel = offset / info.channels;
      color.position = { left: pixel % info.width, top: Math.floor(pixel / info.width) };
      break;
    }
  }
  assert.ok(
    color.position,
    `Source image no longer contains ${color.name}; update the color samples.`
  );
}

function luminance(rgb) {
  return rgb.reduce((sum, value, channel) => {
    const sRGB = value / 255;
    const linear = sRGB <= 0.04045 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4;
    return sum + linear * [0.2126, 0.7152, 0.0722][channel];
  }, 0);
}

function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: info.width + 200, height: info.height + 200 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const response = await page.goto(url);
  assert.equal(response?.status(), 200);
  await page.evaluate(() => customElements.whenDefined('starlight-image-zoom'));
  const diagram = page.locator('.diagram[data-adapt-colors]');
  const image = diagram.locator('img');
  await image.evaluate((img) => img.decode());

  for (const theme of ['light', 'dark']) {
    await page
      .locator('starlight-theme-select select')
      .first()
      .selectOption(theme, { force: true });
    const filter = await image.evaluate((img) => getComputedStyle(img).filter);
    assert.equal(
      filter,
      theme === 'dark' ? 'contrast(1.1) invert(0.9) hue-rotate(180deg)' : 'contrast(1.1)'
    );
    assert.equal(
      await page
        .locator('.diagram:not([data-adapt-colors]) img')
        .first()
        .evaluate((img) => getComputedStyle(img).filter),
      'none'
    );

    // Render the actual PNG at native size to measure browser-filtered pixels without rescaling.
    await image.evaluate(async (img, currentFilter) => {
      const sample = img.cloneNode(true);
      sample.id = 'diagram-color-test-sample';
      sample.style.cssText = `position:fixed;left:0;top:0;z-index:2147483647;margin:0;max-width:none;max-height:none;width:${img.naturalWidth}px;height:${img.naturalHeight}px`;
      sample.style.filter = currentFilter;
      document.body.append(sample);
      await sample.decode();
    }, filter);
    const sample = page.locator('#diagram-color-test-sample');
    const rendered = await sharp(await sample.screenshot())
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    await sample.evaluate((img) => img.remove());
    assert.equal(rendered.info.width, info.width);
    assert.equal(rendered.info.height, info.height);
    const pixels = colors.map(({ position }) => {
      const offset = (position.top * rendered.info.width + position.left) * rendered.info.channels;
      return [...rendered.data.subarray(offset, offset + 3)];
    });
    const background = pixels[0];
    assert.deepEqual(background, theme === 'dark' ? [26, 26, 26] : [255, 255, 255]);
    assert.equal(
      await diagram.evaluate((el) => getComputedStyle(el).backgroundColor),
      `rgb(${background.join(', ')})`
    );
    for (let index = 1; index < colors.length; index++) {
      const ratio = contrast(pixels[index], background);
      // Red is also used for normal-sized text, so require 4.5:1 rather than only 3:1.
      assert.ok(
        ratio >= 4.5,
        `${theme} ${colors[index].name}: ${ratio.toFixed(3)}:1 is below 4.5:1`
      );
      console.log(`${theme}: ${colors[index].name} rgb(${pixels[index]}) = ${ratio.toFixed(2)}:1`);
    }

    await image.click();
    const zoomed = page.locator('dialog[open] .starlight-image-zoom-image');
    await zoomed.waitFor({ state: 'visible' });
    assert.equal(await zoomed.evaluate((img) => getComputedStyle(img).filter), filter);
    await page.keyboard.press('Escape');
    await page.locator('dialog[open]').waitFor({ state: 'detached' });

    await page.emulateMedia({ media: 'print' });
    assert.equal(await image.evaluate((img) => getComputedStyle(img).filter), 'contrast(1.1)');
    assert.equal(
      await diagram.evaluate((el) => getComputedStyle(el).backgroundColor),
      'rgb(255, 255, 255)'
    );
    await page.emulateMedia({ media: 'screen' });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = await image.boundingBox();
  assert.ok(mobile && mobile.width > 0 && mobile.x >= 0 && mobile.x + mobile.width <= 390);
  assert.equal(
    await image.evaluate((img) => getComputedStyle(img).filter),
    'contrast(1.1) invert(0.9) hue-rotate(180deg)'
  );
  console.log(
    'Passed: light/dark contrast, theme switching, zoom, print, opt-out images, and mobile layout.'
  );
} finally {
  await browser.close();
}
