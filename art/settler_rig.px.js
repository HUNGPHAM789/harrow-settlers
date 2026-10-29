// Harrow Settlers — Parametric 3D Shaded Body Rig (Ported from Last Fortress real55 Engine)
// Eliminates manual box drawing (c.rect / c.line). 
// Built on: 2-bone Inverse Kinematics (IK), 3D Lambert normal-per-pixel shading,
// 5-tone hue-shifted auto-ramping (#fff4d6 warm sunlight -> cool shadow), and selective depth contours.

pal({
  k: "#1b1420", // ink contour
  w: "#ffffff",
  y: "#f5b838"
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

// ------------------------------------------------------------------ Master Settler Body Rig
function drawSettlerBody(c, R, P, ox, gy, s = 1.0, extra = {}) {
  const tilt = P.tilt || 0, [hdx, hdy] = P.hip || [0, 0], ct = Math.cos(tilt), st = Math.sin(tilt)
  const pt = (x, y, upper) => {
    const up = upper || y < -26
    let px = x + (y < -27 || upper ? (P.lean * (-27 - y)) / 22 : 0), py = y + (y < -20 || upper ? P.bob : 0)
    if (up && tilt) { const dx = px, dy = py + 27; px = dx * ct - dy * st; py = -27 + dx * st + dy * ct }
    if (up || y < -22) { px += hdx; py += hdy }
    return [ox + px * s, gy + py * s]
  }
  const far = (hex) => R55dim(hex, 0.84)
  const parts = {}
  const legL = 13.0 * s
  
  // 1. Legs (IK 2-bone capsules with realistic muscle taper)
  const leg = (side, foot, matP, matS) => {
    const hx = side === "n" ? 2.8 : -2.8
    const [Hx, Hy] = pt(hx, -27)
    const Ax = ox + foot[0] * s + (side === "n" ? 1.2 : -1.2) * s, Ay = gy - (2 + foot[1] + (side === "n" ? 0 : 1.5)) * s
    const [Kx, Ky] = R55ik(Hx, Hy, Ax, Ay, legL, legL, 1, 0)
    const g = R55group(c)
    // Thigh capsule (broad, muscular)
    R55cap(c, Hx, Hy, 4.2 * s, Kx, Ky, 3.4 * s, matP, g)
    // Calf capsule
    R55cap(c, Kx, Ky, 3.4 * s, Ax, Ay, 2.8 * s, matP, g)
    // Heavy Leather Work Boot
    const gs = R55group(c)
    R55ell(c, Ax + 1.2 * s, Ay + 0.4 * s, 4.2 * s, 2.4 * s, matS, gs)
    R55cap(c, Ax - 1.2 * s, Ay - 0.2 * s, 2.6 * s, Ax + 3.8 * s, Ay + 0.8 * s, 2.0 * s, matS, gs)
    parts[side + "leg"] = { g, Hx, Hy, Kx, Ky, Ax, Ay, gs }
  }
  
  // Far leg first
  leg("f", P.footF, far(R.pants), far(R.shoe))
  leg("n", P.footN, R.pants, R.shoe)
  
  // 2. Arms & Muscular Forearms
  const arm = (side, hand, elbowPref, matSleeve, matSkin, sleeve) => {
    const sx = side === "n" ? 6.2 : -5.8
    const [Sx, Sy] = pt(sx, -42.0)
    const [Wx, Wy] = pt(hand[0], hand[1], true)
    const [Ex, Ey, Wx2, Wy2] = R55ik(Sx, Sy, Wx, Wy, 9.4 * s, 8.8 * s, elbowPref[0], elbowPref[1])
    const g = R55group(c)
    // Shoulder & bicep
    R55cap(c, Sx, Sy, 3.6 * s, Ex, Ey, 2.8 * s, sleeve === "none" ? matSkin : matSleeve, g)
    // Forearm (muscular, rolled-up sleeve exposes strong bare skin)
    if (sleeve === "short") {
      R55cap(c, Sx, Sy, 3.8 * s, Sx + (Ex - Sx) * 0.5, Sy + (Ey - Sy) * 0.5, 3.2 * s, matSleeve, g) // rolled fabric cuff
      R55cap(c, Ex, Ey, 2.6 * s, Wx2, Wy2, 2.0 * s, matSkin, g)
    } else {
      R55cap(c, Ex, Ey, 2.8 * s, Wx2, Wy2, 2.2 * s, matSleeve, g)
    }
    // Hand
    const gh = R55group(c)
    R55ell(c, Wx2 + (Wx2 - Ex) * 0.15, Wy2 + (Wy2 - Ey) * 0.15 + 0.5, 2.4 * s, 2.4 * s, matSkin, gh)
    parts[side + "arm"] = { g, gh, Sx, Sy, Ex, Ey, Wx: Wx2, Wy: Wy2 }
  }
  
  const sleeve = R.sleeves || "short"
  if (!extra.noFarArm) arm("f", P.handF, P.elbowF, far(R.shirt), far(R.skin), sleeve)
  
  // 3. Pelvis & Heavy Torso (Broad Settlers Bavarian Barrel Chest)
  const gp = R55group(c)
  { const [x, y] = pt(0.2, -28.2); R55ell(c, x, y, 7.8 * s, 4.4 * s, R.pants, gp) }
  
  const gt = R55group(c)
  const build = R.build || 1.25 // Robust medieval build
  const tp = []
  for (const [x, y] of [
    [-5.6, -45], [5.8, -45], [8.4, -43], [8.6, -39], [7.8, -34], [7.0, -30], [7.4, -27],
    [-6.8, -27], [-6.6, -30], [-7.2, -34], [-8.0, -39], [-7.8, -43]
  ]) {
    tp.push(...pt(x * build, y))
  }
  R55poly(c, tp, R.shirt, gt, { round: 0.88 })
  
  // Rounded Shoulders
  { const [x, y] = pt(-6.0 * build, -42.0); R55ell(c, x, y, 3.4 * s, 3.2 * s, R.shirt, gt) }
  { const [x, y] = pt(6.2 * build, -42.0); R55ell(c, x, y, 3.6 * s, 3.4 * s, R.shirt, gt) }
  parts.torso = gt; parts.pelvis = gp
  
  // 4. Heavy Canvas Baker's Apron (Overlay over torso)
  if (R.apron) {
    const ga = R55group(c)
    const ap = []
    for (const [x, y] of [
      [-4.0, -42], [4.4, -42], [5.6, -35], [6.2, -26], [6.8, -18],
      [-6.0, -18], [-5.4, -26], [-4.8, -35]
    ]) {
      ap.push(...pt(x * build, y))
    }
    R55poly(c, ap, R.apron, ga, { round: 0.85 })
    parts.apron = ga
  }
  
  // 5. Neck & Realistic Head
  const gn = R55group(c)
  { const [x, y] = pt(0.6 + P.head[0] * 0.4, -45 + P.head[1] * 0.5); R55cap(c, x, y + 2.0 * s, 3.0 * s, x + 0.3, y - 1.2 * s, 2.6 * s, R.skin, gn) }
  
  const gh = R55group(c)
  const [hx, hy] = pt(1.0 + P.head[0], -51.0 + P.head[1])
  R55ell(c, hx, hy, 5.6 * s, 6.0 * s, R.skin, gh)
  R55ell(c, hx + 1.2 * s, hy + 2.8 * s, 4.4 * s, 3.6 * s, R.skin, gh) // jaw
  parts.head = { g: gh, x: hx, y: hy }
  
  // Near Arm (in front of apron/chest)
  if (!extra.noNearArm) arm("n", P.handN, P.elbowN, R.shirt, R.skin, sleeve)
  
  // 6. Selective Depth-Aware Contour Outline
  R55finish(c)
  
  // 7. Micro-Details After Contours
  // Expressive Facial Features (Eyes, Mustache, Beard)
  const Tskin = R55tones(R.skin)
  const ex = hx + 2.0 * s, ey = hy + 0.2 * s
  // Sclera + Iris + Catchlight
  c.rect(Math.round(ex - 0.5 * s), Math.round(ey - 0.5 * s), Math.round(2.8 * s), Math.round(1.8 * s), "#ffffff")
  c.px(Math.round(ex + 0.8 * s), Math.round(ey), "#3d1f0d")
  c.px(Math.round(ex - 0.2 * s), Math.round(ey - 0.4 * s), "#ffffff") // catchlight
  c.rect(Math.round(ex + 2.6 * s), Math.round(ey - 0.5 * s), Math.round(2.6 * s), Math.round(1.8 * s), "#ffffff")
  c.px(Math.round(ex + 3.6 * s), Math.round(ey), "#3d1f0d")
  // Bushy Eyebrows & Nose Shadow
  c.line(Math.round(ex - 1.0 * s), Math.round(ey - 1.6 * s), Math.round(ex + 1.8 * s), Math.round(ey - 1.6 * s), R.hair, 1)
  c.line(Math.round(ex + 2.4 * s), Math.round(ey - 1.6 * s), Math.round(ex + 5.0 * s), Math.round(ey - 1.6 * s), R.hair, 1)
  c.px(Math.round(ex + 2.2 * s), Math.round(ey + 2.2 * s), Tskin[3]) // nose bridge shadow
  
  // Curled Bavarian Handlebar Mustache
  const Thair = R55tones(R.hair)
  c.line(Math.round(ex - 1.2 * s), Math.round(ey + 3.8 * s), Math.round(ex + 5.2 * s), Math.round(ey + 3.8 * s), Thair[2], Math.round(1.8 * s))
  c.px(Math.round(ex - 2.0 * s), Math.round(ey + 3.0 * s), Thair[1]) // curled tips
  c.px(Math.round(ex + 6.0 * s), Math.round(ey + 3.0 * s), Thair[1])
  
  // Traditional Baker's Toque / Cap (Puffed White Linen)
  if (R.hat === "toque") {
    const gtq = R55group(c)
    R55ell(c, hx, hy - 6.0 * s, 6.8 * s, 3.8 * s, R.shirt, gtq)
    R55ell(c, hx - 0.5 * s, hy - 8.4 * s, 7.8 * s, 4.4 * s, R.shirt, gtq)
    // Gather seams
    c.line(Math.round(hx - 4 * s), Math.round(hy - 5 * s), Math.round(hx - 2 * s), Math.round(hy - 9 * s), R55tones(R.shirt)[1], 1)
    c.line(Math.round(hx + 2 * s), Math.round(hy - 5 * s), Math.round(hx + 4 * s), Math.round(hy - 9 * s), R55tones(R.shirt)[1], 1)
  }
  
  // Authentic White Flour Smudges on Apron!
  if (R.apron) {
    const [fx, fy] = pt(0, -28)
    c.ellipse(Math.round(fx), Math.round(fy), Math.round(3.6 * s), Math.round(2.6 * s), "#ffffff")
    c.ellipse(Math.round(fx + 2.8 * s), Math.round(fy + 4.2 * s), Math.round(2.4 * s), Math.round(1.8 * s), "#ffffff")
    c.px(Math.round(ex - 2.4 * s), Math.round(ey + 2.0 * s), "#ffffff") // flour on cheek!
  }
  
  // Wooden Baker's Peel (Paddle) & Fresh Sourdough Loaf
  if (R.prop === "peel") {
    const [wx, wy] = parts.narm ? [parts.narm.Wx, parts.narm.Wy] : pt(7, -25, true)
    // Long ash handle
    c.line(Math.round(wx - 2 * s), Math.round(wy - 26 * s), Math.round(wx - 2 * s), Math.round(wy + 24 * s), "#85542a", Math.round(1.8 * s))
    // Paddle Blade
    c.rect(Math.round(wx - 10 * s), Math.round(wy - 38 * s), Math.round(16 * s), Math.round(14 * s), "#a36e3c")
    c.hline(Math.round(wx - 10 * s), Math.round(wy - 38 * s), Math.round(16 * s), "#d49959")
    // Crusty Sourdough Loaf
    c.ellipse(Math.round(wx - 2 * s), Math.round(wy - 31 * s), Math.round(6.8 * s), Math.round(4.6 * s), "#c77524")
    c.ellipse(Math.round(wx - 2 * s), Math.round(wy - 32 * s), Math.round(5.8 * s), Math.round(3.6 * s), "#eda239")
    // White flour scoring
    c.line(Math.round(wx - 5 * s), Math.round(wy - 32 * s), Math.round(wx + 1 * s), Math.round(wy - 30 * s), "#fae2a0", 1)
  }
  
  return parts
}

// ------------------------------------------------------------------ Sprite Definitions
// Standard 65px Settler (s = 1.25)
sprite("settler_baker_rig_65", { w: 48, h: 72, outline: "k" }, (c) => {
  const P = { bob: 0, lean: 0, footN: [2.5, 0], footF: [-2.5, 0], handN: [6, -26], handF: [-5, -26], head: [0, 0], elbowN: [-1, 0.4], elbowF: [-1, 0.4] }
  const R = {
    skin: "#e09367",
    shirt: "#f5f0fc",
    pants: "#63402e",
    shoe: "#382318",
    hair: "#733e1f",
    apron: "#dfd9eb",
    hat: "toque",
    prop: "peel",
    build: 1.25
  }
  drawSettlerBody(c, R, P, 24, 68, 1.25)
})

// Modern Ultra-HD 128px Settler (s = 2.30)
sprite("settler_baker_rig_128", { w: 84, h: 142, outline: "k" }, (c) => {
  const P = { bob: 0, lean: 0, footN: [3.2, 0], footF: [-3.2, 0], handN: [7.5, -27], handF: [-6, -27], head: [0, 0], elbowN: [-1, 0.4], elbowF: [-1, 0.4] }
  const R = {
    skin: "#e09367",
    shirt: "#f5f0fc",
    pants: "#63402e",
    shoe: "#382318",
    hair: "#733e1f",
    apron: "#dfd9eb",
    hat: "toque",
    prop: "peel",
    build: 1.25
  }
  drawSettlerBody(c, R, P, 42, 136, 2.30)
})
