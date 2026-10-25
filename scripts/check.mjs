#!/usr/bin/env node
/**
 * Offline contract check for dsh-harmony-light.
 *
 * Verifies the bundle envelope, the inlined stylesheet, JSON resources, and the
 * manifest's client/bundle declarations without needing a browser.
 */
import { readFile, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const read = (name) => readFile(join(ROOT, name), 'utf8')
const fail = (message) => {
  console.error(`FAIL ${message}`)
  process.exitCode = 1
}

const pkg = JSON.parse(await read('package.json'))
const client = await read('client.js')
const host = await read('index.js')
const patch = await read('cordis.patch.yml')

if (pkg.dsh?.bundle?.patch !== './cordis.patch.yml') fail('package.json dsh.bundle.patch')
if (pkg.dsh?.client?.platform !== 'web') fail('package.json dsh.client.platform')
if (!Array.isArray(pkg.dsh?.client?.inject)) fail('package.json dsh.client.inject')
if (!pkg.exports?.['./client']) fail('package.json exports ./client')
if (!pkg.exports?.['./icon']) fail('package.json exports ./icon')

if (!client.startsWith('window.__ModuleLoader__.load({')) fail('client envelope start')
if (!client.trimEnd().endsWith('})')) fail('client envelope end')
if (!client.includes(`id: '${pkg.name}'`)) fail('client id matches package name')
if (!client.includes('shell.overlay')) fail('client registers into shell.overlay')
if (!client.includes('--dsw-specific-input-major')) fail('composer surface token')
if (!client.includes("role: 'switch'")) fail('switch role')
if (!client.includes('dhl-composer-sheen')) fail('composer light sheen')
if (!client.includes('dhl-meteor')) fail('meteor layer')
if (!client.includes('dhl-fixed-meteor')) fail('fixed meteor layer')
if (!client.includes('dhl-ios-switch')) fail('iOS switch')
if (!client.includes('data-composer-card')) fail('composer glass anchor')
if (!client.includes('conversation.input.left')) fail('chat idea observer')
if (!client.includes('useSessionStatus')) fail('session status hook')
if (!client.includes('modelDirectories')) fail('model directory')
if (client.includes('dhl-dock')) fail('dock frame should be removed')
if (client.includes('dhl-switch')) fail('old switch should be removed')
if (client.includes('usePointerLight')) fail('pointer-following light should be removed')
if (!host.includes('export function apply')) fail('host apply export')
if (!patch.includes(`- id: ${pkg.name}`)) fail('patch row id')
if (!patch.includes(`name: ${pkg.name}`)) fail('patch row name')

const start = client.indexOf('String.raw`')
const end = client.indexOf('\n`\n', start)
if (start < 0 || end < 0) fail('inlined CSS block')
const css = client.slice(start + 'String.raw`'.length, end)
if (css.includes('`')) fail('CSS contains a backtick')
if (css.includes('${')) fail('CSS contains a template interpolation')

let braces = 0
let parens = 0
for (const ch of css) {
  if (ch === '{') braces += 1
  else if (ch === '}') braces -= 1
  else if (ch === '(') parens += 1
  else if (ch === ')') parens -= 1
  if (braces < 0 || parens < 0) break
}
if (braces !== 0) fail(`CSS brace balance is ${braces}`)
if (parens !== 0) fail(`CSS paren balance is ${parens}`)

for (const locale of ['zh', 'en']) {
  const dict = JSON.parse(await read(`locale/${locale}.json`))
  if (!dict.meta?.title || !dict.meta?.description) fail(`locale/${locale}.json meta`)
  for (const key of ['name', 'hint', 'onState', 'offState']) {
    if (typeof dict[key] !== 'string') fail(`locale/${locale}.json ${key}`)
  }
}

const icon = await stat(join(ROOT, 'icon.svg'))
if (icon.size === 0 || icon.size > 256 * 1024) fail('icon.svg size')

console.log(JSON.stringify({
  package: pkg.name,
  version: pkg.version,
  clientBytes: Buffer.byteLength(client),
  cssBytes: Buffer.byteLength(css),
  keyframes: (css.match(/@keyframes/g) ?? []).length,
  iconBytes: icon.size,
  ok: process.exitCode !== 1,
}, null, 2))
