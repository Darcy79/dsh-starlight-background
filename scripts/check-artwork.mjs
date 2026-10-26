// Browser verification using an existing Playwright installation. No downloads.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { mkdir, readFile } from 'node:fs/promises'
import { startPreview } from './preview.mjs'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const sharp = require('sharp')
const root = new URL('../', import.meta.url)
const artifactPath = name => fileURLToPath(new URL(`artifacts/${name}`, root))
await mkdir(new URL('artifacts/', root), { recursive: true })
const server = await startPreview(0)
let browser
try {
  browser = await chromium.launch({ headless: true, ...(process.env.ARTWORK_BROWSER ? { executablePath: process.env.ARTWORK_BROWSER } : {}), args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`http://127.0.0.1:${server.address().port}`)
  await page.waitForSelector('canvas[data-ready="true"]')
  const breezeDirection = await page.locator('.dhl-breeze-wisp').first().evaluate(node => {
    const animation = node.getAnimations()[0], previous = animation.currentTime
    animation.pause()
    animation.currentTime = 4000
    const from = new DOMMatrix(getComputedStyle(node).transform)
    animation.currentTime = 6000
    const to = new DOMMatrix(getComputedStyle(node).transform)
    animation.currentTime = previous
    animation.play()
    return { dx: to.e - from.e, dy: to.f - from.f }
  })
  assert(breezeDirection.dx > 0 && breezeDirection.dy > 0, 'Breeze must move from upper-left to lower-right')
  await page.evaluate(() => {
    for (const [id, parent] of [['inside-tooltip', document.querySelector('[data-composer-card]')], ['outside-tooltip', document.body]]) {
      const tooltip = document.createElement('span')
      tooltip.id = id; tooltip.setAttribute('role', 'tooltip'); tooltip.style.filter = 'blur(1px)'
      parent.append(tooltip)
    }
  })
  assert.equal(await page.locator('#inside-tooltip').evaluate(node => getComputedStyle(node).display), 'none')
  assert.equal(await page.locator('#outside-tooltip').evaluate(node => getComputedStyle(node).filter), 'blur(1px)', 'Other host tooltips must remain untouched')
  await page.locator('textarea').fill('背景不能阻挡输入和鼠标操作。')
  assert.equal(await page.locator('textarea').inputValue(), '背景不能阻挡输入和鼠标操作。')
  await page.screenshot({ path: artifactPath('ocean-dark.png') })
  await page.click('#theme')
  await page.screenshot({ path: artifactPath('ocean-light.png') })
  // Capture known animation phases in a separate canvas; validate location of
  // motion against the actual pixels, rather than string-matching shader code.
  const frames = await page.evaluate(async () => {
    const image = document.querySelector('.dhl-artwork-still')
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = 1024; canvas.height = 1536
    const renderer = artworkPreview.renderer(canvas, image)
    if (!renderer) throw new Error('WebGL renderer failed')
    const capture = (time, blink) => { renderer.draw(time, blink); return canvas.toDataURL('image/png') }
    const frames = [capture(0, 0), capture(2, 0), capture(0, 1), capture(5, 0), capture(8, 0)]
    renderer.dispose()
    return frames
  })
  const decoded = await Promise.all(frames.map(url => sharp(Buffer.from(url.split(',')[1], 'base64')).ensureAlpha().raw().toBuffer()))
  const delta = (a, b, x, y, w, h) => {
    let sum = 0
    for (let py = y; py < y + h; py++) for (let px = x; px < x + w; px++) {
      const i = (py * 1024 + px) * 4
      for (let c = 0; c < 3; c++) sum += Math.abs(a[i + c] - b[i + c])
    }
    return sum / (w * h * 3)
  }
  const metrics = {
    hair: delta(decoded[0], decoded[1], 800, 500, 140, 220),
    skirt: delta(decoded[0], decoded[1], 420, 1050, 200, 200),
    tail: delta(decoded[0], decoded[1], 60, 260, 180, 200),
    face: delta(decoded[0], decoded[1], 550, 280, 70, 60),
    blink: delta(decoded[0], decoded[2], 515, 214, 170, 80),
    blinkOutside: delta(decoded[0], decoded[2], 500, 300, 150, 100),
    gaze: delta(decoded[0], decoded[1], 536, 230, 35, 28),
    cheekHair: delta(decoded[0], decoded[1], 452, 225, 40, 75),
    leftHand: delta(decoded[0], decoded[1], 280, 570, 150, 230),
    rightHand: delta(decoded[0], decoded[1], 840, 900, 110, 125),
    water: delta(decoded[0], decoded[1], 20, 1320, 155, 180),
  }
  for (const part of ['hair', 'skirt', 'tail', 'blink']) assert(metrics[part] > 0.4, `${part} should animate`)
  assert(metrics.face < 0.05, 'Face should stay pinned during wind')
  assert.equal(metrics.blinkOutside, 0, 'Blink should affect eyes only')
  const pinned = {
    chest: [550, 465, 240, 250],
    shoulders: [375, 350, 155, 110],
    legs: [350, 1320, 220, 180],
    eyelash: [520, 218, 160, 9],
  }
  for (const [part, box] of Object.entries(pinned)) {
    metrics[part] = Math.max(...[1, 3, 4].map(index => delta(decoded[0], decoded[index], ...box)))
    assert.equal(metrics[part], 0, `${part} must remain pixel-identical throughout the breeze`)
  }
  assert(metrics.gaze > 0.05, 'The gaze should change slightly inside the irises')
  for (const part of ['cheekHair', 'leftHand', 'rightHand', 'water']) {
    assert(metrics[part] > 0.1, `${part} should now have its own localized movement`)
  }
  // Match an actual tail detail between the upper and lower swim phases.
  let bestTail = { error: Infinity, dx: 0, dy: 0 }
  for (let dy = -6; dy <= 6; dy++) for (let dx = -4; dx <= 4; dx++) {
    let error = 0
    for (let y = 300; y < 345; y++) for (let x = 100; x < 145; x++) {
      const from = (y * 1024 + x) * 4, to = ((y + dy) * 1024 + x + dx) * 4
      for (let channel = 0; channel < 3; channel++) error += Math.abs(decoded[1][from + channel] - decoded[4][to + channel])
    }
    if (error < bestTail.error) bestTail = { error, dx, dy }
  }
  assert(Math.abs(bestTail.dy) >= 1, 'The whale tail must have a visible vertical component')
  let longHairMotion = { error: Infinity, dx: 0, dy: 0 }
  for (let dy = -5; dy <= 8; dy++) for (let dx = -5; dx <= 18; dx++) {
    let error = 0
    for (let y = 500; y < 540; y++) for (let x = 885; x < 915; x++) {
      const from = (y * 1024 + x) * 4, to = ((y + dy) * 1024 + x + dx) * 4
      for (let channel = 0; channel < 3; channel++) error += Math.abs(decoded[0][from + channel] - decoded[1][to + channel])
    }
    if (error < longHairMotion.error) longHairMotion = { error, dx, dy }
  }
  assert(longHairMotion.dx > 0 && longHairMotion.dy >= 0, 'The growing gust should carry an actual hair detail toward the lower-right')
  await sharp(Buffer.from(frames[2].split(',')[1], 'base64')).extract({ left: 480, top: 185, width: 240, height: 155 }).resize(960, 620).toFile(artifactPath('blink-detail.png'))
  // Check the composited background at its real CSS opacity and display size,
  // rather than accepting a tiny change that only exists in the source image.
  await page.click('#theme') // Dark background, with the plugin's normal opacity.
  await page.evaluate(() => {
    window.motionPreviewAnimations = document.getAnimations().map(animation => ({ animation, running: animation.playState === 'running' }))
    for (const { animation } of window.motionPreviewAnimations) animation.pause()
    const original = document.querySelector('.dhl-artwork-canvas')
    original.style.visibility = 'hidden'
    const canvas = document.createElement('canvas')
    canvas.className = 'dhl-artwork-canvas'; canvas.dataset.ready = 'true'
    canvas.width = original.width; canvas.height = original.height
    original.parentNode.append(canvas)
    window.motionPreviewCanvas = canvas
    window.motionPreviewRenderer = artworkPreview.renderer(canvas, document.querySelector('.dhl-artwork-still'))
  })
  const visibleFrames = []
  for (const time of [0, 2]) {
    await page.evaluate(time => window.motionPreviewRenderer.draw(time, 0), time)
    visibleFrames.push(await page.locator('.dhl-artwork').screenshot())
  }
  const visibleSize = await sharp(visibleFrames[0]).metadata()
  const visibleMotion = {}
  for (const [part, box] of Object.entries({ hair: [800, 500, 140, 220], skirt: [420, 1050, 200, 200], cheekHair: [452, 225, 40, 75], water: [20, 1320, 155, 180] })) {
    const scale = visibleSize.width / 1024
    const [left, top, width, height] = box.map(value => Math.round(value * scale))
    const samples = await Promise.all(visibleFrames.map(frame => sharp(frame).extract({ left, top, width, height }).removeAlpha().raw().toBuffer()))
    visibleMotion[part] = samples[0].reduce((sum, value, index) => sum + Math.abs(value - samples[1][index]), 0) / samples[0].length
    assert(visibleMotion[part] > (part === 'cheekHair' || part === 'water' ? 0.3 : 1), `${part} movement must remain visible after scaling and background blending`)
  }
  if (process.env.ARTWORK_CAPTURE_MOTION === '1') {
    const animation = []
    for (let index = 0; index < 44; index++) {
      await page.evaluate(time => window.motionPreviewRenderer.draw(time, 0), index * 0.15)
      animation.push(await sharp(await page.locator('.dhl-artwork').screenshot()).resize(480, 720).removeAlpha().raw().toBuffer())
    }
    await sharp(Buffer.concat(animation), { raw: { width: 480, height: 720 * animation.length, channels: 3, pageHeight: 720 } })
      .gif({ loop: 0, delay: 150, dither: 0 }).toFile(artifactPath('sea-breeze-visible.gif'))
  }
  await page.evaluate(() => {
    window.motionPreviewRenderer.dispose(); window.motionPreviewCanvas.remove()
    document.querySelector('.dhl-artwork-canvas').style.visibility = ''
    for (const { animation, running } of window.motionPreviewAnimations) if (running) animation.play()
  })
  // Count GPU draws to verify scheduling actually stops while paused/off.
  await page.evaluate(() => {
    window.draws = 0
    const proto = WebGLRenderingContext.prototype, original = proto.drawArrays
    proto.drawArrays = function (...args) { window.draws++; return original.apply(this, args) }
  })
  const stopped = async () => {
    await page.waitForTimeout(100)
    const before = await page.evaluate(() => window.draws)
    await page.waitForTimeout(180)
    assert.equal(await page.evaluate(() => window.draws), before, 'GPU drawing should stop')
  }
  const gear = page.locator('#dhl-settings-trigger')
  await gear.hover()
  await page.waitForTimeout(600)
  assert.notEqual(await page.locator('.dhl-gear-icon').evaluate(node => getComputedStyle(node).transform), 'none', 'Gear should rotate on hover')
  await gear.click()
  await page.waitForSelector('#dhl-settings-panel')
  assert.equal(await page.locator('#dhl-settings-panel [role="switch"]').count(), 4)
  await page.screenshot({ path: artifactPath('settings-dark.png') })
  await page.click('#theme')
  assert.equal(await page.locator('#dhl-settings-panel').count(), 0, 'Clicking outside should dismiss settings')
  await gear.click()
  await page.screenshot({ path: artifactPath('settings-light.png') })
  await page.click('#theme'); await gear.click()
  await page.click('#dhl-setting-meteors')
  assert.equal(await page.locator('#meteor-specimens').evaluate(node => getComputedStyle(node).display), 'none')
  const independent = await page.evaluate(() => window.draws)
  await page.waitForTimeout(180)
  assert(await page.evaluate(() => window.draws) > independent, 'Turning off meteors must leave artwork animation running')
  await page.click('#dhl-setting-meteors')
  await page.click('#dhl-setting-animation'); await stopped()
  assert.equal(await page.locator('.dhl-artwork-canvas').getAttribute('data-ready'), 'false')
  assert.notEqual(await page.locator('.dhl-artwork').evaluate(node => getComputedStyle(node).display), 'none', 'Animation off should keep a static illustration')
  assert.notEqual(await page.locator('#meteor-specimens').evaluate(node => getComputedStyle(node).display), 'none', 'Animation off must leave meteors enabled')
  assert.equal(await page.locator('.dhl-sea-breeze').evaluate(node => getComputedStyle(node).display), 'none')
  await page.click('#dhl-setting-artwork'); await stopped()
  assert.equal(await page.locator('.dhl-artwork').evaluate(node => getComputedStyle(node).display), 'none')
  assert(await page.locator('#dhl-setting-animation').isDisabled())
  assert.equal(await page.locator('#dhl-setting-animation').getAttribute('aria-checked'), 'false')
  await page.click('#dhl-setting-artwork')
  assert(!await page.locator('#dhl-setting-animation').isDisabled())
  assert.equal(await page.locator('#dhl-setting-animation').getAttribute('aria-checked'), 'false', 'Showing the illustration must not silently re-enable animation')
  await page.click('#dhl-setting-animation')
  await page.waitForSelector('canvas[data-ready="true"]')
  await page.click('#dhl-setting-master'); await stopped()
  for (const key of ['meteors', 'artwork', 'animation']) assert(await page.locator(`#dhl-setting-${key}`).isDisabled())
  await gear.click(); await gear.click()
  await page.click('#dhl-setting-master')
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('#dhl-settings-panel').count(), 0)
  assert.equal(await page.evaluate(() => document.activeElement.id), 'dhl-settings-trigger')
  await page.click('#motion'); await stopped()
  await page.click('#motion'); await page.waitForTimeout(180)
  assert(await page.evaluate(() => window.draws) > 0, 'Animation should resume')
  await page.click('#toggle'); await stopped()
  assert.equal(await page.locator('[data-composer-card]').evaluate(node => getComputedStyle(node).backdropFilter), 'none', 'Off must restore the composer appearance')
  assert.notEqual(await page.locator('#inside-tooltip').evaluate(node => getComputedStyle(node).display), 'none', 'Off must restore composer tooltips')
  await page.waitForTimeout(1100)
  assert.equal(await page.locator('.dhl-effect').evaluate(node => getComputedStyle(node).visibility), 'hidden')
  await page.click('#toggle')
  assert.match(await page.locator('[data-composer-card]').evaluate(node => getComputedStyle(node).backdropFilter), /blur\(22px\)/)
  await page.emulateMedia({ reducedMotion: 'reduce' }); await stopped()
  const animations = await page.evaluate(() => ['dhl-pool', 'dhl-dust-mote', 'dhl-toggle-sweep', 'dhl-breeze-wisp'].map(className => {
    const node = document.createElement('div'); node.className = className
    node.style.cssText = '--dhl-dust-duration:10s;--dhl-dust-delay:0s'
    document.querySelector('.dhl-effect').append(node)
    const animation = getComputedStyle(node).animationName
    node.remove()
    return animation
  }))
  assert(animations.every(name => name === 'none'), 'Reduced motion must stop the pool, dust, sweep and breeze')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-contrast', value: 'more' }] })
  assert.equal(await page.locator('.dhl-artwork').evaluate(node => getComputedStyle(node).display), 'none')
  await stopped()
  await cdp.send('Emulation.setEmulatedMedia', { features: [] })
  const resumed = await page.evaluate(() => window.draws)
  await page.waitForTimeout(180)
  assert(await page.evaluate(() => window.draws) > resumed, 'Leaving high contrast must resume the renderer')
  // WebGL loss must reveal the still image, then recover on restoration.
  await page.evaluate(() => {
    window.loss = document.querySelector('canvas').getContext('webgl').getExtension('WEBGL_lose_context')
    window.loss.loseContext()
  })
  await page.waitForSelector('canvas[data-ready="false"]')
  await stopped()
  await page.evaluate(() => window.loss.restoreContext())
  await page.waitForSelector('canvas[data-ready="true"]')
  await page.setViewportSize({ width: 390, height: 844 })
  assert(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth), 'No horizontal overflow on mobile')
  await gear.click()
  const panelBox = await page.locator('#dhl-settings-panel').boundingBox()
  assert(panelBox.x >= 0 && panelBox.x + panelBox.width <= 390 && panelBox.y >= 0, 'Settings must fit the narrow viewport')
  await page.screenshot({ path: artifactPath('ocean-mobile.png') })
  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 1440, height: 960 })
  // Magnify actual rendered head nodes, keeping each SVG circle and halo intact.
  await page.evaluate(() => {
    const gallery = document.createElement('div'); gallery.id = 'head-gallery'
    gallery.style.cssText = 'position:fixed;left:40px;top:40px;width:820px;height:390px;background:#151517;z-index:20;color:#eef7ff;border:1px solid #46516e;border-radius:16px'
    const heads = [...document.querySelectorAll('#meteor-specimens .dhl-meteor-head')]
    heads.forEach((head, index) => {
      const label = document.createElement('span')
      label.textContent = ['普通流星', '高亮流星', '周期性流星'][index]
      label.style.cssText = 'position:absolute;left:28px;top:' + (48 + index * 118) + 'px'
      const trail = document.createElement('div'); trail.className = index === 2 ? 'dhl-meteor' : 'dhl-fixed-streak'
      trail.style.cssText = 'position:absolute;left:230px;top:' + (65 + index * 118) + 'px;width:140px;height:2px;animation:none!important;opacity:1;transform:scale(3);transform-origin:left center;--dhl-fixed-tail:rgba(140,190,255,.45);--dhl-fixed-head:#eef7ff;--dhl-meteor-tail:rgba(140,190,255,.45);--dhl-meteor-head:#eef7ff'
      trail.append(head.cloneNode(true)); gallery.append(label, trail)
    })
    document.body.append(gallery)
  })
  await page.locator('#head-gallery').screenshot({ path: artifactPath('meteor-round-heads.png') })
  const circles = await page.locator('#head-gallery .dhl-meteor-core').evaluateAll(nodes => nodes.map(node => {
    const box = node.getBoundingClientRect(); return { tag: node.tagName, width: box.width, height: box.height }
  }))
  assert.equal(circles.length, 3)
  assert(circles.every(circle => circle.tag === 'circle' && Math.abs(circle.width - circle.height) < 0.05))
  await page.locator('#head-gallery').evaluate(node => node.remove())
  const persistence = await page.context().newPage()
  await persistence.goto(page.url())
  await persistence.click('#dhl-settings-trigger')
  await persistence.click('#dhl-setting-artwork')
  await persistence.click('#dhl-setting-meteors')
  await persistence.reload()
  await persistence.click('#dhl-settings-trigger')
  for (const key of ['meteors', 'artwork', 'animation']) {
    assert.equal(await persistence.locator(`#dhl-setting-${key}`).getAttribute('aria-checked'), 'false', 'Choices must persist after reload')
  }
  assert(await persistence.locator('#dhl-setting-animation').isDisabled())
  await persistence.click('#dhl-setting-artwork')
  await persistence.click('#dhl-setting-animation')
  await persistence.click('#dhl-setting-meteors')
  await persistence.close()
  await page.bringToFront()
  await page.evaluate(() => artworkPreview.dispose()); await stopped()
  const fallback = await browser.newPage()
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === 'webgl' ? null : original.call(this, type, ...args)
    }
  })
  await fallback.goto(page.url())
  await fallback.locator('.dhl-artwork-still').evaluate(node => node.decode())
  assert.equal(await fallback.locator('canvas').evaluate(node => getComputedStyle(node).opacity), '0')
  assert.equal(await fallback.locator('.dhl-artwork-still').evaluate(node => node.naturalWidth), 1024)
  assert.deepEqual(errors, [])
  const image = await readFile(new URL('assets/deepseek-ocean.png', root))
  const bundle = await readFile(new URL('client.js', root), 'utf8')
  assert(bundle.includes(image.toString('base64')), 'Bundled image matches source')
  console.log(JSON.stringify({ ok: true, metrics, visibleMotion, breezeDirection, longHairMotion: { dx: longHairMotion.dx, dy: longHairMotion.dy }, whaleTailMotion: { dx: bestTail.dx, dy: bestTail.dy }, checks: ['gear hover and settings popup', 'independent toggles and master control', 'artwork visibility/animation dependency', 'settings persistence', 'keyboard and narrow settings layout', 'GPU shader compile', 'localized sea breeze', 'motion visible at actual background opacity', 'pinned chest, shoulders, face and legs', 'side hair, hands and water motion', 'actual hair flow follows the breeze', 'iris gaze with fixed lashes', 'blink isolation', 'dark/light/mobile', 'pause/resume/off', 'appearance restoration', 'tooltip isolation', 'reduced motion for all layers', 'high contrast stops drawing', 'context recovery', 'cleanup', 'static fallback', 'embedded asset', 'three circular meteor heads'] }, null, 2))
} finally {
  await browser?.close()
  server.close()
}
