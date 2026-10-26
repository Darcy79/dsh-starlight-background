/* Bundled into client.js by scripts/embed-artwork.mjs. Coordinates below are
 * calibrated to assets/deepseek-ocean.png (1024 × 1536, top-left origin).
 * One continuous texture avoids cutout seams and duplicate hair silhouettes. */
const ARTWORK_VERTEX = `
attribute vec2 aPosition;
varying vec2 vUV;
void main() {
  vUV = vec2(aPosition.x * 0.5 + 0.5, 0.5 - aPosition.y * 0.5);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`

const ARTWORK_FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uImage;
uniform float uTime;
uniform float uBlink;
varying vec2 vUV;

float region(vec2 p, vec2 center, vec2 radius) {
  return 1.0 - smoothstep(0.2, 1.0, length((p - center) / radius));
}

float pinnedBox(vec2 p, vec2 low, vec2 high, float feather) {
  vec2 outside = max(low - p, p - high);
  return 1.0 - smoothstep(0.0, feather, max(outside.x, outside.y));
}

float pinnedEllipse(vec2 p, vec2 center, vec2 radius) {
  return 1.0 - smoothstep(1.0, 1.14, length((p - center) / radius));
}

// Rotation is measured in image pixels, so the portrait's aspect ratio cannot
// stretch a rotating lock of hair. Each local motion rotates without scaling.
vec2 turn(vec2 p, vec2 pivot, float angle) {
  vec2 d = (p - pivot) * vec2(1024.0, 1536.0);
  float c = cos(angle), s = sin(angle);
  return pivot + vec2(c * d.x - s * d.y, s * d.x + c * d.y) / vec2(1024.0, 1536.0);
}

vec3 gaze(vec2 uv, vec3 color, vec2 center) {
  vec2 pixel = (uv - center) * vec2(1024.0, 1536.0);
  float iris = 1.0 - smoothstep(0.48, 1.0, length(pixel / vec2(13.0, 14.0)));
  if (iris > 0.0) {
    // Both irises share a slow, sub-pixel glance. Lids, eye corners and face
    // stay fixed; the gaze settles as the blink closes.
    vec2 look = vec2(0.85 * sin(uTime * 0.25) + 0.22 * sin(uTime * 0.47),
      0.35 * sin(uTime * 0.21));
    vec3 shifted = texture2D(uImage, uv - look * iris * (1.0 - uBlink) / vec2(1024.0, 1536.0)).rgb;
    float shine = smoothstep(0.68, 0.94, dot(shifted, vec3(0.299, 0.587, 0.114)));
    shifted = mix(shifted, vec3(0.92, 0.97, 1.0), shine * 0.07 * (0.5 + 0.5 * sin(uTime * 0.56)));
    color = mix(color, shifted, iris);
  }
  return color;
}

vec3 eyelid(vec2 uv, vec3 color, vec2 center, float angle) {
  vec2 pixel = (uv - center) * vec2(1024.0, 1536.0);
  float c = cos(angle), s = sin(angle);
  vec2 p = vec2(c * pixel.x + s * pixel.y, -s * pixel.x + c * pixel.y);
  float edge = 1.0 - smoothstep(0.82, 1.0, length(p / vec2(34.0, 23.0)));
  // Cheek samples preserve the illustration's skin colour. A curved lash
  // replaces the iris only during the brief closure, leaving brows untouched.
  vec3 skin = texture2D(uImage, center + vec2(0.0, 0.018)).rgb;
  skin *= 1.0 - 0.055 * (1.0 - smoothstep(-14.0, 12.0, p.y));
  float nx = p.x / 30.0;
  float curve = 5.0 - 5.0 * nx * nx;
  float lash = (1.0 - smoothstep(0.8, 2.3, abs(p.y - curve)))
    * (1.0 - smoothstep(25.0, 33.0, abs(p.x)));
  vec3 closed = mix(skin, vec3(0.20, 0.15, 0.19), lash * 0.92);
  return mix(color, closed, edge * uBlink);
}

void main() {
  vec2 p = vUV;
  vec2 pixels = vec2(1024.0, 1536.0);
  vec2 breeze = vec2(0.898794, 0.438371); // 26 degrees, upper-left to lower-right.
  vec2 crosswind = vec2(-breeze.y, breeze.x);
  // A pressure wave travels along the wind vector. Roots respond first and
  // downstream tips follow, instead of every lock translating in unison.
  float downstream = dot((p - vec2(0.25, 0.18)) * pixels, breeze) / 420.0;
  float phase = uTime * 0.95 - downstream * 1.2;
  float gust = 0.50 + 0.42 * sin(phase) + 0.08 * sin(phase * 2.0);
  float trailing = 0.50 + 0.42 * sin(phase - 0.55) + 0.08 * sin(phase * 2.0 - 1.1);
  float curl = sin(phase * 1.7 - downstream);
  float hairR = max(region(p, vec2(0.88, 0.305), vec2(0.13, 0.065)),
    max(region(p, vec2(0.89, 0.395), vec2(0.13, 0.10)),
        region(p, vec2(0.865, 0.50), vec2(0.11, 0.075))));
  float hairL = region(p, vec2(0.27, 0.34), vec2(0.14, 0.13));
  vec2 driftR = turn(p, vec2(0.74, 0.255), -0.025 * gust) - p
    + (breeze * (34.0 * gust) + crosswind * (3.0 * curl * gust)) / pixels;
  vec2 driftL = turn(p, vec2(0.41, 0.245), -0.024 * trailing) - p
    + (breeze * (29.0 * trailing) + crosswind * (2.5 * curl * trailing)) / pixels;
  vec2 displacement = driftR * hairR + driftL * hairL;
  float cheekHair = max(region(p, vec2(0.463, 0.163), vec2(0.052, 0.075)),
    max(region(p, vec2(0.710, 0.177), vec2(0.050, 0.082)),
        region(p, vec2(0.677, 0.112), vec2(0.035, 0.062))));
  displacement += cheekHair * (turn(p, vec2(0.59, 0.065), -0.009 * gust) - p
    + (breeze * (9.0 * gust) + crosswind * (0.9 * curl * gust)) / pixels);
  float hem = region(p, vec2(0.52, 0.76), vec2(0.57, 0.30)) * smoothstep(0.53, 0.81, p.y);
  displacement += hem * (turn(p, vec2(0.59, 0.48), -0.023 * trailing) - p
    + (breeze * (24.0 * trailing) + crosswind * (1.5 * curl * trailing)) / pixels);
  float tail = max(region(p, vec2(0.12, 0.225), vec2(0.11, 0.105)),
    region(p, vec2(0.235, 0.275), vec2(0.13, 0.065)));
  float swim = sin(uTime * 0.72 - 0.6);
  displacement += tail * (turn(p, vec2(0.09, 0.43), 0.004 * swim) - p
    + vec2(0.0, 2.4 * swim) / pixels);
  float water = smoothstep(0.77, 0.89, p.y) * max(
    1.0 - smoothstep(0.13, 0.25, p.x), smoothstep(0.87, 0.98, p.x));
  displacement += water * (breeze * (3.8 * sin(uTime * 1.15 - downstream * 2.0))
    + crosswind * (2.8 * sin(uTime * 1.7 - p.y * 35.0))) / pixels;
  // Protect the torso by its actual outline, leaving the extended hands free
  // for their own small, slow motion. Eye/face protection also isolates side locks.
  float torso = max(pinnedBox(p, vec2(0.525, 0.225), vec2(0.815, 0.495), 0.045),
    pinnedBox(p, vec2(0.365, 0.225), vec2(0.56, 0.355), 0.035));
  float face = max(pinnedEllipse(p, vec2(0.590, 0.183), vec2(0.105, 0.061)),
    max(pinnedBox(p, vec2(0.500, 0.132), vec2(0.582, 0.180), 0.012),
        pinnedBox(p, vec2(0.598, 0.148), vec2(0.674, 0.199), 0.012)));
  float legs = pinnedBox(p, vec2(0.29, 0.84), vec2(0.59, 0.995), 0.025);
  float leftHand = pinnedBox(p, vec2(0.24, 0.36), vec2(0.475, 0.56), 0.045);
  float rightHand = pinnedBox(p, vec2(0.79, 0.55), vec2(0.94, 0.675), 0.035);
  float pinned = max(max(torso, face), max(legs, max(leftHand, rightHand)));
  displacement *= 1.0 - pinned;
  float breath = sin(uTime * 0.85);
  float reach = max(region(p, vec2(0.35, 0.445), vec2(0.16, 0.135)),
    region(p, vec2(0.43, 0.36), vec2(0.095, 0.08)));
  vec2 handMotion = reach * (turn(p, vec2(0.465, 0.32), 0.009 * breath) - p
    + vec2(0.0, 2.8 * breath) / pixels);
  float resting = region(p, vec2(0.87, 0.62), vec2(0.11, 0.095));
  handMotion += resting * (turn(p, vec2(0.80, 0.55), 0.009 * breath) - p
    + vec2(0.0, 2.0 * breath) / pixels);
  displacement += handMotion * (1.0 - max(torso, max(face, legs)));
  // Fade displacement at the image boundary so no clamped edge streaks appear.
  float border = smoothstep(0.0, 0.025, min(min(vUV.x, 1.0 - vUV.x), min(vUV.y, 1.0 - vUV.y)));
  vec2 uv = p - displacement * border;
  vec3 color = texture2D(uImage, uv).rgb;
  float foam = smoothstep(0.48, 0.92, dot(color, vec3(0.299, 0.587, 0.114)));
  float shimmer = water * (1.0 - pinned) * foam * 0.085
    * sin(uTime * 1.7 - p.x * 31.0 - p.y * 23.0);
  color *= 1.0 + shimmer;
  color = gaze(uv, color, vec2(0.542, 0.158));
  color = gaze(uv, color, vec2(0.634, 0.175));
  color = eyelid(uv, color, vec2(0.541, 0.156), 0.20);
  color = eyelid(uv, color, vec2(0.634, 0.175), 0.25);
  gl_FragColor = vec4(color, 1.0);
}`

function SeaBreeze() {
  return h('div', { className: 'dhl-sea-breeze', 'aria-hidden': 'true' },
    [8, 32, 56].map((top, index) => h('svg', {
      key: index, className: 'dhl-breeze-wisp', viewBox: '0 0 240 26',
      style: { top: `${top}%`, animationDelay: `${-index * 5.3}s` },
      focusable: 'false',
    },
      h('path', { d: 'M3 14 C49 3 70 23 119 13 S184 4 237 12', fill: 'none', stroke: 'currentColor', strokeWidth: 0.8 }),
      h('path', { d: 'M57 20 C93 12 111 24 148 17 S194 11 214 16', fill: 'none', stroke: 'currentColor', strokeWidth: 0.5, opacity: 0.5 }),
    )),
  )
}

function createArtworkRenderer(canvas, image) {
  const gl = canvas.getContext('webgl', {
    alpha: false, antialias: false, depth: false, stencil: false,
    preserveDrawingBuffer: false, powerPreference: 'low-power',
  })
  if (!gl) return null
  const shaders = []
  let program, buffer, texture
  const dispose = () => {
    if (texture) gl.deleteTexture(texture)
    if (buffer) gl.deleteBuffer(buffer)
    if (program) gl.deleteProgram(program)
    for (const shader of shaders) gl.deleteShader(shader)
  }
  try {
    const compile = (type, source) => {
      const shader = gl.createShader(type)
      shaders.push(shader)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) || 'Artwork shader compilation failed')
      }
      return shader
    }
    program = gl.createProgram()
    gl.attachShader(program, compile(gl.VERTEX_SHADER, ARTWORK_VERTEX))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, ARTWORK_FRAGMENT))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Artwork shader link failed')
    gl.useProgram(program)
    buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
    gl.uniform1i(gl.getUniformLocation(program, 'uImage'), 0)
    const time = gl.getUniformLocation(program, 'uTime')
    const blink = gl.getUniformLocation(program, 'uBlink')
    return {
      draw(seconds, closure) {
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.uniform1f(time, seconds)
        gl.uniform1f(blink, closure)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      },
      dispose,
    }
  } catch {
    dispose()
    return null // The underlying image remains visible on unsupported GPUs.
  }
}

function OceanArtwork({ on, visible, shown = true, animate = true }) {
  const canvasRef = React.useRef(null)
  const motionRef = React.useRef({ on, visible, shown, animate })
  const wakeRef = React.useRef(() => {})
  motionRef.current = { on, visible, shown, animate }
  React.useEffect(() => { wakeRef.current() }, [on, visible, shown, animate])
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const contrast = window.matchMedia('(prefers-contrast: more)')
    const image = new Image()
    let renderer = null, frame = 0, disposed = false, lost = false
    let elapsed = 0, previous = 0, lastDraw = -Infinity, nextBlink = 3.8, blinkStart = -10
    const resize = () => {
      const height = Math.max(2, Math.min(1536, Math.round(canvas.clientHeight * Math.min(window.devicePixelRatio || 1, 1.5))))
      canvas.width = Math.round(height * 2 / 3)
      canvas.height = height
      if (renderer && !lost && motionRef.current.on && motionRef.current.visible && motionRef.current.shown && motionRef.current.animate && !contrast.matches) {
        renderer.draw(media.matches ? 0 : elapsed, 0)
      }
    }
    const tick = (now) => {
      frame = 0
      if (disposed || lost || !renderer) return
      const active = motionRef.current.on && motionRef.current.visible && motionRef.current.shown && motionRef.current.animate && !media.matches && !contrast.matches
      if (!active) { previous = 0; return }
      if (previous) elapsed += Math.min((now - previous) / 1000, 0.1)
      previous = now
      if (now - lastDraw >= 1000 / 30) {
        if (elapsed >= nextBlink) {
          blinkStart = elapsed
          nextBlink = elapsed + 4.2 + Math.random() * 3.5
        }
        const phase = (elapsed - blinkStart) / 0.22
        const closure = phase >= 0 && phase <= 1 ? Math.pow(Math.sin(phase * Math.PI), 0.7) : 0
        renderer.draw(elapsed, closure)
        lastDraw = now
      }
      frame = window.requestAnimationFrame(tick)
    }
    const wake = () => {
      if (frame) window.cancelAnimationFrame(frame)
      frame = 0
      previous = 0
      canvas.dataset.ready = renderer && motionRef.current.shown && motionRef.current.animate && !lost ? 'true' : 'false'
      if (!renderer || lost || disposed) return
      if (!motionRef.current.on || !motionRef.current.visible || !motionRef.current.shown || !motionRef.current.animate || contrast.matches) return
      if (media.matches) renderer.draw(0, 0)
      else frame = window.requestAnimationFrame(tick)
    }
    const onLost = (event) => {
      event.preventDefault()
      lost = true
      canvas.dataset.ready = 'false'
      if (frame) window.cancelAnimationFrame(frame)
      frame = 0
    }
    const onRestored = () => {
      renderer?.dispose()
      lost = false
      renderer = createArtworkRenderer(canvas, image)
      if (renderer) {
        resize()
        canvas.dataset.ready = 'true'
        wake()
      }
    }
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    media.addEventListener('change', wake)
    contrast.addEventListener('change', wake)
    window.addEventListener('resize', resize)
    wakeRef.current = wake
    image.onload = () => {
      if (disposed) return
      renderer = createArtworkRenderer(canvas, image)
      if (!renderer) return
      resize()
      canvas.dataset.ready = 'true'
      wake()
    }
    image.src = ARTWORK_DATA
    return () => {
      disposed = true
      wakeRef.current = () => {}
      image.onload = null
      if (frame) window.cancelAnimationFrame(frame)
      media.removeEventListener('change', wake)
      contrast.removeEventListener('change', wake)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      renderer?.dispose()
    }
  }, [])
  return h('div', { className: 'dhl-artwork', 'aria-hidden': 'true' },
    h('img', { className: 'dhl-artwork-still', src: ARTWORK_DATA, alt: '', draggable: false }),
    h('canvas', { className: 'dhl-artwork-canvas', ref: canvasRef }),
  )
}
