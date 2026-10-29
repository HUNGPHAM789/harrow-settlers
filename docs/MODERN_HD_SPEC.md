# HARROW SETTLERS — MODERN HD PIXEL ART SPECIFICATION (36 PX/METRE)
*Version 2.0 — October 2026*  
*Standard: Authentic The Settlers II European Medieval Realism × Last Fortress ISO(x,y,z) Engine*

---

## 1. SCALE & PROPORTION ANCHOR

### 1.1. The 65px Settler Anchor (Nominal 1.80m Adult)
In this Modern HD specification, all game geometry scales directly from the **Human Body Height**:
$$\text{Scale Ratio} = \frac{65\text{ px}}{1.80\text{ m}} \approx \mathbf{36\text{ px per metre (PPM)}}$$

| Feature | Real World Dimension | Modern HD Pixel Equivalent | Proportion / Anatomy |
| :--- | :--- | :--- | :--- |
| **Full Settler Height** | $1.80\text{ m}$ | **$65\text{ px}$** | $1.00$ (Full body) |
| **Head & Hat** | $0.25\text{ m}$ | **$9\text{ px}$** | $1 : 7.2$ (Realistic adult proportion) |
| **Torso & Tunic/Coat** | $0.60\text{ m}$ | **$22\text{ px}$** | Carved leather vest / apron |
| **Legs & Leather Boots** | $0.80\text{ m}$ | **$28\text{ px}$** | Dual-tone boots with turnover cuff |
| **Doorway Clearance** | $2.10\text{ m}$ | **$75 - 78\text{ px}$** | 65px Settler walks cleanly inside |
| **Single Storey Ceiling** | $3.00\text{ m}$ | **$108\text{ px}$** | Ample headroom with exposed rafters |
| **Carried Resource Goods** | $0.50\text{ m}$ | **$18 - 22\text{ px}$** | Oak log, flour sack, iron ingot, bread |

---

## 2. ISOMETRIC TILE & GROUND PLANE GRID

### 2.1. Strict 2:1 Dimetric Geometry
- **Tile Dimensions**: $72\text{ px}$ width $\times$ $36\text{ px}$ height ($HW = 36\text{ px}, HH = 18\text{ px}$).
- **World Unit**: $1\text{ Tile} = 2.0\text{ m} \times 2.0\text{ m}$ ground patch.
- **Isometric Slope**: $\frac{\Delta y}{\Delta x} = \pm 0.5$ (Exact 2:1 integer stepping, zero subpixel jitter).
- **Projection Formula**:
  $$\text{ISO}(ox, oy)(x, y, z) = \left[ ox + x - y, \; oy + \frac{x + y}{2} - z \right]$$

---

## 3. BUILDING FOOTPRINT & CANVAS BUDGET

Every building footprint $N \times M$ (in tiles) translates directly to real-world ground size and vertical height:

| Building Type | Tile Footprint ($N \times M$) | Ground Metric ($W \times D$) | Ground Diamond ($W \times H$) | Canvas Size ($W \times H$) | Target Height |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Small Outpost (Shed, Well, Shrine)** | $1 \times 1$ | $2\text{m} \times 2\text{m}$ | $72 \times 36\text{ px}$ | **$96 \times 120\text{ px}$** | $\approx 80 - 100\text{ px}$ |
| **Standard House (Hut, Bakery, Woodcutter, Fisher, Quarry, Mine)** | $2 \times 2$ | $4\text{m} \times 4\text{m}$ | $144 \times 72\text{ px}$ | **$160 \times 190\text{ px}$** | $\approx 150 - 170\text{ px}$ |
| **Industrial / Commercial (Sawmill, Smithy, Smelter, Market)** | $3 \times 2$ | $6\text{m} \times 4\text{m}$ | $180 \times 90\text{ px}$ | **$200 \times 220\text{ px}$** | $\approx 180 - 200\text{ px}$ |
| **Tall Functional (Windmill, Watchtower)** | $2 \times 2$ / $2 \times 3$ | $4\text{m} \times 4\text{m}$ | $144 \times 72\text{ px}$ | **$160 \times 260\text{ px}$** | $\approx 220 - 240\text{ px}$ |
| **Major Estate (HQ Keep Castle, Large Farm)** | $3 \times 3$ | $6\text{m} \times 6\text{m}$ | $216 \times 108\text{ px}$ | **$240 \times 280\text{ px}$** | $\approx 240 - 260\text{ px}$ |
| **Monument Wonder (Great Cathedral)** | $4 \times 3$ | $8\text{m} \times 6\text{m}$ | $252 \times 126\text{ px}$ | **$280 \times 340\text{ px}$** | $\approx 300 - 320\text{ px}$ |

---

## 4. THE 5-LAYER ARCHITECTURAL PHILOSOPHY

Every building is constructed from real physical components in 5 strict depth layers:

```
[Layer 5] Living Props & Vignettes (Firewood, Sacks, Baskets, Pretzels, Flowerboxes)
       ▲
[Layer 4] Overhanging Clay/Slate Roof (Spanish curved tiles, ridge caps, zinc gutters)
       ▲
[Layer 3] Timber & In-Fill Walls (Oak posts, St. Andrew's braces, leaded diamond glass)
       ▲
[Layer 2] Heavy Foundation Plinth (River granite blocks, mortar seams, corner quoins)
       ▲
[Layer 1] Ambient Occlusion & Ground Contact (Soft contact ellipse, grass moss, light spill)
```

1. **Layer 1: Ambient Occlusion & Ground Contact**:
   - Soft grounding shadow ellipse under the foundation footprint prevents the building from "floating".
   - Warm interior/hearth light spill cast onto the front cobblestone road at night.
2. **Layer 2: Heavy Foundation Plinth**:
   - Minimum $18 - 24\text{ px}$ high stone base (`z: 0 -> 24`).
   - River stones or ashlar masonry with hand-chiseled specular edges and deep mortar lines (`#1a1c24`).
   - Patchy moss (`#2d5e23`) climbing the damp shady corners.
3. **Layer 3: Timber Framing (Bavarian Fachwerk)**:
   - Heavy dark oak studs (`12\text{ px}` grid spacing) with visible wooden dowel pins/tenon joints.
   - Hand-plastered cream in-fill (`#ded6be` lit, `#8f8369` shadow) with subtle trowel marks.
   - Leaded glass windows with diamond mullions and deep interior sills.
4. **Layer 4: Overhanging Roof Geometry**:
   - Wide eaves projecting $12 - 16\text{ px}$ beyond the wall line, casting dramatic cast shadows on the upper storey.
   - Terracotta clay tiles modeled with individual curved lips, overlapping courses, and lit ridge caps.
5. **Layer 5: Living Props (The Human Vignette)**:
   - Every building MUST tell a human story: stacked split firewood, flour sacks with rope bindings, wicker baskets with golden crust loaves, water-collection barrels, blacksmith anvils with flying embers, or hanging wrought-iron trade signs.

---

## 5. LIGHTING & COLOR PALETTE SPECIFICATION

### 5.1. Sun Angle & Warm Key Lighting
- **Sun Direction**: High Top-Left ($45^\circ$ elevation, coming from North-West).
- **Lit Faces (Roof & South-East Wall)**: Warm golden-amber highlights (`#f5edd2`, `#cb7c44`, `#d95738`, `#8e98b3`).
- **Shaded Faces (South-West Wall)**: Deep plum & slate cool tones (`#2e0c08`, `#1c0d06`, `#2d313d`, `#1f1726`).
- **Hue-Shifted Color Ramps**:
  - `Plaster`: `#f5edd2` (bright) $\to$ `#ded6be` $\to$ `#bfb49b` $\to$ `#8f8369` $\to$ `#665c49` (shadow).
  - `Oak Timber`: `#cb7c44` (highlight) $\to$ `#a85929` $\to$ `#7a3e1c` $\to$ `#542a12` $\to$ `#361a0b` $\to$ `#1c0d06` (crevice).
  - `Clay Tile`: `#f07d58` (ridge) $\to$ `#d95738` $\to$ `#b33b27` $\to$ `#822619` $\to$ `#54160e` $\to$ `#2e0c08` (eave occlusion).
  - `River Stone`: `#b8c1db` (specular) $\to$ `#8e98b3` $\to$ `#687087` $\to$ `#474d5e` $\to$ `#2d313d` $\to$ `#1a1c24` (mortar).

---

## 6. ANIMATION LOOPS PROTOCOL

To achieve the living atmosphere of modern high-definition pixel art, all active buildings use standard loop counts:

1. **Chimney Smoke Plume**: 4-frame drifting loop ($4\text{ fps}$, sinusoidal dispersal).
2. **Hearth / Forge Fire**: 4-frame dancing flame ($6\text{ fps}$, white-hot core with shifting embers).
3. **Windmill Sails**: 8-frame rotation loop ($8\text{ fps}$, canvas cross-arm with canvas rigging).
4. **Waterwheel**: 6-frame rotating wheel ($6\text{ fps}$, foaming river water splash particles).
5. **Settler Walk Cycle**: 8-frame walk loop per cardinal direction ($8\text{ fps}$, natural shoulder sway, foot-lift, and breathing).
