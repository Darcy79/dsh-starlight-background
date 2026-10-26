// Regression checks against the actual bundle; no browser or external packages.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

let host, now = 100000, nextTimer = 0
const timers = new Map(), listeners = new Map(), attributes = new Map()
const storage = new Map()
const motionListeners = new Set()
const media = { matches: false, addEventListener: (_, fn) => motionListeners.add(fn), removeEventListener: (_, fn) => motionListeners.delete(fn) }
const React = {
  createElement: (type, props, ...children) => ({ type, props, children }),
  useRef(value) { const i = host.cursor++; return host.slots[i] ??= { current: value } },
  useState(initial) {
    const target = host, i = target.cursor++
    if (!target.slots[i]) target.slots[i] = { value: typeof initial === 'function' ? initial() : initial }
    const slot = target.slots[i]
    slot.set ??= update => { slot.value = typeof update === 'function' ? update(slot.value) : update }
    return [slot.value, slot.set]
  },
  useCallback: fn => fn,
  useMemo: fn => fn(),
  useSyncExternalStore: (_, read) => read(),
  useEffect(fn, deps) {
    const i = host.cursor++, target = host, old = target.slots[i]
    if (!old || deps.some((value, index) => value !== old.deps[index])) {
      target.pending.push(() => { old?.cleanup?.(); target.slots[i] = { deps, cleanup: fn() } })
    }
  },
}
function hookHost() {
  return {
    slots: [], pending: [], cursor: 0,
    render(fn) { host = this; this.cursor = 0; const result = fn(); for (const effect of this.pending.splice(0)) effect(); return result },
    dispose() { for (const slot of this.slots) slot?.cleanup?.() },
  }
}
class Element { closest(selector) { return selector.startsWith('button, a') ? this : null } }
const document = { documentElement: {
  getAttribute: key => attributes.get(key) ?? null,
  setAttribute: (key, value) => attributes.set(key, value),
  removeAttribute: key => attributes.delete(key),
}, visibilityState: 'visible', addEventListener() {}, removeEventListener() {} }
const window = {
  localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  innerWidth: 1440, innerHeight: 960, matchMedia: () => media,
  setTimeout(fn, ms) { const id = ++nextTimer; timers.set(id, { fn, ms }); return id },
  clearTimeout: id => timers.delete(id),
  addEventListener: (key, fn) => listeners.set(key, fn),
  removeEventListener: key => listeners.delete(key),
  __ModuleLoader__: { load: ({ factory }) => factory(() => React) },
}
const context = { window, document, Element, Date: { now: () => now } }
const source = (await readFile(new URL('../client.js', import.meta.url), 'utf8')).replace(
  '    /* ── plugin entry',
  '    globalThis.audit = { StarlightObserver, StarlightField, LightSettings, useInteractionRipples, addIdea, ideaRecords, ideaLastAt, renderFixedMeteor, renderMeteorHead, installAppearance, setOn, setPreference, getPreferences, decodePreferences };\n    /* ── plugin entry',
)
vm.runInNewContext(source, context)
const a = context.audit
const resetIdeas = () => { a.ideaRecords.clear(); a.ideaLastAt.clear(); timers.clear() }
function observe(target, sessionId, kinds) {
  const order = kinds.map((_, index) => `node:${index}`)
  const nodes = new Map(kinds.map((kind, index) => [order[index], { kind }]))
  target.render(() => a.StarlightObserver({ sessionId,
    useSessionStatus: select => select(new Map([[sessionId, { running: true }]])),
    useChat: select => select({ order, nodes }),
  }))
}
resetIdeas()
const observer = hookHost()
observe(observer, 'long-chat', Array(12).fill('assistant-step'))
assert.equal(a.ideaRecords.size, 0, 'Initial history must not replay')
observe(observer, 'long-chat', Array(13).fill('assistant-step'))
assert.equal(a.ideaRecords.size, 1, 'A step must be detected as the 12-node window slides')
observe(observer, 'long-chat', Array(13).fill('assistant-step'))
assert.equal(a.ideaRecords.size, 1, 'An unchanged snapshot must not duplicate ideas')
resetIdeas()
const follow = hookHost()
const history = ['user', ...Array(11).fill('assistant-step')]
observe(follow, 'follow', history)
a.addIdea('follow')
observe(follow, 'follow', [...history, 'user'])
assert([...a.ideaRecords.values()][0].data.executed, 'A user replacing a user in the tail must execute the idea')
resetIdeas()
const batched = hookHost()
observe(batched, 'batch', Array(12).fill('assistant-step'))
observe(batched, 'batch', [...Array(12).fill('assistant-step'), 'assistant-step', 'steering'])
assert([...a.ideaRecords.values()][0].data.executed, 'Batched new nodes must be processed in chronological order')
const count = a.ideaRecords.size
observe(batched, 'other-session', Array(20).fill('assistant-step'))
observe(batched, 'other-session', Array(3).fill('assistant-step'))
assert.equal(a.ideaRecords.size, count, 'Session changes and truncation must establish a baseline')

const spec = { id: 0, x: 0, y: 0, angle: 24, length: 160, duration: 14, delay: -11, opacity: 0.8 }
const colors = { head: '#fff', tail: '#adf', glow: '#8bf' }
const fixed = a.renderFixedMeteor(spec, true, colors, false, 1, 1)
assert.equal(fixed.props.style['--dhl-fixed-delay'], '0.00s')
for (const particle of fixed.children[1]) assert(parseFloat(particle.props.style.animationDelay) >= 0)
assert.equal(a.renderFixedMeteor(spec, true, colors, true).props.style['--dhl-fixed-delay'], '0.00s')
for (const idea of [false, true]) {
  const head = a.renderMeteorHead(idea)
  assert.equal(head.type, 'svg')
  assert(head.children.every(node => node.type === 'circle'), 'Heads and halos must use circular geometry')
}

resetIdeas()
let ripples = []
const rippleHost = hookHost(), setter = update => { ripples = update(ripples) }
rippleHost.render(() => a.useInteractionRipples(true, setter))
listeners.get('pointerdown')({ pointerType: 'mouse', button: 0, target: new Element(), clientX: 1, clientY: 2 })
assert.equal(ripples.length, 1)
rippleHost.render(() => a.useInteractionRipples(false, setter))
assert.equal(ripples.length, 0, 'Disabling must remove ripple state as well as its timers')
assert.equal(timers.size, 0)
rippleHost.render(() => a.useInteractionRipples(true, setter))
listeners.get('pointerdown')({ pointerType: 'mouse', button: 0, target: new Element() })
media.matches = true
for (const fn of motionListeners) fn()
assert.equal(ripples.length, 0, 'Enabling reduced motion must clear current ripples')
listeners.get('pointerdown')({ pointerType: 'mouse', button: 0, target: new Element() })
assert.equal(ripples.length, 0, 'Reduced motion must suppress new ripples')
rippleHost.dispose()
assert.equal(motionListeners.size, 0)
const initiallyReduced = hookHost()
initiallyReduced.render(() => a.useInteractionRipples(true, setter))
media.matches = false
for (const fn of motionListeners) fn()
listeners.get('pointerdown')({ pointerType: 'mouse', button: 0, target: new Element() })
assert.equal(ripples.length, 1, 'Turning reduced motion back off must restore interaction effects')
initiallyReduced.dispose()
assert.equal(ripples.length, 0)

let overrides = 0
const theme = {
  getTheme: () => ({ themes: [] }),
  overrideTokens() { overrides++; return () => { overrides-- } },
}
attributes.set('data-dhl-on', 'previous-value')
const disposeAppearance = a.installAppearance({ get: () => theme })
assert.equal(overrides, 1)
assert.equal(attributes.get('data-dhl-on'), 'true')
a.setOn(false)
assert.equal(overrides, 0, 'Off must release theme token overrides')
assert.equal(attributes.get('data-dhl-on'), 'false')
a.setOn(true)
assert.equal(overrides, 1)
disposeAppearance()
assert.equal(overrides, 0)
assert.equal(attributes.get('data-dhl-on'), 'previous-value', 'Unloading must restore the prior attribute')
a.setOn(false)
assert.equal(attributes.get('data-dhl-on'), 'previous-value', 'Unloaded appearance must unsubscribe')

a.setOn(true)
a.setPreference('artwork', false)
assert.equal(a.getPreferences().animation, false, 'Hiding artwork must turn off its animation')
a.setPreference('animation', true)
assert.equal(a.getPreferences().animation, false, 'Animation cannot be enabled for hidden artwork')
a.setPreference('artwork', true)
assert.equal(a.getPreferences().animation, false, 'Showing artwork again should start with a static image')
a.setPreference('animation', true)
const preferences = a.getPreferences()
a.setOn(false)
assert.equal(a.getPreferences(), preferences, 'Master off must preserve independent choices')
a.setOn(true)
a.setPreference('meteors', false)
const beforeDisabledIdea = a.ideaRecords.size
a.addIdea('disabled-meteors')
assert.equal(a.ideaRecords.size, beforeDisabledIdea, 'Disabled meteors must suppress new idea records')
assert.equal(JSON.parse(storage.get('dsh.starlight-background.settings')).meteors, false)
assert.equal(a.decodePreferences('{"artwork":false,"animation":true}').animation, false)
assert.equal(a.decodePreferences('invalid json').meteors, true)
const reload = { window, document, Element, Date: { now: () => now } }
vm.runInNewContext(source, reload)
assert.equal(reload.audit.getPreferences().meteors, false, 'Preferences must survive a module reload')

function nodes(tree) {
  if (!tree || typeof tree !== 'object') return []
  if (Array.isArray(tree)) return tree.flatMap(nodes)
  return [tree, ...tree.children.flatMap(nodes)]
}
const menu = hookHost()
let menuTree = menu.render(() => a.LightSettings({ on: true, onToggle() {} }))
nodes(menuTree).find(node => node.props?.className === 'dhl-settings-button').props.onClick()
menuTree = menu.render(() => a.LightSettings({ on: true, onToggle() {} }))
assert.equal(nodes(menuTree).filter(node => node.props?.role === 'switch').length, 4)
a.setPreference('artwork', false)
menuTree = menu.render(() => a.LightSettings({ on: true, onToggle() {} }))
assert(nodes(menuTree).find(node => node.props?.id === 'dhl-setting-animation').props.disabled)
menuTree = menu.render(() => a.LightSettings({ on: false, onToggle() {} }))
assert.equal(nodes(menuTree).filter(node => node.props?.role === 'switch' && node.props.disabled).length, 3)
menu.dispose()

let effort = 'low'
const directory = { load() {}, store: {
  subscribe: () => () => {},
  getSnapshot: () => ({ current: { provider: 'test', model: 'test', reasoningEffort: effort }, groups: [{ id: 'test', models: [{ id: 'test', reasoning: { efforts: ['off', 'low', 'high', 'max'].map(id => ({ id, name: id })) } }] }] }),
} }
const background = hookHost()
const backgroundProps = { useSessions: () => 'test-session', getDirectory: () => directory }
const activeCount = () => nodes(background.render(() => a.StarlightField(backgroundProps)))
  .filter(node => node.props?.className === 'dhl-fixed-meteor' && node.props['data-active'] === 'true').length
a.setPreference('meteors', true)
assert.equal(activeCount(), 4)
effort = 'high'; assert.equal(activeCount(), 7)
a.setPreference('meteors', false); assert.equal(activeCount(), 0)
effort = 'max'; assert.equal(activeCount(), 0, 'Depth changes cannot re-enable disabled meteors')
a.setPreference('meteors', true); assert.equal(activeCount(), 10, 'Re-enabling must use the current reasoning depth')
effort = 'off'; assert.equal(activeCount(), 2)
a.setOn(false); assert.equal(activeCount(), 0)
a.setOn(true); assert.equal(activeCount(), 2)
background.dispose()
console.log('PASS: activity, meteor entry and depth linkage, circles, ripple cleanup, preferences and persistence, settings dependencies, appearance lifecycle')
