// Harrow Settlers — Parametric 3D Shaded Body Rig (Ported from Last Fortress real55 Engine)
// 100% Numerical Control: Chibi & Semi-Chibi Settlers with Regular Body Weight.
// Animations: Idle, Walk, and Dough Kneading with dynamic poses!
// ZERO hand-drawing: 2-bone IK, 3D Lambert capsules, 5-tone hue-shifted auto-ramps.

pal({
  k: "#1b1420", // ink contour
  w: "#ffffff", // white linen & eyes
  y: "#f5b838"  // brass buckle & gold
})

// ------------------------------------------------------------------ Color & 5-Tone Math
function R55rgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255] }
function R55hex(c) { return "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("") }
function R55mix(a, b, k) { const A = R55rgb(a), B = R55rgb(b); return R55hex(A.map((v, i) => v + (B[i] - v) * k)) }
function R55dim(hex, k) { return R55hex(R55rgb(hex).map((v, i) => v * k * [1, 0.97, 1.04][i])) }

const R55cache = new Map()
function R55tones(hex) {
  if (R55cache.has(hex)) return R55cache.get(hex)
  const B = R55rgb(hex), mul = (k) => R55hex(B.map((v, i) => v * k[i]))
  const t = [
    R55mix(hex, "#fff4d6", 0.38),
    R55mix(hex, "#fff4d6", 0.18),
    hex,
    mul([0.76, 0.72, 0.82]),
    mul([0.48, 0.43, 0.56])
  ]
  R55cache.set(hex, t)
  return t
}

// ------------------------------------------------------------------ 3D Surface Normal Lighting
const R55LIGHT = (() => { const v = [-0.5, -0.62, 0.6], n = Math.hypot(...v); return v.map((a) => a / n) })()
const R55INK = "#1b1420"

function R55ctx(c) {
  if (!c.__g) { c.__g = new Int32Array(c.w * c.h); c.__e = new Array(c.w * c.h); c.__gid = 0 }
  return c
}
function R55group(c) { R55ctx(c); return ++c.__gid }

function R55fill(c, box, normalAt, mat, gid, opts = {}) {
  R55ctx(c)
  const T = typeof mat === "string" ? R55tones(mat) : mat
  const g = gid || ++c.__gid
  const [x0, y0, x1, y1] = box.map((v, i) => (i < 2 ? Math.floor(v) : Math.ceil(v)))
  for (let y = Math.max(0, y0); y <= Math.min(c.h - 1, y1); y++) {
    for (let x = Math.max(0, x0); x <= Math.min(c.w - 1, x1); x++) {
      const n = normalAt(x + 0.5, y + 0.5)
      if (!n) continue
      const L = n[0] * R55LIGHT[0] + n[1] * R55LIGHT[1] + n[2] * R55LIGHT[2] + (opts.bias || 0)
      const ti = L > 0.88 ? 0 : L > 0.64 ? 1 : L > 0.34 ? 2 : 3
      c.px(x, y, T[opts.flat != null ? opts.flat : ti === 0 && opts.noHi ? 1 : ti])
      const i = y * c.w + x
      c.__g[i] = g
      c.__e[i] = T[4]
    }
  }
  return g
}

function R55cap(c, ax, ay, ar, bx, by, br, mat, gid, opts) {
  const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1e-6, pad = Math.max(ar, br) + 1
  return R55fill(c, [Math.min(ax, bx) - pad, Math.min(ay, by) - pad, Math.max(ax, bx) + pad, Math.max(ay, by) + pad], (x, y) => {
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L2))
    const qx = x - (ax + dx * t), qy = y - (ay + dy * t), r = ar + (br - ar) * t, d2 = qx * qx + qy * qy
    if (d2 > r * r) return null
    return [qx / r, qy / r, Math.sqrt(Math.max(0, 1 - d2 / (r * r)))]
  }, mat, gid, opts)
}

function R55ell(c, cx, cy, rx, ry, mat, gid, opts) {
  return R55fill(c, [cx - rx - 1, cy - ry - 1, cx + rx + 1, cy + ry + 1], (x, y) => {
    const u = (x - cx) / rx, v = (y - cy) / ry, q = u * u + v * v
    if (q > 1) return null
    return [u, v, Math.sqrt(1 - q)]
  }, mat, gid, opts)
}

function R55inpoly(pts, x, y) {
  let inside = false
  for (let i = 0, j = pts.length - 2; i < pts.length; j = i, i += 2) {
    const xi = pts[i], yi = pts[i + 1], xj = pts[j], yj = pts[j + 1]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function R55poly(c, pts, mat, gid, opts = {}) {
  const xs = pts.filter((_, i) => i % 2 === 0), ys = pts.filter((_, i) => i % 2 === 1)
  const mnx = Math.min(...xs), mxx = Math.max(...xs), cxp = (mnx + mxx) / 2, hw = (mxx - mnx) / 2 || 1
  const mny = Math.min(...ys), hh = Math.max(...ys) - mny || 1
  return R55fill(c, [mnx - 1, Math.min(...ys) - 1, mxx + 1, Math.max(...ys) + 1], (x, y) => {
    if (!R55inpoly(pts, x, y)) return null
    const u = Math.max(-0.95, Math.min(0.95, (x - cxp) / hw)) * (opts.round ?? 0.8)
    const v = opts.ny ?? (-0.5 + 0.85 * (y - mny) / hh)
    return [u, v, Math.sqrt(Math.max(0.05, 1 - u * u - v * v * 0.5))]
  }, mat, gid, opts)
}

function R55finish(c) {
  const W = c.w, H = c.h, G = c.__g, E = c.__e, out = []
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x, g = G[i]
      if (!g) continue
      let edge = 0
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const X = x + dx, Y = y + dy
        const n = X < 0 || Y < 0 || X >= W || Y >= H ? 0 : G[Y * W + X]
        if (n === 0) { edge = 2; break }
        if (n < g) edge = 1
      }
      if (edge) out.push([x, y, edge === 2 ? R55mix(E[i], R55INK, 0.45) : E[i]])
    }
  }
  for (const [x, y, col] of out) c.px(x, y, col)
}

// 2-Bone Inverse Kinematics
function R55ik(hx, hy, ax, ay, l1, l2, prefX, prefY) {
  let dx = ax - hx, dy = ay - hy, d = Math.hypot(dx, dy)
  if (d > l1 + l2 - 0.05) { const k = (l1 + l2 - 0.05) / d; dx *= k; dy *= k; d = l1 + l2 - 0.05 }
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a))
  const px = hx + (a * dx) / d, py = hy + (a * dy) / d
  let nx = -dy / d, ny = dx / d
  if (nx * prefX + ny * prefY < 0) { nx = -nx; ny = -ny }
  return [px + nx * h, py + ny * h, hx + dx, hy + dy]
}

// ------------------------------------------------------------------ Master Settler Body Rig
function drawSettlerBody(c, R, P, ox, gy, s = 1.0, extra = {}) {
  const style = R.style || "semi_chibi"
  const isChibi = style === "chibi"
  const isSemi = style === "semi_chibi"
  
  // Numerical proportions
  const headScale = isChibi ? 1.55 : isSemi ? 1.20 : 1.00
  const limbLen   = isChibi ? 0.60 : isSemi ? 0.84 : 1.00
  const limbThick = isChibi ? 0.80 : isSemi ? 0.86 : 1.00 // regular, NOT muscular
  const build     = R.build || (isChibi ? 0.90 : isSemi ? 0.96 : 1.00) // regular body weight
  
  const tilt = P.tilt || 0, [hdx, hdy] = P.hip || [0, 0], ct = Math.cos(tilt), st = Math.sin(tilt)
  const hipY = isChibi ? -20 : isSemi ? -24 : -27
  const neckY = isChibi ? -33 : isSemi ? -38 : -44
  const headY = isChibi ? -42 : isSemi ? -47 : -51
  
  const pt = (x, y, upper) => {
    const up = upper || y < hipY
    let px = x + (y < hipY || upper ? (P.lean * (hipY - y)) / 22 : 0), py = y + (y < hipY + 5 || upper ? P.bob : 0)
    if (up && tilt) { const dx = px, dy = py - hipY; px = dx * ct - dy * st; py = hipY + dx * st + dy * ct }
    if (up || y < hipY + 5) { px += hdx; py += hdy }
    return [ox + px * s, gy + py * s]
  }
  const far = (hex) => R55dim(hex, 0.84)
  const parts = {}
  
  // 1. Far-side Tool / Prop: Baker's Peel resting safely on the ground away from the body
  if (R.prop === "peel") {
    const peelX = ox - (isChibi ? 12 : 14) * s
    const peelBotY = gy - 2 * s
    const peelTopY = gy - (isChibi ? 46 : 56) * s
    c.line(Math.round(peelX), Math.round(peelBotY), Math.round(peelX), Math.round(peelTopY), "#85542a", Math.round(1.6 * s))
    const bW = Math.round((isChibi ? 8 : 10) * s)
    const bH = Math.round((isChibi ? 11 : 14) * s)
    c.rect(Math.round(peelX - bW), Math.round(peelTopY - bH * 0.7), bW, bH, "#a36e3c")
    c.vline(Math.round(peelX - bW), Math.round(peelTopY - bH * 0.7), bH, "#d49959")
  }
  
  // 2. Legs (IK 2-bone capsules, regular weight, soft curves)
  const legL = (isChibi ? 7.4 : isSemi ? 10.6 : 13.0) * s
  const leg = (side, foot, matP, matS) => {
    const hx = side === "n" ? (isChibi ? 2.2 : 2.6) : (isChibi ? -2.2 : -2.6)
    const [Hx, Hy] = pt(hx, hipY)
    const Ax = ox + foot[0] * s + (side === "n" ? 1.0 : -1.0) * s, Ay = gy - (2 + foot[1] + (side === "n" ? 0 : 1.2)) * s
    const [Kx, Ky] = R55ik(Hx, Hy, Ax, Ay, legL, legL, 1, 0)
    const g = R55group(c)
    // Thigh
    R55cap(c, Hx, Hy, 3.2 * s * limbThick, Kx, Ky, 2.6 * s * limbThick, matP, g)
    // Calf
    R55cap(c, Kx, Ky, 2.6 * s * limbThick, Ax, Ay, 2.2 * s * limbThick, matP, g)
    // Shoes
    const gs = R55group(c)
    const shoeW = (isChibi ? 3.4 : 3.8) * s
    const shoeH = (isChibi ? 2.0 : 2.2) * s
    R55ell(c, Ax + 1.0 * s, Ay + 0.3 * s, shoeW, shoeH, matS, gs)
    parts[side + "leg"] = { g, Hx, Hy, Kx, Ky, Ax, Ay, gs }
  }
  
  leg("f", P.footF, far(R.pants), far(R.shoe))
  leg("n", P.footN, R.pants, R.shoe)
  
  // 3. Arms (Natural poses: hands resting at waist / on hip, NOT blocking the face)
  const armL1 = (isChibi ? 5.6 : isSemi ? 7.6 : 9.4) * s
  const armL2 = (isChibi ? 5.2 : isSemi ? 7.0 : 8.8) * s
  
  const arm = (side, hand, elbowPref, matSleeve, matSkin, sleeve) => {
    const sx = side === "n" ? (isChibi ? 4.8 : 5.4) : (isChibi ? -4.5 : -5.0)
    const [Sx, Sy] = pt(sx, neckY + 2.5)
    const [Wx, Wy] = pt(hand[0], hand[1], true)
    const [Ex, Ey, Wx2, Wy2] = R55ik(Sx, Sy, Wx, Wy, armL1, armL2, elbowPref[0], elbowPref[1])
    const g = R55group(c)
    R55cap(c, Sx, Sy, 2.6 * s * limbThick, Ex, Ey, 2.2 * s * limbThick, sleeve === "none" ? matSkin : matSleeve, g)
    if (sleeve === "short") {
      R55cap(c, Sx, Sy, 2.8 * s * limbThick, Sx + (Ex - Sx) * 0.5, Sy + (Ey - Sy) * 0.5, 2.4 * s * limbThick, matSleeve, g)
      R55cap(c, Ex, Ey, 2.0 * s * limbThick, Wx2, Wy2, 1.7 * s * limbThick, matSkin, g)
    } else {
      R55cap(c, Ex, Ey, 2.2 * s * limbThick, Wx2, Wy2, 1.8 * s * limbThick, matSleeve, g)
    }
    const gh = R55group(c)
    R55ell(c, Wx2 + (Wx2 - Ex) * 0.15, Wy2 + (Wy2 - Ey) * 0.15 + 0.4, 2.0 * s * limbThick, 2.0 * s * limbThick, matSkin, gh)
    parts[side + "arm"] = { g, gh, Sx, Sy, Ex, Ey, Wx: Wx2, Wy: Wy2 }
  }
  
  const sleeve = R.sleeves || "short"
  if (!extra.noFarArm) arm("f", P.handF, P.elbowF, far(R.shirt), far(R.skin), sleeve)
  
  // 4. Pelvis & Regular Torso
  const gp = R55group(c)
  { const [x, y] = pt(0.2, hipY); R55ell(c, x, y, (isChibi ? 5.8 : 6.6) * s * build, (isChibi ? 3.4 : 3.8) * s, R.pants, gp) }
  
  const gt = R55group(c)
  const tp = []
  const torsoH = isChibi ? 14 : isSemi ? 17 : 20
  for (const [x, y] of [
    [-4.6, neckY], [4.8, neckY], [6.2, neckY + torsoH * 0.25], [6.0, neckY + torsoH * 0.6], [5.6, hipY],
    [-5.4, hipY], [-5.8, neckY + torsoH * 0.6], [-6.0, neckY + torsoH * 0.25]
  ]) {
    tp.push(...pt(x * build, y))
  }
  R55poly(c, tp, R.shirt, gt, { round: isChibi ? 0.95 : 0.88 })
  
  // Soft rounded shoulders
  { const [x, y] = pt(-4.8 * build, neckY + 2.5); R55ell(c, x, y, 2.5 * s, 2.4 * s, R.shirt, gt) }
  { const [x, y] = pt(5.0 * build, neckY + 2.5); R55ell(c, x, y, 2.6 * s, 2.5 * s, R.shirt, gt) }
  parts.torso = gt; parts.pelvis = gp
  
  // 5. Baker's Apron (Clean front coverage)
  if (R.apron) {
    const ga = R55group(c)
    const ap = []
    const aprTop = neckY + (isChibi ? 2 : 3)
    const aprBot = hipY + (isChibi ? 5 : 7)
    for (const [x, y] of [
      [-3.4, aprTop], [3.6, aprTop], [4.6, aprTop + 7], [5.0, aprBot],
      [-4.8, aprBot], [-4.4, aprTop + 7]
    ]) {
      ap.push(...pt(x * build, y))
    }
    R55poly(c, ap, R.apron, ga, { round: 0.90 })
    parts.apron = ga
  }
  
  // Fresh Sourdough Bread Loaf held at WAIST LEVEL (Well below chin, ZERO face overlap!)
  if (R.breadAtWaist) {
    const [bx, by] = pt(0.5, hipY - 2)
    const loafRx = (isChibi ? 4.2 : 5.0) * s
    const loafRy = (isChibi ? 3.0 : 3.6) * s
    const gb = R55group(c)
    R55ell(c, bx, by, loafRx, loafRy, "#c77524", gb)
    R55ell(c, bx, by - 0.6 * s, loafRx - 0.8 * s, loafRy - 0.6 * s, "#eda239", gb)
    c.line(Math.round(bx - 2 * s), Math.round(by - 1.2 * s), Math.round(bx + 2 * s), Math.round(by - 0.8 * s), "#fae2a0", 1)
  }
  
  // 6. Neck & Head (100% UNOBSTRUCTED!)
  const gn = R55group(c)
  { const [x, y] = pt(0.5, neckY); R55cap(c, x, y + 1.5 * s, 2.2 * s, x + 0.2, y - 1.0 * s, 1.8 * s, R.skin, gn) }
  
  const gh = R55group(c)
  const [hx, hy] = pt(0.8 + P.head[0], headY + P.head[1])
  const headRx = (isChibi ? 6.8 : isSemi ? 5.2 : 4.4) * s * headScale
  const headRy = (isChibi ? 6.2 : isSemi ? 4.8 : 4.2) * s * headScale
  
  // Head volume
  R55ell(c, hx, hy, headRx, headRy, R.skin, gh)
  if (isChibi) {
    R55ell(c, hx + 1.2 * s, hy + 2.2 * s, headRx * 0.75, headRy * 0.65, R.skin, gh)
  } else {
    R55ell(c, hx + 1.0 * s, hy + 2.0 * s, headRx * 0.70, headRy * 0.60, R.skin, gh)
  }
  parts.head = { g: gh, x: hx, y: hy }
  
  // Traditional Baker's Toque
  if (R.hat === "toque") {
    const gtq = R55group(c)
    const tqRx = headRx * 1.12
    const tqRy = headRy * 0.68
    R55ell(c, hx - 0.5 * s, hy - headRy * 1.0, tqRx, tqRy, R.shirt, gtq)
    R55ell(c, hx - 1.0 * s, hy - headRy * 1.4, tqRx * 1.05, tqRy * 0.95, R.shirt, gtq)
  }
  
  // Near Arm
  if (!extra.noNearArm) arm("n", P.handN, P.elbowN, R.shirt, R.skin, sleeve)
  
  // 7. Selective Depth-Aware Contour Outline
  R55finish(c)
  
  // 8. 100% CLEAR, EXPRESSIVE FACIAL FEATURES
  const ex = Math.round(hx + (isChibi ? 1.6 : 1.4) * s)
  const ey = Math.round(hy + (isChibi ? -0.2 : 0.0) * s)
  const Thair = R55tones(R.hair)
  const Tskin = R55tones(R.skin)
  
  if (isChibi) {
    // Left eye (Front)
    c.rect(ex - 2, ey - 2, 4, 3, "#ffffff")
    c.rect(ex - 1, ey - 1, 2, 2, "#2b160a")
    c.px(ex - 2, ey - 2, "#ffffff")
    c.hline(ex - 2, ey - 3, 4, "#1b1420")
    c.hline(ex - 2, ey - 4, 3, Thair[2])
    
    // Right eye
    c.rect(ex + 3, ey - 2, 4, 3, "#ffffff")
    c.rect(ex + 4, ey - 1, 2, 2, "#2b160a")
    c.px(ex + 3, ey - 2, "#ffffff")
    c.hline(ex + 3, ey - 3, 4, "#1b1420")
    c.hline(ex + 3, ey - 4, 3, Thair[2])
    
    // Cute Tiny Handlebar Mustache & Happy Smile
    c.line(ex - 1, ey + 3, ex + 5, ey + 3, Thair[1], 2)
    c.px(ex - 2, ey + 2, Thair[0])
    c.px(ex + 6, ey + 2, Thair[0])
    c.px(ex + 2, ey + 5, "#a63a4c")
    
    // Big Rosy Pink Blushing Cheeks!
    c.rect(ex - 4, ey + 2, 2, 2, "#fca5a5")
    c.rect(ex + 7, ey + 2, 2, 2, "#fca5a5")
  } else {
    // Defined Eyebrows
    c.line(ex - 2, ey - 4, ex + 2, ey - 4, Thair[2], 1)
    c.line(ex + 3, ey - 4, ex + 7, ey - 4, Thair[2], 1)
    
    // Left eye (Front)
    c.rect(ex - 2, ey - 2, 4, 3, "#ffffff")
    c.rect(ex - 1, ey - 1, 2, 2, "#2b160a")
    c.px(ex - 2, ey - 2, "#ffffff")
    c.hline(ex - 2, ey - 3, 4, "#1b1420")
    
    // Right eye
    c.rect(ex + 3, ey - 2, 4, 3, "#ffffff")
    c.rect(ex + 4, ey - 1, 2, 2, "#2b160a")
    c.px(ex + 3, ey - 2, "#ffffff")
    c.hline(ex + 3, ey - 3, 4, "#1b1420")
    
    // Nose bridge
    c.px(ex + 2, ey + 1, Tskin[3])
    
    // Curled Bavarian Handlebar Mustache
    c.line(ex - 2, ey + 3, ex + 6, ey + 3, Thair[1], 2)
    c.px(ex - 3, ey + 2, Thair[0])
    c.px(ex + 7, ey + 2, Thair[0])
    c.hline(ex + 1, ey + 5, 3, "#542618")
  }
  
  return parts
}

// ------------------------------------------------------------------ Animation Poses Function
function chibiPose(kind, f, n) {
  const ph = (f / n) * Math.PI * 2
  const P = { bob: 0, lean: 0, footN: [2.0, 0], footF: [-2.0, 0], handN: [5.0, -18], handF: [-4.0, -18], head: [0, 0], elbowN: [1, 0.4], elbowF: [-1, 0.4] }
  
  if (kind === "idle") {
    // Breathing cycle
    P.bob = Math.sin(ph) > 0.3 ? -1 : 0
    P.head = [0, Math.sin(ph) * 0.4]
  }
  
  if (kind === "walk") {
    // Bouncy Chibi walk cycle
    const A = 3.6
    P.footN = [A * Math.cos(ph), Math.max(0, -Math.sin(ph)) * 2.8]
    P.footF = [A * Math.cos(ph + Math.PI), Math.max(0, -Math.sin(ph + Math.PI)) * 2.8]
    P.bob = Math.abs(Math.cos(ph)) < 0.4 ? -1.5 : 0
    P.handN = [2.0 - 3.2 * Math.cos(ph), -18]
    P.handF = [-2.0 + 3.2 * Math.cos(ph), -18]
    P.lean = Math.sin(ph) * 0.8
    P.head = [0, Math.sin(ph * 2) * 0.5]
  }
  
  if (kind === "knead") {
    // Rhythmic dough kneading at table
    const k = Math.sin(ph)
    P.tilt = 0.10 * Math.max(0, k)
    P.bob = k > 0.2 ? 1 : 0
    P.handN = [3.5 + 1.8 * k, -14 + 2.5 * Math.max(0, k)]
    P.handF = [-3.0 - 1.8 * k, -14 + 2.5 * Math.max(0, k)]
    P.elbowN = [0.2, 0.8]
    P.elbowF = [0.2, 0.8]
    P.head = [0.8 * k, 1.0 * Math.max(0, k)]
  }

  if (kind === "oven_slide") {
    // Sliding peel with raw dough into stone oven
    const t = f / n
    const thrust = Math.sin(t * Math.PI) // 0 -> 1 -> 0
    P.lean = thrust * 1.6
    P.bob = thrust > 0.4 ? 1 : 0
    P.footN = [3.2, 0]
    P.footF = [-2.8, 0]
    P.handN = [9.0 + thrust * 9.0, -16]
    P.handF = [-1.0 + thrust * 8.0, -16]
    P.head = [thrust * 1.2, thrust * 0.4]
  }

  if (kind === "aroma") {
    // Inhaling warm fresh bread aroma, hands on hips, head tilting back proudly
    const k = Math.sin(ph)
    P.bob = k > 0.3 ? -1 : 0
    P.head = [0, -1.4 * Math.max(0, k)]
    P.handN = [5.6, -15]
    P.handF = [-5.2, -15]
    P.elbowN = [1.4, 0.3]
    P.elbowF = [-1.4, 0.3]
  }

  if (kind === "sneeze") {
    // Comedic flour sneeze!
    // 0..3: buildup twitch -> 4..5: violent backward ACHOO! -> 6..9: white flour ghost blinking
    if (f < 4) {
      const q = f / 3
      P.tilt = 0.12 * q
      P.head = [1.4 * q, 1.0 * q]
      P.handN = [4.0, -16]
      P.handF = [-3.5, -16]
    } else if (f < 6) {
      P.tilt = -0.25
      P.lean = -2.2
      P.bob = -2
      P.head = [-2.2, -2.0]
      P.handN = [7.5, -24]
      P.handF = [-7.5, -24]
    } else {
      P.tilt = 0.04
      P.bob = 0
      P.head = [0, 0.5]
      P.handN = [4.0, -16]
      P.handF = [-3.5, -16]
    }
  }

  if (kind === "carry") {
    // Bouncy walk carrying bread basket
    const A = 3.2
    P.footN = [A * Math.cos(ph), Math.max(0, -Math.sin(ph)) * 2.5]
    P.footF = [A * Math.cos(ph + Math.PI), Math.max(0, -Math.sin(ph + Math.PI)) * 2.5]
    P.bob = Math.abs(Math.cos(ph)) < 0.4 ? -1.5 : 0
    P.handN = [4.5, -16 + Math.sin(ph) * 0.8]
    P.handF = [-4.0, -16 - Math.sin(ph) * 0.8]
    P.lean = Math.sin(ph) * 0.6
    P.head = [0, Math.sin(ph * 2) * 0.4]
  }
  
  return P
}

const R_CHIBI = {
  style: "chibi",
  skin: "#e09367",
  shirt: "#f5f0fc",
  pants: "#63402e",
  shoe: "#382318",
  hair: "#733e1f",
  apron: "#dfd9eb",
  hat: "toque",
  prop: "peel",
  breadAtWaist: true,
  build: 0.90
}

const R_SEMI = {
  style: "semi_chibi",
  skin: "#e09367",
  shirt: "#f5f0fc",
  pants: "#63402e",
  shoe: "#382318",
  hair: "#733e1f",
  apron: "#dfd9eb",
  hat: "toque",
  prop: "peel",
  breadAtWaist: true,
  build: 0.96
}

// =========================================================================
// SPRITES
// =========================================================================
sprite("settler_baker_chibi", { w: 66, h: 78, outline: "k" }, (c) => {
  drawSettlerBody(c, R_CHIBI, chibiPose("idle", 0, 4), 33, 72, 1.15)
})

sprite("settler_baker_semi_chibi", { w: 70, h: 90, outline: "k" }, (c) => {
  drawSettlerBody(c, R_SEMI, chibiPose("idle", 0, 4), 35, 84, 1.25)
})

// =========================================================================
// ANIMATIONS
// =========================================================================
// 1. Chibi Baker Idle (Breathing loop)
anim("anim_chibi_baker_idle", { w: 66, h: 78, frames: 4, fps: 4, outline: "k" }, (c) => {
  drawSettlerBody(c, R_CHIBI, chibiPose("idle", c.frame, 4), 33, 72, 1.15)
})

// 2. Chibi Baker Walk Cycle (8-frame bouncy walk)
anim("anim_chibi_baker_walk", { w: 66, h: 78, frames: 8, fps: 8, outline: "k" }, (c) => {
  drawSettlerBody(c, R_CHIBI, chibiPose("walk", c.frame, 8), 33, 72, 1.15)
})

// 3. Chibi Baker Kneading Dough (6-frame dough squash)
anim("anim_chibi_baker_knead", { w: 66, h: 78, frames: 6, fps: 6, outline: "k" }, (c) => {
  const rKnead = { ...R_CHIBI, prop: null, breadAtWaist: false }
  drawSettlerBody(c, rKnead, chibiPose("knead", c.frame, 6), 33, 72, 1.15)
  // Dough Trough Table in front
  c.rect(22, 54, 26, 12, "#704825")
  c.hline(22, 54, 26, "#a36e3c")
  // Squashing Dough Ball
  const k = Math.sin((c.frame / 6) * Math.PI * 2)
  c.ellipse(35, 52 + (k > 0 ? 1 : 0), 7 + (k > 0 ? 1 : 0), 4 - (k > 0 ? 1 : 0), "#f5f0fc")
})

// 4. Chibi Baker Stone Oven Baking (8-frame slide & bake)
anim("anim_chibi_baker_oven", { w: 88, h: 78, frames: 8, fps: 6, outline: "k" }, (c) => {
  const rOven = { ...R_CHIBI, prop: null, breadAtWaist: false }
  const f = c.frame
  const thrust = Math.sin((f / 8) * Math.PI)
  
  // Stone Hearth Oven on the right
  c.rect(56, 30, 30, 44, "#4b5563")
  c.rect(58, 28, 26, 4, "#6b7280")
  c.rect(62, 18, 12, 12, "#374151") // chimney
  // Chimney smoke
  c.ellipse(68 - (f % 4), 14 - f, 3 + (f % 3), 3 + (f % 3), "#e2e8f0")
  
  // Arched Oven Opening
  c.rect(56, 46, 24, 26, "#1f2937")
  c.ellipse(68, 46, 12, 12, "#1f2937")
  // Glowing Hot Embers
  const emberCol = f % 2 === 0 ? "#ea580c" : "#f97316"
  const fireCol = f % 2 === 0 ? "#fbbf24" : "#f59e0b"
  c.ellipse(68, 62, 9, 6, emberCol)
  c.ellipse(68, 60, 6, 4, fireCol)
  c.px(66 + (f % 3), 56 - (f % 2), "#fef08a") // spark
  
  // Baker Body
  drawSettlerBody(c, rOven, chibiPose("oven_slide", f, 8), 28, 72, 1.15)
  
  // Wooden Peel sliding in and out
  const peelX = 26 + thrust * 22
  const peelY = 56
  c.line(peelX - 18, peelY + 4, peelX + 16, peelY - 1, "#a36e3c", 2)
  c.rect(peelX + 14, peelY - 4, 10, 6, "#d49959")
  
  // Raw Dough going into oven (disappears inside after f=4)
  if (f <= 4) {
    c.ellipse(peelX + 18, peelY - 4, 4, 2.5, "#fef3c7")
  }
})

// 5. Chibi Baker Aroma Bliss & Settlement Sparrow (8-frame sniffing & pecking)
anim("anim_chibi_baker_aroma", { w: 76, h: 78, frames: 8, fps: 4, outline: "k" }, (c) => {
  const rAroma = { ...R_CHIBI, prop: null, breadAtWaist: false }
  const f = c.frame
  drawSettlerBody(c, rAroma, chibiPose("aroma", f, 8), 34, 72, 1.15)
  
  // Cooling Bread Basket on right
  c.rect(52, 58, 20, 14, "#854d0e")
  c.hline(50, 58, 24, "#a16207")
  c.ellipse(58, 56, 5, 3, "#d97706") // golden loaf 1
  c.ellipse(66, 55, 5, 3.5, "#b45309") // golden loaf 2
  
  // Golden Aroma Swirls floating upwards (~ ~ ~)
  const aY = 52 - f * 3
  const aX = 60 + Math.sin((f / 8) * Math.PI * 4) * 3
  c.line(aX, aY, aX + 2, aY - 3, "#fef08a", 1)
  c.line(aX + 2, aY - 3, aX - 1, aY - 6, "#fef08a", 1)
  c.line(aX - 1, aY - 6, aX + 3, aY - 9, "#fde047", 1)
  
  // Settlement Sparrow on left (8px mini-prop)
  const spX = 12 + (f < 4 ? 0 : 2)
  const spY = 70 + (f < 4 ? 0 : (f % 2 === 0 ? -1 : 0))
  c.rect(spX, spY, 5, 3, "#78350f") // body
  c.rect(spX + 4, spY - 1, 3, 3, "#92400e") // head
  c.px(spX + 7, spY, "#f59e0b") // beak
  c.px(spX + 5, spY - 1, "#ffffff") // eye
  c.px(spX + 1, spY + 3, "#451a03") // feet
  // Bread crumb on floor
  c.px(spX + 8, spY + 2, "#fde68a")
})

// 6. Chibi Baker Comedic Flour Sneeze (10-frame ACHOO explosion)
anim("anim_chibi_baker_sneeze", { w: 74, h: 78, frames: 10, fps: 6, outline: "k" }, (c) => {
  const f = c.frame
  const isDusted = f >= 5
  const rSneeze = {
    ...R_CHIBI,
    hair: isDusted ? "#f8fafc" : "#733e1f",
    shirt: isDusted ? "#ffffff" : "#f5f0fc",
    pants: isDusted ? "#cbd5e1" : "#63402e",
    apron: isDusted ? "#ffffff" : "#dfd9eb",
    prop: null,
    breadAtWaist: false
  }
  
  drawSettlerBody(c, rSneeze, chibiPose("sneeze", f, 10), 36, 72, 1.15)
  
  // Dough table in front
  c.rect(24, 56, 24, 12, "#704825")
  c.hline(24, 56, 24, "#a36e3c")
  
  // Frame 4 & 5: Explosive Flour Cloud Blast! (*POOF*)
  if (f === 4 || f === 5) {
    const r = f === 4 ? 12 : 18
    c.ellipse(36, 44, r, r, "#ffffff")
    c.ellipse(28, 40, r * 0.7, r * 0.7, "#f1f5f9")
    c.ellipse(44, 42, r * 0.7, r * 0.7, "#f1f5f9")
    c.ellipse(36, 32, r * 0.6, r * 0.6, "#e2e8f0")
    // Sparkle dust specks
    c.px(18, 30, "#ffffff"); c.px(54, 28, "#ffffff")
    c.px(20, 50, "#ffffff"); c.px(56, 48, "#ffffff")
  }
  
  // Frame 6..9: White powder floating down slowly
  if (f >= 6) {
    c.px(26 + (f * 3) % 20, 36 + f * 2, "#f8fafc")
    c.px(34 - (f * 2) % 15, 32 + f * 3, "#f8fafc")
    c.px(44 + (f * 4) % 18, 38 + f * 2, "#f8fafc")
  }
})

// 7. Chibi Baker Carry Bread Basket (8-frame bouncy delivery)
anim("anim_chibi_baker_carry", { w: 66, h: 78, frames: 8, fps: 8, outline: "k" }, (c) => {
  const rCarry = { ...R_CHIBI, prop: null, breadAtWaist: false }
  const f = c.frame
  drawSettlerBody(c, rCarry, chibiPose("carry", f, 8), 33, 72, 1.15)
  
  // Wicker Basket held in front
  const bob = Math.abs(Math.cos((f / 8) * Math.PI * 2)) < 0.4 ? -1.5 : 0
  const bX = 30, bY = 52 + bob
  c.rect(bX - 7, bY, 15, 9, "#854d0e")
  c.hline(bX - 8, bY, 17, "#a16207")
  // Golden Bread Loaves inside
  c.ellipse(bX - 3, bY - 2, 4, 3, "#d97706")
  c.ellipse(bX + 3, bY - 2, 4, 3, "#b45309")
  // Crust slashes
  c.px(bX - 4, bY - 3, "#fef3c7")
  c.px(bX + 2, bY - 3, "#fef3c7")
})

// =========================================================================
// STANDALONE PROPS (Living Settlement Diorama)
// =========================================================================
// 1. Stone Hearth Oven Prop
sprite("prop_stone_hearth", { w: 46, h: 50, outline: "k" }, (c) => {
  c.rect(4, 12, 38, 36, "#4b5563")
  c.rect(6, 10, 34, 4, "#6b7280")
  c.rect(12, 0, 14, 12, "#374151") // chimney
  // Stone texture highlights
  c.hline(8, 20, 10, "#9ca3af"); c.hline(24, 28, 12, "#9ca3af")
  // Oven Arch
  c.rect(8, 24, 30, 24, "#1f2937")
  c.ellipse(23, 24, 15, 15, "#1f2937")
  // Glowing fire bed
  c.ellipse(23, 40, 11, 6, "#ea580c")
  c.ellipse(23, 38, 8, 4, "#f59e0b")
  c.ellipse(23, 36, 4, 2, "#fef08a")
})

// 2. Oak Dough Kneading Table Prop
sprite("prop_dough_table", { w: 38, h: 26, outline: "k" }, (c) => {
  c.rect(4, 10, 30, 14, "#704825")
  c.hline(2, 8, 34, "#a36e3c") // thick table top
  c.rect(6, 14, 4, 10, "#543317") // left leg
  c.rect(28, 14, 4, 10, "#543317") // right leg
  // Rolling pin
  c.rect(6, 6, 12, 3, "#d4a373")
  // Flour dust dusting on table
  c.hline(16, 7, 8, "#ffffff")
  // Dough ball
  c.ellipse(24, 5, 5, 3, "#fef3c7")
})

// 3. Wicker Bread Basket Prop
sprite("prop_bread_basket", { w: 26, h: 22, outline: "k" }, (c) => {
  c.rect(3, 8, 20, 12, "#854d0e")
  c.hline(2, 7, 22, "#a16207")
  // Loaves
  c.ellipse(8, 5, 4, 3, "#d97706")
  c.ellipse(14, 4, 4.5, 3.5, "#b45309")
  c.ellipse(19, 5, 4, 3, "#d97706")
})

// 4. Swaying Gilded Pretzel Guild Sign Prop
sprite("prop_pretzel_sign", { w: 24, h: 28, outline: "k" }, (c) => {
  // Wrought iron wall mount bracket
  c.vline(3, 2, 22, "#1e293b", 2)
  c.hline(3, 4, 16, "#334155", 2)
  c.line(3, 14, 14, 4, "#334155")
  // Hanging chains
  c.vline(9, 6, 4, "#64748b")
  c.vline(15, 6, 4, "#64748b")
  // Golden Pretzel
  c.ellipse(12, 16, 6, 6, "#eab308")
  c.ellipse(12, 16, 4, 4, "#00000000") // hollow outer
  c.px(10, 16, "#ca8a04"); c.px(14, 16, "#ca8a04")
  c.hline(10, 18, 5, "#eab308")
})

// 5. Settlement Sparrow Prop (Pecking crumbs)
sprite("prop_sparrow", { w: 16, h: 14, outline: "k" }, (c) => {
  c.rect(3, 5, 6, 4, "#78350f") // body
  c.rect(8, 3, 4, 4, "#92400e") // head
  c.px(12, 5, "#f59e0b") // beak
  c.px(9, 4, "#ffffff") // eye
  c.px(4, 9, "#451a03"); c.px(6, 9, "#451a03") // feet
  c.px(14, 8, "#fde68a") // bread crumb
})
