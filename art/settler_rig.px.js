// Harrow Settlers — Parametric 3D Shaded Body Rig (Ported from Last Fortress real55 Engine)
// Driven strictly by numbers: Chibi, Semi-Chibi, and Standard stylized settler variants.
// Regular body weight (NOT muscular). 
// Built on: 2-bone Inverse Kinematics (IK), 3D Lambert normal-per-pixel shading,
// 5-tone hue-shifted auto-ramping (#fff4d6 warm sunlight -> cool shadow), and selective depth contours.

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
  // Hue shift: warm sunlight highlight (#fff4d6) -> cool violet shadow
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
// Sun angle from top-left (isometric key light)
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
      c.__e[i] = T[4] // record deepest shadow tone for edge outline
    }
  }
  return g
}

// 3D Tapered Capsule Primitive (limbs, neck, fingers)
function R55cap(c, ax, ay, ar, bx, by, br, mat, gid, opts) {
  const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1e-6, pad = Math.max(ar, br) + 1
  return R55fill(c, [Math.min(ax, bx) - pad, Math.min(ay, by) - pad, Math.max(ax, bx) + pad, Math.max(ay, by) + pad], (x, y) => {
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L2))
    const qx = x - (ax + dx * t), qy = y - (ay + dy * t), r = ar + (br - ar) * t, d2 = qx * qx + qy * qy
    if (d2 > r * r) return null
    return [qx / r, qy / r, Math.sqrt(Math.max(0, 1 - d2 / (r * r)))]
  }, mat, gid, opts)
}

// 3D Ellipsoid Primitive (head, shoulders, hips, boots)
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

// 3D Shaded Cylindrical Polygon (torso, apron, tunic)
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

// Selective Outline Contours (depth-aware silhouette edging)
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

// ------------------------------------------------------------------ 2-Bone Inverse Kinematics (IK)
function R55ik(hx, hy, ax, ay, l1, l2, prefX, prefY) {
  let dx = ax - hx, dy = ay - hy, d = Math.hypot(dx, dy)
  if (d > l1 + l2 - 0.05) { const k = (l1 + l2 - 0.05) / d; dx *= k; dy *= k; d = l1 + l2 - 0.05 }
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a))
  const px = hx + (a * dx) / d, py = hy + (a * dy) / d
  let nx = -dy / d, ny = dx / d
  if (nx * prefX + ny * prefY < 0) { nx = -nx; ny = -ny }
  return [px + nx * h, py + ny * h, hx + dx, hy + dy]
}

// ------------------------------------------------------------------ Master Settler Body Rig (Parameterized)
function drawSettlerBody(c, R, P, ox, gy, s = 1.0, extra = {}) {
  const style = R.style || "semi_chibi"
  const isChibi = style === "chibi"
  const isSemi = style === "semi_chibi"
  
  // Numerical Style Multipliers:
  // Chibi: 1:2.8 ratio, large cute head (1.55x), compact cute limbs (0.58x), regular soft body weight (build: 0.90)
  // Semi-Chibi: 1:4.0 ratio, expressive stylized head (1.20x), proportional limbs (0.82x), regular body weight (build: 0.98)
  const headScale = isChibi ? 1.55 : isSemi ? 1.20 : 1.00
  const limbLen   = isChibi ? 0.58 : isSemi ? 0.82 : 1.00
  const limbThick = isChibi ? 0.80 : isSemi ? 0.86 : 1.00 // soft regular limbs (NOT muscular!)
  const build     = R.build || (isChibi ? 0.90 : isSemi ? 0.98 : 1.00) // regular body weight!
  
  const tilt = P.tilt || 0, [hdx, hdy] = P.hip || [0, 0], ct = Math.cos(tilt), st = Math.sin(tilt)
  const hipY = isChibi ? -20 : isSemi ? -24 : -27
  const neckY = isChibi ? -33 : isSemi ? -38 : -44
  const headY = isChibi ? -41 : isSemi ? -46 : -51
  
  const pt = (x, y, upper) => {
    const up = upper || y < hipY
    let px = x + (y < hipY || upper ? (P.lean * (hipY - y)) / 22 : 0), py = y + (y < hipY + 5 || upper ? P.bob : 0)
    if (up && tilt) { const dx = px, dy = py - hipY; px = dx * ct - dy * st; py = hipY + dx * st + dy * ct }
    if (up || y < hipY + 5) { px += hdx; py += hdy }
    return [ox + px * s, gy + py * s]
  }
  const far = (hex) => R55dim(hex, 0.84)
  const parts = {}
  
  const legL = (isChibi ? 7.2 : isSemi ? 10.6 : 13.0) * s
  
  // 1. Legs (IK 2-bone capsules with regular, soft villager taper - NOT muscular)
  const leg = (side, foot, matP, matS) => {
    const hx = side === "n" ? (isChibi ? 2.2 : 2.6) : (isChibi ? -2.2 : -2.6)
    const [Hx, Hy] = pt(hx, hipY)
    const Ax = ox + foot[0] * s + (side === "n" ? 1.0 : -1.0) * s, Ay = gy - (2 + foot[1] + (side === "n" ? 0 : 1.2)) * s
    const [Kx, Ky] = R55ik(Hx, Hy, Ax, Ay, legL, legL, 1, 0)
    const g = R55group(c)
    // Thigh capsule (smooth regular weight)
    R55cap(c, Hx, Hy, 3.2 * s * limbThick, Kx, Ky, 2.6 * s * limbThick, matP, g)
    // Calf capsule
    R55cap(c, Kx, Ky, 2.6 * s * limbThick, Ax, Ay, 2.2 * s * limbThick, matP, g)
    // Soft Leather Work Shoes (Cute rounded for chibi)
    const gs = R55group(c)
    const shoeW = (isChibi ? 3.4 : 3.8) * s
    const shoeH = (isChibi ? 2.0 : 2.2) * s
    R55ell(c, Ax + 1.0 * s, Ay + 0.3 * s, shoeW, shoeH, matS, gs)
    parts[side + "leg"] = { g, Hx, Hy, Kx, Ky, Ax, Ay, gs }
  }
  
  leg("f", P.footF, far(R.pants), far(R.shoe))
  leg("n", P.footN, R.pants, R.shoe)
  
  // 2. Arms (Soft, regular sleeves - NOT muscular biceps)
  const armL1 = (isChibi ? 5.5 : isSemi ? 7.6 : 9.4) * s
  const armL2 = (isChibi ? 5.0 : isSemi ? 7.0 : 8.8) * s
  
  const arm = (side, hand, elbowPref, matSleeve, matSkin, sleeve) => {
    const sx = side === "n" ? (isChibi ? 4.8 : 5.4) : (isChibi ? -4.5 : -5.0)
    const [Sx, Sy] = pt(sx, neckY + 2.5)
    const [Wx, Wy] = pt(hand[0], hand[1], true)
    const [Ex, Ey, Wx2, Wy2] = R55ik(Sx, Sy, Wx, Wy, armL1, armL2, elbowPref[0], elbowPref[1])
    const g = R55group(c)
    // Regular upper arm (even smooth capsule, no bulging bicep)
    R55cap(c, Sx, Sy, 2.7 * s * limbThick, Ex, Ey, 2.2 * s * limbThick, sleeve === "none" ? matSkin : matSleeve, g)
    // Regular forearm
    if (sleeve === "short") {
      R55cap(c, Sx, Sy, 2.9 * s * limbThick, Sx + (Ex - Sx) * 0.5, Sy + (Ey - Sy) * 0.5, 2.5 * s * limbThick, matSleeve, g) // sleeve cuff
      R55cap(c, Ex, Ey, 2.1 * s * limbThick, Wx2, Wy2, 1.7 * s * limbThick, matSkin, g)
    } else {
      R55cap(c, Ex, Ey, 2.3 * s * limbThick, Wx2, Wy2, 1.8 * s * limbThick, matSleeve, g)
    }
    // Cute Hand
    const gh = R55group(c)
    R55ell(c, Wx2 + (Wx2 - Ex) * 0.15, Wy2 + (Wy2 - Ey) * 0.15 + 0.4, 2.0 * s * limbThick, 2.0 * s * limbThick, matSkin, gh)
    parts[side + "arm"] = { g, gh, Sx, Sy, Ex, Ey, Wx: Wx2, Wy: Wy2 }
  }
  
  const sleeve = R.sleeves || "short"
  if (!extra.noFarArm) arm("f", P.handF, P.elbowF, far(R.shirt), far(R.skin), sleeve)
  
  // 3. Pelvis & Regular Torso (Soft, natural regular body weight - NOT muscular)
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
  
  // Soft rounded shoulders (compact, not broad)
  { const [x, y] = pt(-4.8 * build, neckY + 2.5); R55ell(c, x, y, 2.5 * s, 2.4 * s, R.shirt, gt) }
  { const [x, y] = pt(5.0 * build, neckY + 2.5); R55ell(c, x, y, 2.6 * s, 2.5 * s, R.shirt, gt) }
  parts.torso = gt; parts.pelvis = gp
  
  // 4. Baker's Apron (Cute regular coverage)
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
  
  // 5. Neck & Head (Cute Proportions!)
  const gn = R55group(c)
  { const [x, y] = pt(0.5, neckY); R55cap(c, x, y + 1.5 * s, 2.2 * s, x + 0.2, y - 1.0 * s, 1.8 * s, R.skin, gn) }
  
  const gh = R55group(c)
  const [hx, hy] = pt(0.8 + P.head[0], headY + P.head[1])
  const headRx = (isChibi ? 6.8 : isSemi ? 5.2 : 4.4) * s * headScale
  const headRy = (isChibi ? 6.2 : isSemi ? 4.8 : 4.2) * s * headScale
  
  // Big Cute Cheeks for Chibi!
  R55ell(c, hx, hy, headRx, headRy, R.skin, gh)
  if (isChibi) {
    R55ell(c, hx + 1.4 * s, hy + 2.4 * s, headRx * 0.75, headRy * 0.65, R.skin, gh) // chubby cheek
  } else {
    R55ell(c, hx + 1.0 * s, hy + 2.2 * s, headRx * 0.70, headRy * 0.60, R.skin, gh) // friendly chin
  }
  parts.head = { g: gh, x: hx, y: hy }
  
  // Near Arm (in front)
  if (!extra.noNearArm) arm("n", P.handN, P.elbowN, R.shirt, R.skin, sleeve)
  
  // 6. Selective Depth-Aware Contour Outline
  R55finish(c)
  
  // 7. Micro-Details: Big Expressive Eyes & Cute Mustache
  const Tskin = R55tones(R.skin)
  const ex = hx + (isChibi ? 1.6 : 1.4) * s
  const ey = hy + (isChibi ? -0.2 : 0.0) * s
  
  if (isChibi) {
    // Big Sparkling Anime/Chibi Eyes!
    const eyeW = Math.round(3.4 * s), eyeH = Math.round(3.2 * s)
    // Left eye
    c.rect(Math.round(ex - 1.2 * s), Math.round(ey - 1.0 * s), eyeW, eyeH, "#ffffff")
    c.rect(Math.round(ex - 0.6 * s), Math.round(ey - 0.6 * s), Math.round(2.2 * s), Math.round(2.6 * s), "#472312") // large warm iris
    c.px(Math.round(ex - 1.0 * s), Math.round(ey - 0.8 * s), "#ffffff") // bright catchlight!
    c.px(Math.round(ex + 0.4 * s), Math.round(ey + 0.8 * s), "#ffffff") // secondary sparkle
    
    // Right eye
    c.rect(Math.round(ex + 3.2 * s), Math.round(ey - 1.0 * s), eyeW, eyeH, "#ffffff")
    c.rect(Math.round(ex + 3.8 * s), Math.round(ey - 0.6 * s), Math.round(2.2 * s), Math.round(2.6 * s), "#472312")
    c.px(Math.round(ex + 3.4 * s), Math.round(ey - 0.8 * s), "#ffffff")
    
    // Cute Tiny Handlebar Mustache & Rosy Cheek Blush
    const Thair = R55tones(R.hair)
    c.line(Math.round(ex - 0.8 * s), Math.round(ey + 3.2 * s), Math.round(ex + 5.6 * s), Math.round(ey + 3.2 * s), Thair[2], Math.round(1.6 * s))
    c.px(Math.round(ex - 1.4 * s), Math.round(ey + 2.6 * s), Thair[1])
    c.px(Math.round(ex + 6.2 * s), Math.round(ey + 2.6 * s), Thair[1])
    // Rosy pink blush
    c.ellipse(Math.round(ex - 2.8 * s), Math.round(ey + 2.2 * s), Math.round(1.8 * s), Math.round(1.2 * s), "#fca5a5")
    c.ellipse(Math.round(ex + 6.8 * s), Math.round(ey + 2.2 * s), Math.round(1.8 * s), Math.round(1.2 * s), "#fca5a5")
  } else {
    // Semi-Chibi Expressive Eyes (Refined Settlers II style)
    c.rect(Math.round(ex - 0.6 * s), Math.round(ey - 0.6 * s), Math.round(2.8 * s), Math.round(2.0 * s), "#ffffff")
    c.px(Math.round(ex + 0.6 * s), Math.round(ey - 0.1 * s), "#3d1f0d")
    c.px(Math.round(ex - 0.3 * s), Math.round(ey - 0.5 * s), "#ffffff") // catchlight
    c.rect(Math.round(ex + 2.8 * s), Math.round(ey - 0.6 * s), Math.round(2.6 * s), Math.round(2.0 * s), "#ffffff")
    c.px(Math.round(ex + 3.8 * s), Math.round(ey - 0.1 * s), "#3d1f0d")
    
    // Curled Mustache
    const Thair = R55tones(R.hair)
    c.line(Math.round(ex - 1.0 * s), Math.round(ey + 3.0 * s), Math.round(ex + 5.2 * s), Math.round(ey + 3.0 * s), Thair[2], Math.round(1.6 * s))
    c.px(Math.round(ex - 1.6 * s), Math.round(ey + 2.4 * s), Thair[1])
    c.px(Math.round(ex + 5.8 * s), Math.round(ey + 2.4 * s), Thair[1])
  }
  
  // Traditional Baker's Toque / Cap (Proportionate to Head!)
  if (R.hat === "toque") {
    const gtq = R55group(c)
    const tqRx = headRx * 1.15
    const tqRy = headRy * 0.75
    R55ell(c, hx, hy - headRy * 0.9, tqRx, tqRy, R.shirt, gtq)
    R55ell(c, hx - 0.4 * s, hy - headRy * 1.3, tqRx * 1.08, tqRy * 1.05, R.shirt, gtq)
  }
  
  // Wooden Baker's Peel & Sourdough Bread Loaf
  if (R.prop === "peel") {
    const [wx, wy] = parts.narm ? [parts.narm.Wx, parts.narm.Wy] : pt(5, -20, true)
    // Wood handle
    c.line(Math.round(wx - 2 * s), Math.round(wy - (isChibi ? 16 : 22) * s), Math.round(wx - 2 * s), Math.round(wy + (isChibi ? 14 : 18) * s), "#85542a", Math.round(1.5 * s))
    // Paddle Blade
    const bladeW = Math.round((isChibi ? 11 : 14) * s)
    const bladeH = Math.round((isChibi ? 9 : 12) * s)
    const bladeY = Math.round(wy - (isChibi ? 25 : 32) * s)
    c.rect(Math.round(wx - bladeW / 2 - 2 * s), bladeY, bladeW, bladeH, "#a36e3c")
    c.hline(Math.round(wx - bladeW / 2 - 2 * s), bladeY, bladeW, "#d49959")
    // Crusty Sourdough Loaf
    const loafRx = Math.round((isChibi ? 4.5 : 5.8) * s)
    const loafRy = Math.round((isChibi ? 3.2 : 4.0) * s)
    c.ellipse(Math.round(wx - 2 * s), bladeY + Math.round(bladeH / 2), loafRx, loafRy, "#c77524")
    c.ellipse(Math.round(wx - 2 * s), bladeY + Math.round(bladeH / 2) - 1, loafRx - 1, loafRy - 1, "#eda239")
    c.px(Math.round(wx - 2 * s), bladeY + Math.round(bladeH / 2) - 2, "#fae2a0") // flour scoring
  }
  
  // Subtle flour smudge on apron
  if (R.apron) {
    const [fx, fy] = pt(0, hipY)
    c.ellipse(Math.round(fx), Math.round(fy + 2 * s), Math.round(2.6 * s), Math.round(1.8 * s), "#ffffff")
  }
  
  return parts
}

// =========================================================================
// 1. CHIBI SETTLER BAKER (Adorable 1:2.8 proportions, regular body weight)
// Canvas: 60x70, height: ~50px
// =========================================================================
sprite("settler_baker_chibi", { w: 60, h: 72, outline: "k" }, (c) => {
  const P = { bob: 0, lean: 0, footN: [2.0, 0], footF: [-2.0, 0], handN: [5.0, -18], handF: [-4.0, -18], head: [0, 0], elbowN: [-1, 0.4], elbowF: [-1, 0.4] }
  const R = {
    style: "chibi",
    skin: "#e09367",
    shirt: "#f5f0fc",
    pants: "#63402e",
    shoe: "#382318",
    hair: "#733e1f",
    apron: "#dfd9eb",
    hat: "toque",
    prop: "peel",
    build: 0.90 // regular soft weight, NOT muscular
  }
  drawSettlerBody(c, R, P, 30, 68, 1.15)
})

// =========================================================================
// 2. SEMI-CHIBI SETTLER BAKER (Classic The Settlers II 1:4.0 golden ratio)
// Canvas: 60x82, height: ~68px
// =========================================================================
sprite("settler_baker_semi_chibi", { w: 64, h: 84, outline: "k" }, (c) => {
  const P = { bob: 0, lean: 0, footN: [2.5, 0], footF: [-2.5, 0], handN: [5.8, -23], handF: [-4.8, -23], head: [0, 0], elbowN: [-1, 0.4], elbowF: [-1, 0.4] }
  const R = {
    style: "semi_chibi",
    skin: "#e09367",
    shirt: "#f5f0fc",
    pants: "#63402e",
    shoe: "#382318",
    hair: "#733e1f",
    apron: "#dfd9eb",
    hat: "toque",
    prop: "peel",
    build: 0.96 // regular normal villager weight, NOT muscular
  }
  drawSettlerBody(c, R, P, 32, 80, 1.25)
})
