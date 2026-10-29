// Harrow Settlers — Parametric 3D Shaded Body Rig (Ported from Last Fortress real55 Engine)
// 100% Numerical Control: Chibi & Semi-Chibi Settlers with Regular Body Weight.
// FIXED: Completely unobstructed, 100% visible expressive faces!
// Peel/Paddle held at the side, bread held at waist level, zero face coverage.

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
      c.__e[i] = T[4]
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

// Selective Outline Contours
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
  
  // 1. Far-side Tool / Prop: Baker's Peel resting on the ground away from the body
  if (R.prop === "peel") {
    // Drawn in the background to the far left (x: ox - 12 to ox - 16), COMPLETELY CLEAR OF FACE
    const peelX = ox - (isChibi ? 12 : 14) * s
    const peelBotY = gy - 2 * s
    const peelTopY = gy - (isChibi ? 46 : 56) * s
    // Long ash handle
    c.line(Math.round(peelX), Math.round(peelBotY), Math.round(peelX), Math.round(peelTopY), "#85542a", Math.round(1.6 * s))
    // Paddle Blade angled safely away to the left
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
    // Upper arm
    R55cap(c, Sx, Sy, 2.6 * s * limbThick, Ex, Ey, 2.2 * s * limbThick, sleeve === "none" ? matSkin : matSleeve, g)
    // Forearm
    if (sleeve === "short") {
      R55cap(c, Sx, Sy, 2.8 * s * limbThick, Sx + (Ex - Sx) * 0.5, Sy + (Ey - Sy) * 0.5, 2.4 * s * limbThick, matSleeve, g)
      R55cap(c, Ex, Ey, 2.0 * s * limbThick, Wx2, Wy2, 1.7 * s * limbThick, matSkin, g)
    } else {
      R55cap(c, Ex, Ey, 2.2 * s * limbThick, Wx2, Wy2, 1.8 * s * limbThick, matSleeve, g)
    }
    // Hand
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
    R55ell(c, hx + 1.2 * s, hy + 2.2 * s, headRx * 0.75, headRy * 0.65, R.skin, gh) // chubby cheek
  } else {
    R55ell(c, hx + 1.0 * s, hy + 2.0 * s, headRx * 0.70, headRy * 0.60, R.skin, gh) // friendly chin
  }
  parts.head = { g: gh, x: hx, y: hy }
  
  // Traditional Baker's Toque (Floppy hat sitting neatly ON TOP of head, NOT over face!)
  if (R.hat === "toque") {
    const gtq = R55group(c)
    const tqRx = headRx * 1.12
    const tqRy = headRy * 0.68
    // Crown puffs up and away
    R55ell(c, hx - 0.5 * s, hy - headRy * 1.0, tqRx, tqRy, R.shirt, gtq)
    R55ell(c, hx - 1.0 * s, hy - headRy * 1.4, tqRx * 1.05, tqRy * 0.95, R.shirt, gtq)
  }
  
  // Near Arm (resting on hip or holding bread at waist level)
  if (!extra.noNearArm) arm("n", P.handN, P.elbowN, R.shirt, R.skin, sleeve)
  
  // 7. Selective Depth-Aware Contour Outline
  R55finish(c)
  
  // 8. 100% CLEAR, EXPRESSIVE FACIAL FEATURES (High Contrast, Crisp & Unobstructed!)
  const ex = Math.round(hx + (isChibi ? 1.6 : 1.4) * s)
  const ey = Math.round(hy + (isChibi ? -0.2 : 0.0) * s)
  const Thair = R55tones(R.hair)
  const Tskin = R55tones(R.skin)
  
  if (isChibi) {
    // === CHIBI FACE: Big Sparkling Anime Eyes & Rosy Blushing Cheeks ===
    // Left eye (Front)
    c.rect(ex - 2, ey - 2, 4, 3, "#ffffff")           // crisp white sclera
    c.rect(ex - 1, ey - 1, 2, 2, "#2b160a")           // dark chestnut iris & pupil
    c.px(ex - 2, ey - 2, "#ffffff")                   // bright catchlight!
    c.hline(ex - 2, ey - 3, 4, "#1b1420")             // defined upper lash line
    c.hline(ex - 2, ey - 4, 3, Thair[2])              // cute arched eyebrow
    
    // Right eye
    c.rect(ex + 3, ey - 2, 4, 3, "#ffffff")
    c.rect(ex + 4, ey - 1, 2, 2, "#2b160a")
    c.px(ex + 3, ey - 2, "#ffffff")
    c.hline(ex + 3, ey - 3, 4, "#1b1420")
    c.hline(ex + 3, ey - 4, 3, Thair[2])
    
    // Cute Tiny Handlebar Mustache & Happy Smile
    c.line(ex - 1, ey + 3, ex + 5, ey + 3, Thair[1], 2)
    c.px(ex - 2, ey + 2, Thair[0])                    // curled tip left
    c.px(ex + 6, ey + 2, Thair[0])                    // curled tip right
    c.px(ex + 2, ey + 5, "#a63a4c")                   // cute open smiling mouth!
    
    // Big Rosy Pink Blushing Cheeks!
    c.rect(ex - 4, ey + 2, 2, 2, "#fca5a5")
    c.rect(ex + 7, ey + 2, 2, 2, "#fca5a5")
  } else {
    // === SEMI-CHIBI FACE: Classic The Settlers II Friendly Expression ===
    // Defined Eyebrows
    c.line(ex - 2, ey - 4, ex + 2, ey - 4, Thair[2], 1)
    c.line(ex + 3, ey - 4, ex + 7, ey - 4, Thair[2], 1)
    
    // Left eye (Front - 4x3 crisp eye)
    c.rect(ex - 2, ey - 2, 4, 3, "#ffffff")           // white sclera
    c.rect(ex - 1, ey - 1, 2, 2, "#2b160a")           // dark chestnut iris
    c.px(ex - 2, ey - 2, "#ffffff")                   // catchlight
    c.hline(ex - 2, ey - 3, 4, "#1b1420")             // upper lid line
    
    // Right eye (4x3 crisp eye)
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
    // Friendly mouth line under mustache
    c.hline(ex + 1, ey + 5, 3, "#542618")
  }
  
  return parts
}

// =========================================================================
// 1. CHIBI SETTLER BAKER (Adorable 1:2.8 proportions, regular body weight)
// Hand on hip, wooden peel resting safely on the ground to the side!
// Canvas: 64x76, height: ~52px
// =========================================================================
sprite("settler_baker_chibi", { w: 64, h: 76, outline: "k" }, (c) => {
  // Hand on hip at waist level, completely clear of face!
  const P = { bob: 0, lean: 0, footN: [2.0, 0], footF: [-2.0, 0], handN: [5.0, -18], handF: [-4.0, -18], head: [0, 0], elbowN: [1, 0.4], elbowF: [-1, 0.4] }
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
    breadAtWaist: true, // warm bread loaf held at WAIST, far below chin!
    build: 0.90         // regular soft weight, NOT muscular
  }
  drawSettlerBody(c, R, P, 32, 70, 1.15)
})

// =========================================================================
// 2. SEMI-CHIBI SETTLER BAKER (Classic The Settlers II 1:4.0 golden ratio)
// Hand resting on belt, peel at the side, face 100% visible!
// Canvas: 68x88, height: ~70px
// =========================================================================
sprite("settler_baker_semi_chibi", { w: 68, h: 88, outline: "k" }, (c) => {
  const P = { bob: 0, lean: 0, footN: [2.5, 0], footF: [-2.5, 0], handN: [5.6, -21], handF: [-4.6, -21], head: [0, 0], elbowN: [1, 0.4], elbowF: [-1, 0.4] }
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
    breadAtWaist: true, // bread loaf at waist level!
    build: 0.96         // regular normal villager weight, NOT muscular
  }
  drawSettlerBody(c, R, P, 34, 82, 1.25)
})
