// Small hook host for the isolated local preview. Production uses host React.
let previewHost = null
const React = {
  createElement: (...args) => h(...args),
  useRef(value) {
    const index = previewHost.cursor++
    return previewHost.slots[index] ??= { current: value }
  },
  useState(initial) {
    const target = previewHost, index = target.cursor++
    if (!target.slots[index]) {
      const slot = { value: typeof initial === 'function' ? initial() : initial }
      slot.set = update => {
        const next = typeof update === 'function' ? update(slot.value) : update
        if (Object.is(slot.value, next)) return
        slot.value = next
        target.schedule()
      }
      target.slots[index] = slot
    }
    const slot = target.slots[index]
    return [slot.value, slot.set]
  },
  useEffect(fn, deps) {
    const target = previewHost, index = target.cursor++, old = target.slots[index]
    if (!old || deps.some((value, position) => value !== old.deps[position])) {
      target.pending.push(() => {
        old?.cleanup?.()
        target.slots[index] = { deps, cleanup: fn() }
      })
    }
  },
  useSyncExternalStore(subscribe, read) {
    const target = previewHost
    React.useEffect(() => subscribe(() => target.schedule()), [subscribe])
    return read()
  },
}
const h = (tag, attributes, ...children) => {
  const svg = ['svg', 'circle', 'path'].includes(tag)
  const node = svg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag)
  for (const [key, value] of Object.entries(attributes || {})) {
    if (key === 'key' || value === undefined || value === null) continue
    if (key === 'ref') {
      if (!previewHost?.preserveDOM || !value.current) value.current = node
    } else if (key === 'style') {
      for (const [property, item] of Object.entries(value)) {
        if (property.startsWith('--')) node.style.setProperty(property, item)
        else node.style[property] = item
      }
    } else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value)
    else if (key === 'className') node.setAttribute('class', value)
    else if (['disabled', 'hidden', 'draggable'].includes(key)) node[key] = value
    else if (['strokeWidth', 'strokeLinecap', 'strokeLinejoin'].includes(key)) node.setAttribute(key.replace(/[A-Z]/g, ch => '-' + ch.toLowerCase()), value)
    else node.setAttribute(key, value)
  }
  node.append(...children.flat(Infinity).filter(child => child != null && child !== false))
  return node
}
function mountPreviewIsland(component, props, target, preserveDOM = false) {
  const instance = {
    slots: [], pending: [], cursor: 0, props, node: null, disposed: false, queued: false, preserveDOM,
    schedule() {
      if (this.disposed || this.queued) return
      this.queued = true
      queueMicrotask(() => { this.queued = false; if (!this.disposed) this.render() })
    },
    update(next) { this.props = next; this.schedule() },
    render() {
      const focusId = this.node?.contains(document.activeElement) ? document.activeElement.id : null
      this.cursor = 0
      previewHost = this
      const node = component(this.props)
      previewHost = null
      if (!this.node) { target.append(node); this.node = node }
      else if (!this.preserveDOM) { this.node.replaceWith(node); this.node = node }
      if (focusId) document.getElementById(focusId)?.focus({ preventScroll: true })
      for (const fn of this.pending.splice(0)) fn()
    },
    dispose() {
      this.disposed = true
      for (const slot of this.slots) slot?.cleanup?.()
    },
  }
  instance.render()
  return instance
}
