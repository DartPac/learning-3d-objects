/**
 * 3D learning objects — ungraded practice.
 * Works inside a cross-origin iframe (no window.top, no popups, no cookies).
 */
import * as THREE from "../vendor/three.module.min.js";
import { GLTFLoader } from "../vendor/GLTFLoader.js";

const FALLBACK_CREDITS = [
  {
    title: "Wheelchair",
    author: "Maxence Rouillet",
    license: "CC Attribution (CC-BY 4.0)",
    url: "https://sketchfab.com/3d-models/wheelchair-54911b7d81a44991804c87c6fc58c4df",
    path: "assets/models/wheelchair/scene.gltf"
  },
  {
    title: "Hand-sanitizer",
    author: "Aarondraws8",
    license: "CC Attribution (CC-BY 4.0)",
    url: "https://sketchfab.com/3d-models/hand-sanitizer-5ca4e17948fe40d1a73359116309ee1f",
    path: "assets/models/hand-sanitizer/scene.gltf"
  },
  {
    title: "Medical Bed",
    author: "benellis",
    license: "CC Attribution (CC-BY 4.0)",
    url: "https://sketchfab.com/3d-models/medical-bed-1c6a700978674aa7996b239362557c05",
    path: "assets/models/hospital-bed/scene.gltf"
  }
];

const OBJECTS = [
  {
    id: "wheelchair",
    title: "Wheelchair",
    kit: "HHA infection-control kit",
    ready: true,
    modelPath: "assets/models/wheelchair/scene.gltf",
    prompt: "Find the high-touch points to disinfect before a transfer.",
    intro: "Walk around the chair. Open every numbered point. Handles, armrests, and wheel rims pick up oils and soil from many hands.",
    complete: "You noted every high-touch point on the wheelchair. Wipe handles, armrests, and rims before you use the chair. Nothing was scored.",
    showModelLabels: true,
    hotspots: [
      {
        id: "handles",
        n: 1,
        label: "Push handles",
        list: "Disinfect the push handles.",
        coach: "Push handles are a high-touch point. Clean them before you move the client. Many caregivers hold the same grips.",
        uvw: [0.5, 0.9, 0.12],
        pos2d: [72, 16]
      },
      {
        id: "armrests",
        n: 2,
        label: "Armrests",
        list: "Disinfect both armrests.",
        coach: "Armrests collect skin oils and residue from transfers. Wipe the full length on both sides — color is not the cue; both arms need the same wipe.",
        uvw: [0.18, 0.6, 0.48],
        pos2d: [58, 40]
      },
      {
        id: "rims",
        n: 3,
        label: "Wheel rims",
        list: "Disinfect the wheel rims.",
        coach: "Wheel rims and handrims are high-touch. If the client self-propels, the rims are as dirty as a doorknob. Wipe the rim, not only the tire tread.",
        uvw: [0.06, 0.3, 0.5],
        pos2d: [20, 68]
      }
    ]
  },
  {
    id: "hand-sanitizer",
    title: "Hand sanitizer",
    kit: "HHA infection-control kit",
    ready: true,
    modelPath: "assets/models/hand-sanitizer/scene.gltf",
    prompt: "When do you sanitize on a home visit?",
    intro: "The bottle is a reminder, not a quiz. Open each moment: arriving, after gloves come off, and before you leave.",
    complete: "You reviewed the three sanitizing moments: on entry, after gloves off, and before leaving. Nothing was scored.",
    showModelLabels: false,
    hotspots: [
      {
        id: "entry",
        n: 1,
        label: "On entry",
        list: "Sanitize as you enter the home.",
        coach: "Sanitize on entry, before you touch the client, their chair, or household surfaces. Pump, rub until dry, then start the visit.",
        uvw: [0.5, 0.92, 0.5],
        pos2d: [17, 48]
      },
      {
        id: "gloves",
        n: 2,
        label: "After gloves off",
        list: "Sanitize after gloves come off.",
        coach: "Gloves are not a substitute for hand hygiene. After you remove gloves, sanitize (or wash) before you touch your bag, phone, or clean supplies.",
        uvw: [0.5, 0.52, 0.5],
        pos2d: [50, 48]
      },
      {
        id: "leave",
        n: 3,
        label: "Before leaving",
        list: "Sanitize before you leave.",
        coach: "Sanitize before you leave the home so you do not carry soil to the car, the next client, or your own home.",
        uvw: [0.5, 0.12, 0.5],
        pos2d: [83, 48]
      }
    ]
  },
  {
    id: "hospital-bed",
    title: "Hospital bed",
    kit: "HHA infection-control kit",
    ready: true,
    modelPath: "assets/models/hospital-bed/scene.gltf",
    prompt: "Find the bed rails and headboard handles — both are high-touch.",
    intro: "Rails and the headboard handles are gripped all day by the client, family, and staff. Open each point and read the coaching note.",
    complete: "You noted the bed rails and headboard handles as high-touch. Wipe them with the rest of the bedside. Nothing was scored.",
    showModelLabels: true,
    hotspots: [
      {
        id: "rail",
        n: 1,
        label: "Bed rail",
        list: "Disinfect the bed rail.",
        coach: "Bed rails are high-touch. Clients grip them to turn, sit, and call for help. Wipe the full top rail and the inner face your hands actually hold.",
        uvw: [0.12, 0.48, 0.72],
        pos2d: [28, 50]
      },
      {
        id: "headboard",
        n: 2,
        label: "Headboard handles",
        list: "Disinfect the headboard handles.",
        coach: "The headboard cutouts are used to steer and reposition the bed. Wipe the inner edges of both handles, not only the outer panel.",
        uvw: [0.5, 0.78, 0.12],
        pos2d: [50, 18]
      }
    ]
  }
];

const BY_ID = Object.fromEntries(OBJECTS.map((o) => [o.id, o]));

const metal = () =>
  new THREE.MeshStandardMaterial({ color: 0x5b6570, metalness: 0.35, roughness: 0.45 });
const vinyl = () =>
  new THREE.MeshStandardMaterial({ color: 0x2f5b4c, roughness: 0.72, metalness: 0.05 });
const plastic = () =>
  new THREE.MeshStandardMaterial({ color: 0xc5d4cc, roughness: 0.4, metalness: 0.1 });
const linen = () =>
  new THREE.MeshStandardMaterial({ color: 0xe8e2d4, roughness: 0.85, metalness: 0 });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch (err) {
    return false;
  }
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function $(id) {
  return document.getElementById(id);
}

/* ---------- stand-in meshes (used when glTF is missing) ---------- */
function standInWheelchair() {
  const g = new THREE.Group();
  const m = metal();
  const v = vinyl();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.08, 0.95), v);
  seat.position.set(0, 0.58, 0.05);
  g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.85, 0.08), v);
  back.position.set(0, 1.02, -0.42);
  g.add(back);
  const handleL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.28, 10), m);
  handleL.rotation.x = Math.PI / 2;
  handleL.position.set(-0.38, 1.38, -0.52);
  const handleR = handleL.clone();
  handleR.position.x = 0.38;
  g.add(handleL, handleR);
  [-0.48, 0.48].forEach((x) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.7), m);
    arm.position.set(x, 0.78, 0.05);
    g.add(arm);
  });
  [-0.62, 0.62].forEach((x) => {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.055, 10, 22), m);
    wheel.rotation.y = Math.PI / 2;
    wheel.position.set(x, 0.5, 0);
    g.add(wheel);
  });
  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.35), m);
  foot.position.set(0, 0.22, 0.55);
  g.add(foot);
  return g;
}

function standInSanitizer() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 1.15, 24), plastic());
  body.position.y = 0.2;
  const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.35, 12), metal());
  pump.position.y = 0.92;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.12), metal());
  head.position.set(0.1, 1.08, 0);
  g.add(body, pump, head);
  return g;
}

function standInBed() {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.18, 1.1), metal());
  frame.position.y = 0.45;
  const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.22, 0.95), linen());
  mattress.position.y = 0.64;
  const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.7), linen());
  pillow.position.set(-0.7, 0.82, 0);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.06), metal());
  rail.position.set(0.1, 0.85, 0.52);
  const pendant = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.08), new THREE.MeshStandardMaterial({ color: 0x8a5a22, roughness: 0.5 }));
  pendant.position.set(0.95, 0.7, 0.4);
  g.add(frame, mattress, pillow, rail, pendant);
  return g;
}

function standInHeart() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x8f3d3d, roughness: 0.55 });
  const a = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 16), mat);
  a.position.set(-0.18, 0.05, 0);
  a.scale.set(1, 1.15, 0.9);
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 16), mat);
  b.position.set(0.2, 0, 0);
  b.scale.set(1, 1.1, 0.9);
  const v = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.45, 10), metal());
  v.position.set(0.05, 0.55, 0);
  g.add(a, b, v);
  return g;
}

function standInGlass() {
  const g = new THREE.Group();
  const glass = new THREE.MeshStandardMaterial({
    color: 0xc5d0cc,
    roughness: 0.15,
    metalness: 0.05,
    transparent: true,
    opacity: 0.7
  });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 16), glass);
  body.position.y = 0.05;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.55, 16), glass);
  neck.position.y = 0.62;
  g.add(body, neck);
  return g;
}

function standInFor(id) {
  if (id === "wheelchair") return standInWheelchair();
  if (id === "hand-sanitizer") return standInSanitizer();
  if (id === "hospital-bed") return standInBed();
  return standInSanitizer();
}

/* ---------- 2D diagrams ---------- */
function diagramSvg(obj) {
  if (obj.id === "wheelchair") {
    return `<svg viewBox="0 0 480 300" role="img" aria-labelledby="d2-title d2-desc">
      <title id="d2-title">Wheelchair diagram with three numbered high-touch points</title>
      <desc id="d2-desc">Side view of a wheelchair. Point 1 push handles at the back. Point 2 armrests. Point 3 wheel rims.</desc>
      <rect width="480" height="300" fill="#e7dfd2"/>
      <ellipse cx="150" cy="210" rx="78" ry="78" fill="none" stroke="#2c2a26" stroke-width="8"/>
      <circle cx="150" cy="210" r="14" fill="#2f5b4c"/>
      <circle cx="300" cy="232" r="28" fill="none" stroke="#2c2a26" stroke-width="6"/>
      <rect x="150" y="118" width="170" height="18" rx="4" fill="#2f5b4c"/>
      <rect x="300" y="70" width="18" height="120" rx="4" fill="#2f5b4c"/>
      <rect x="292" y="48" width="44" height="14" rx="5" fill="#5b6570"/>
      <rect x="168" y="100" width="130" height="12" rx="4" fill="#5b6570"/>
      <rect x="148" y="210" width="160" height="10" fill="#5b6570"/>
      <text x="24" y="28" fill="#4a453c" font-size="14">Numbers plus names — not color alone</text>
    </svg>`;
  }
  if (obj.id === "hand-sanitizer") {
    return `<svg viewBox="0 0 480 300" role="img" aria-labelledby="d2-title d2-desc">
      <title id="d2-title">Three sanitizing moments on a home visit</title>
      <desc id="d2-desc">Three equal cards: on entry, after gloves off, and before leaving. A small bottle sits under the middle card.</desc>
      <rect width="480" height="300" fill="#e7dfd2"/>
      <rect x="20" y="70" width="130" height="110" rx="10" fill="#fbf8f2" stroke="#8a5a22" stroke-width="3"/>
      <rect x="175" y="70" width="130" height="110" rx="10" fill="#fbf8f2" stroke="#8a5a22" stroke-width="3"/>
      <rect x="330" y="70" width="130" height="110" rx="10" fill="#fbf8f2" stroke="#8a5a22" stroke-width="3"/>
      <text x="40" y="140" font-size="15" fill="#2c2a26">On entry</text>
      <text x="188" y="140" font-size="15" fill="#2c2a26">After gloves</text>
      <text x="348" y="140" font-size="15" fill="#2c2a26">Before leaving</text>
      <path d="M150 125 H175" stroke="#4a453c" stroke-width="3"/>
      <path d="M305 125 H330" stroke="#4a453c" stroke-width="3"/>
      <rect x="222" y="210" width="36" height="58" rx="8" fill="#c5d4cc" stroke="#2f5b4c"/>
      <rect x="232" y="196" width="8" height="18" fill="#5b6570"/>
      <text x="24" y="28" fill="#4a453c" font-size="14">Home visit order — same three notes as the 3D bottle</text>
    </svg>`;
  }
  if (obj.id === "hospital-bed") {
    return `<svg viewBox="0 0 480 300" role="img" aria-labelledby="d2-title d2-desc">
      <title id="d2-title">Hospital bed diagram with rail and call pendant</title>
      <desc id="d2-desc">Bed seen from the side. Point 1 is the side rail. Point 2 is the call pendant hanging near the pillow.</desc>
      <rect width="480" height="300" fill="#e7dfd2"/>
      <rect x="50" y="150" width="340" height="28" fill="#5b6570"/>
      <rect x="60" y="122" width="320" height="36" rx="4" fill="#e8e2d4" stroke="#4a453c"/>
      <rect x="60" y="108" width="70" height="22" rx="6" fill="#fbf8f2" stroke="#4a453c"/>
      <rect x="70" y="175" width="16" height="50" fill="#5b6570"/>
      <rect x="354" y="175" width="16" height="50" fill="#5b6570"/>
      <rect x="90" y="96" width="200" height="14" fill="#2f5b4c"/>
      <rect x="90" y="70" width="12" height="40" fill="#2f5b4c"/>
      <rect x="278" y="70" width="12" height="40" fill="#2f5b4c"/>
      <rect x="350" y="88" width="22" height="36" rx="4" fill="#8a5a22"/>
      <line x1="360" y1="88" x2="360" y2="60" stroke="#2c2a26" stroke-width="3"/>
      <text x="24" y="28" fill="#4a453c" font-size="14">Rail and pendant — named, numbered, not color alone</text>
    </svg>`;
  }
  if (obj.id === "heart") {
    return `<svg viewBox="0 0 480 300" role="img" aria-labelledby="d2-title d2-desc">
      <title id="d2-title">Placeholder heart diagram</title>
      <desc id="d2-desc">Simple two-lobe heart outline. Model not shipped. Chambers and vessels are placeholders.</desc>
      <rect width="480" height="300" fill="#e7dfd2"/>
      <ellipse cx="200" cy="160" rx="70" ry="80" fill="#c98484" stroke="#2c2a26" stroke-width="3"/>
      <ellipse cx="270" cy="160" rx="64" ry="74" fill="#b45c5c" stroke="#2c2a26" stroke-width="3"/>
      <rect x="228" y="70" width="18" height="50" fill="#5b6570"/>
      <text x="24" y="28" fill="#4a453c" font-size="14">Placeholder — labeled heart model not shipped</text>
    </svg>`;
  }
  return `<svg viewBox="0 0 480 300" role="img" aria-labelledby="d2-title d2-desc">
    <title id="d2-title">Placeholder flask diagram</title>
    <desc id="d2-desc">Simple flask. Model not shipped. Body and neck are placeholders.</desc>
    <rect width="480" height="300" fill="#e7dfd2"/>
    <circle cx="240" cy="190" r="70" fill="#c5d4cc" stroke="#2c2a26" stroke-width="3"/>
    <rect x="226" y="70" width="28" height="80" fill="#c5d4cc" stroke="#2c2a26" stroke-width="3"/>
    <text x="24" y="28" fill="#4a453c" font-size="14">Placeholder — labeled glassware model not shipped</text>
  </svg>`;
}

/* ---------- app state ---------- */
const els = {};
const noted = Object.create(null);
let current = null;
let viewMode = "3d";
let webglOk = true;
let creditsOpener = null;
let creditsData = FALLBACK_CREDITS;

let renderer = null;
let scene = null;
let camera = null;
let wrapper = null;
let anchors = [];
let raf = 0;
let dragging = false;
let dragMoved = false;
let lastPx = 0;
let lastPy = 0;
let pointerLocked = false;
const orbit = { az: 0.7, el: 0.42, dist: 3.4, target: new THREE.Vector3(0, 0.2, 0) };

function setCoaching(text, ok) {
  if (!text) {
    els.coaching.hidden = true;
    els.coaching.textContent = "";
    return;
  }
  els.coaching.hidden = false;
  els.coaching.textContent = text;
  els.coaching.classList.toggle("ok", !!ok);
}

function allNoted(obj) {
  return obj.hotspots.every((h) => noted[obj.id + ":" + h.id]);
}

function updateProgress() {
  if (!current) {
    els.progressNote.textContent = "";
    return;
  }
  const total = current.hotspots.length;
  const n = current.hotspots.filter((h) => noted[current.id + ":" + h.id]).length;
  els.progressNote.textContent = n + " of " + total + " points noted. No score is kept.";
  if (n === total) setCoaching(current.complete, true);
}

function isNoted(obj, hs) {
  return !!noted[obj.id + ":" + hs.id];
}

function noteHotspot(obj, hs, via) {
  noted[obj.id + ":" + hs.id] = true;
  els.detail.textContent = hs.coach;
  setCoaching(hs.coach, false);
  refreshHotspotChrome();
  updateProgress();
  if (via) {
    /* keep focus where the learner is */
  }
}

function refreshHotspotChrome() {
  if (!current) return;
  document.querySelectorAll("[data-hs]").forEach((btn) => {
    const id = btn.getAttribute("data-hs");
    const on = isNoted(current, { id: id });
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
  els.pointList.querySelectorAll("li").forEach((li) => {
    const id = li.getAttribute("data-hs");
    const dot = li.querySelector(".status-dot");
    if (dot) dot.classList.toggle("on", isNoted(current, { id: id }));
  });
}

function renderCards() {
  els.cards.innerHTML = OBJECTS.map((o) => {
    const badge = o.ready
      ? `<span class="badge">Ready</span>`
      : `<span class="badge wait">Model not shipped</span>`;
    return `<li>
      <button type="button" class="card-btn" data-open="${o.id}">
        ${badge}
        <span class="card-kit">${o.kit}</span>
        <strong>${o.title}</strong>
        <span class="card-desc">${o.prompt}</span>
      </button>
    </li>`;
  }).join("");
}

function renderCreditsList(items) {
  els.creditList.innerHTML = items
    .map((c) => {
      const path = c.path ? ` — <code>${c.path}</code>` : "";
      return `<li><strong>${c.title}</strong> — ${c.author} — ${c.license} —
        <a href="${c.url}" target="_blank" rel="noopener noreferrer">View on Sketchfab</a>${path}</li>`;
    })
    .join("");
}

function setViewButtons() {
  els.btn3d.setAttribute("aria-pressed", viewMode === "3d" ? "true" : "false");
  els.btn2d.setAttribute("aria-pressed", viewMode === "2d" ? "true" : "false");
  els.btnList.setAttribute("aria-pressed", viewMode === "list" ? "true" : "false");
  els.btn3d.disabled = !webglOk;
  els.view3d.hidden = viewMode !== "3d";
  els.view2d.hidden = viewMode !== "2d";
  els.viewList.hidden = viewMode !== "list";
  if (viewMode === "3d") startLoop();
  else stopLoop();
  if (viewMode === "3d") resize();
}

function applyView(mode) {
  if (mode === "3d" && !webglOk) {
    setCoaching("3D is not available in this browser. Use 2D or List — both complete the same practice.", false);
    mode = "list";
  }
  viewMode = mode;
  setViewButtons();
  if (current && viewMode === "3d") {
    els.worldHost.focus({ preventScroll: true });
  }
}

function renderSidebar(obj) {
  els.pointList.innerHTML = obj.hotspots
    .map((h) => {
      return `<li data-hs="${h.id}">
        <span class="status-dot${isNoted(obj, h) ? " on" : ""}" aria-hidden="true"></span>
        <button type="button" data-hs="${h.id}" aria-pressed="${isNoted(obj, h) ? "true" : "false"}">
          ${h.n}. ${h.label}
        </button>
      </li>`;
    })
    .join("");
  els.detail.textContent = obj.intro;
}

function renderList(obj) {
  els.listItems.innerHTML = obj.hotspots
    .map((h) => {
      return `<li>
        <button type="button" class="list-btn" data-hs="${h.id}" aria-pressed="${isNoted(obj, h) ? "true" : "false"}">
          <span class="marker-num">${h.n}</span>
          <span class="list-copy">
            <strong>${h.label}</strong>
            <span>${h.list}</span>
          </span>
        </button>
      </li>`;
    })
    .join("");
}

function renderDiagram(obj) {
  els.diagramHost.innerHTML = diagramSvg(obj);
  obj.hotspots.forEach((h) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "marker";
    b.setAttribute("data-hs", h.id);
    b.setAttribute("aria-pressed", isNoted(obj, h) ? "true" : "false");
    b.style.left = h.pos2d[0] + "%";
    b.style.top = h.pos2d[1] + "%";
    b.innerHTML = `<span class="marker-num">${h.n}</span><span class="marker-name">${h.label}</span>`;
    els.diagramHost.appendChild(b);
  });
}

function renderMarkers3d(obj) {
  els.markers3d.innerHTML = "";
  if (!obj.showModelLabels) return;
  obj.hotspots.forEach((h) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "marker";
    b.setAttribute("data-hs", h.id);
    b.setAttribute("aria-pressed", isNoted(obj, h) ? "true" : "false");
    b.innerHTML = `<span class="marker-num">${h.n}</span><span class="marker-name">${h.label}</span>`;
    els.markers3d.appendChild(b);
  });
}

function disposeObject3D(root) {
  if (!root) return;
  root.traverse((node) => {
    if (node.geometry) node.geometry.dispose();
    const mat = node.material;
    if (!mat) return;
    const list = Array.isArray(mat) ? mat : [mat];
    list.forEach((m) => {
      Object.keys(m).forEach((k) => {
        const v = m[k];
        if (v && v.isTexture) v.dispose();
      });
      m.dispose();
    });
  });
}

function ensureRenderer() {
  if (renderer) return;
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0xcfc3b0, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  els.worldHost.insertBefore(renderer.domElement, els.worldHost.firstChild);
  renderer.domElement.setAttribute("aria-hidden", "true");

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcfc3b0);
  camera = new THREE.PerspectiveCamera(45, 1, 0.05, 80);

  const hemi = new THREE.HemisphereLight(0xf7f3ea, 0x6b5a48, 1.05);
  const key = new THREE.DirectionalLight(0xfff6e8, 1.15);
  key.position.set(2.2, 3.4, 2.4);
  const fill = new THREE.DirectionalLight(0xd7e4dc, 0.45);
  fill.position.set(-2.5, 1.2, -1.5);
  scene.add(hemi, key, fill);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(4, 48),
    new THREE.MeshStandardMaterial({ color: 0xb9a88e, roughness: 1, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  scene.add(ground);

  wrapper = new THREE.Group();
  scene.add(wrapper);
}

function clearWrapper() {
  if (!wrapper) return;
  while (wrapper.children.length) {
    const ch = wrapper.children[0];
    wrapper.remove(ch);
    disposeObject3D(ch);
  }
  anchors = [];
}

function addAnchorSpheres(obj, positions) {
  anchors = [];
  const geo = new THREE.SphereGeometry(0.055, 14, 10);
  obj.hotspots.forEach((h, i) => {
    const p = positions[h.id] || new THREE.Vector3();
    const empty = new THREE.Object3D();
    empty.position.copy(p);
    const color = new THREE.MeshStandardMaterial({
      color: 0x8a5a22,
      emissive: 0x3d2e16,
      roughness: 0.4
    });
    const sph = new THREE.Mesh(geo, color);
    empty.add(sph);
    wrapper.add(empty);
    anchors.push({ id: h.id, obj: empty, hs: h });
  });
}

function fitAndAnchor(obj, model) {
  wrapper.add(model);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  const scale = 2.1 / maxDim;
  model.scale.multiplyScalar(scale);
  const box2 = new THREE.Box3().setFromObject(model);
  const size2 = box2.getSize(new THREE.Vector3());
  const pos = {};
  obj.hotspots.forEach((h) => {
    pos[h.id] = new THREE.Vector3(
      box2.min.x + size2.x * h.uvw[0],
      box2.min.y + size2.y * h.uvw[1],
      box2.min.z + size2.z * h.uvw[2]
    );
  });
  const bottom = box2.min.y;
  model.position.y -= bottom;
  Object.keys(pos).forEach((k) => {
    pos[k].y -= bottom;
  });
  if (obj.showModelLabels) addAnchorSpheres(obj, pos);
  orbit.target.set(0, size2.y * 0.45, 0);
  orbit.dist = Math.max(2.4, size2.y * 2.4);
}

function showStatus(msg) {
  if (!msg) {
    els.worldStatus.hidden = true;
    els.worldStatus.textContent = "";
    return;
  }
  els.worldStatus.hidden = false;
  els.worldStatus.textContent = msg;
}

function loadObjectModel(obj) {
  ensureRenderer();
  clearWrapper();
  resize();
  const usePath = obj.ready && obj.modelPath;
  if (!usePath) {
    showStatus("");
    fitAndAnchor(obj, standInFor(obj.id));
    setCoaching(
      obj.ready
        ? obj.intro
        : "This model is not shipped yet. A simple stand-in is shown so 3D still works. Use 2D or List for the same notes.",
      false
    );
    return;
  }
  showStatus("Loading 3D model…");
  const loader = new GLTFLoader();
  loader.load(
    obj.modelPath,
    (gltf) => {
      if (current !== obj) return;
      showStatus("");
      fitAndAnchor(obj, gltf.scene);
      setCoaching(obj.intro, false);
    },
    undefined,
    () => {
      if (current !== obj) return;
      showStatus("");
      fitAndAnchor(obj, standInFor(obj.id));
      setCoaching(
        "The 3D file could not be loaded. A simple stand-in is shown so 3D still works. 2D and List complete the same practice.",
        false
      );
    }
  );
}

function projectAnchors() {
  if (!camera || !renderer || viewMode !== "3d") return;
  const rect = els.worldHost.getBoundingClientRect();
  const tmp = new THREE.Vector3();
  const buttons = els.markers3d.querySelectorAll(".marker");
  anchors.forEach((a) => {
    a.obj.getWorldPosition(tmp);
    tmp.project(camera);
    const btn = Array.from(buttons).find((b) => b.getAttribute("data-hs") === a.id);
    if (!btn) return;
    const behind = tmp.z > 1;
    const x = (tmp.x * 0.5 + 0.5) * rect.width;
    const y = (-tmp.y * 0.5 + 0.5) * rect.height;
    btn.style.left = x + "px";
    btn.style.top = y + "px";
    btn.style.visibility = behind ? "hidden" : "visible";
  });
}

function placeCamera() {
  const el = Math.max(0.08, Math.min(Math.PI / 2 - 0.08, orbit.el));
  orbit.el = el;
  const x = orbit.target.x + orbit.dist * Math.sin(orbit.az) * Math.cos(el);
  const y = orbit.target.y + orbit.dist * Math.sin(el);
  const z = orbit.target.z + orbit.dist * Math.cos(orbit.az) * Math.cos(el);
  camera.position.set(x, y, z);
  camera.lookAt(orbit.target);
}

function resize() {
  if (!renderer || !camera) return;
  const w = Math.max(1, els.worldHost.clientWidth);
  const h = Math.max(1, els.worldHost.clientHeight);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function loop() {
  raf = 0;
  if (viewMode !== "3d" || !renderer) return;
  placeCamera();
  renderer.render(scene, camera);
  projectAnchors();
  raf = requestAnimationFrame(loop);
}

function startLoop() {
  if (!webglOk) return;
  if (!raf) raf = requestAnimationFrame(loop);
}

function stopLoop() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

function orbitBy(dx, dy) {
  orbit.az -= dx * 0.005;
  orbit.el += dy * 0.005;
}

function zoomBy(delta) {
  orbit.dist = Math.max(1.1, Math.min(12, orbit.dist * (delta > 0 ? 1.08 : 0.92)));
}

function openObject(id) {
  const obj = BY_ID[id];
  if (!obj) return;
  current = obj;
  els.picker.hidden = true;
  els.activity.hidden = false;
  els.objectTitle.textContent = obj.title;
  els.stageHint.textContent = obj.prompt;
  renderSidebar(obj);
  renderList(obj);
  renderDiagram(obj);
  renderMarkers3d(obj);
  updateProgress();
  if (webglOk) loadObjectModel(obj);
  else {
    setCoaching("3D is not available. List and 2D include every coaching note.", false);
  }
  applyView(viewMode);
}

function closeObject() {
  current = null;
  els.activity.hidden = true;
  els.picker.hidden = false;
  clearWrapper();
  stopLoop();
  setCoaching("", false);
  els.picker.querySelector(".card-btn")?.focus();
}

function onActivateHotspot(ev) {
  const btn = ev.target.closest("[data-hs]");
  if (!btn || !current) return;
  const hs = current.hotspots.find((h) => h.id === btn.getAttribute("data-hs"));
  if (!hs) return;
  noteHotspot(current, hs);
}

function creditsFocusables() {
  if (!els.creditsOverlay) return [];
  return Array.from(els.creditsOverlay.querySelectorAll("a[href], button:not([disabled])")).filter(
    (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
  );
}

function openCredits(from) {
  creditsOpener = from || document.activeElement;
  els.creditsOverlay.hidden = false;
  try {
    els.btnCreditsClose.focus();
  } catch (err) {}
}

function closeCredits() {
  els.creditsOverlay.hidden = true;
  if (creditsOpener && typeof creditsOpener.focus === "function") {
    try {
      creditsOpener.focus();
    } catch (err) {}
  }
}

function bindPointer() {
  const host = els.worldHost;
  host.addEventListener("pointerdown", (ev) => {
    if (viewMode !== "3d") return;
    try { host.focus({ preventScroll: true }); } catch (err) {}
    if (ev.target.closest(".marker")) return;
    dragging = true;
    dragMoved = false;
    lastPx = ev.clientX;
    lastPy = ev.clientY;
    host.setPointerCapture(ev.pointerId);
  });
  host.addEventListener("pointermove", (ev) => {
    if (pointerLocked) {
      orbitBy(ev.movementX, ev.movementY);
      return;
    }
    if (!dragging) return;
    const dx = ev.clientX - lastPx;
    const dy = ev.clientY - lastPy;
    if (Math.abs(dx) + Math.abs(dy) > 2) dragMoved = true;
    orbitBy(dx, dy);
    lastPx = ev.clientX;
    lastPy = ev.clientY;
  });
  host.addEventListener("pointerup", () => {
    dragging = false;
  });
  host.addEventListener("pointercancel", () => {
    dragging = false;
  });
  host.addEventListener("wheel", (ev) => {
    if (viewMode !== "3d") return;
    ev.preventDefault();
    zoomBy(ev.deltaY);
  }, { passive: false });
  host.addEventListener("dblclick", () => {
    if (viewMode !== "3d") return;
    if (document.pointerLockElement === host || document.pointerLockElement === renderer?.domElement) {
      document.exitPointerLock();
      return;
    }
    const el = renderer?.domElement || host;
    const p = el.requestPointerLock && el.requestPointerLock();
    if (p && typeof p.catch === "function") p.catch(() => {});
  });
  document.addEventListener("pointerlockchange", () => {
    pointerLocked = !!(document.pointerLockElement && (document.pointerLockElement === host || document.pointerLockElement === renderer?.domElement));
    els.kbdHelp.textContent = pointerLocked
      ? "Pointer locked. Move the mouse to orbit. Press Escape or double-click to unlock. Drag still works if lock is blocked."
      : "Drag to orbit. Arrow keys or I J K L rotate. + / − zoom. Pointer lock is optional. Use the coaching list on the right, or switch to List view.";
  });
}

function bindKeys() {
  document.addEventListener("keydown", (ev) => {
    if (!els.creditsOverlay.hidden) {
      if (ev.key === "Escape") {
        ev.preventDefault();
        closeCredits();
        return;
      }
      if (ev.key === "Tab") {
        const list = creditsFocusables();
        if (!list.length) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (ev.shiftKey && document.activeElement === first) {
          ev.preventDefault();
          last.focus();
        } else if (!ev.shiftKey && document.activeElement === last) {
          ev.preventDefault();
          first.focus();
        }
      }
      return;
    }
    if (viewMode !== "3d" || !current) return;
    const inStage = els.worldHost.contains(document.activeElement) || document.activeElement === els.worldHost;
    const key = ev.key;
    if (key === "ArrowLeft" || key === "j" || key === "J") {
      if (!inStage && document.activeElement?.closest(".side")) return;
      ev.preventDefault();
      orbitBy(-28, 0);
    } else if (key === "ArrowRight" || key === "l" || key === "L") {
      if (!inStage && document.activeElement?.closest(".side")) return;
      ev.preventDefault();
      orbitBy(28, 0);
    } else if (key === "ArrowUp" || key === "i" || key === "I") {
      if (!inStage && document.activeElement?.closest(".side")) return;
      ev.preventDefault();
      orbitBy(0, -28);
    } else if (key === "ArrowDown" || key === "k" || key === "K") {
      if (!inStage && document.activeElement?.closest(".side")) return;
      ev.preventDefault();
      orbitBy(0, 28);
    } else if (key === "+" || key === "=" || key === "u" || key === "U") {
      ev.preventDefault();
      zoomBy(-1);
    } else if (key === "-" || key === "_" || key === "o" || key === "O") {
      ev.preventDefault();
      zoomBy(1);
    }
  });
}

function init() {
  els.coaching = $("coaching");
  els.cards = $("object-cards");
  els.picker = $("picker");
  els.activity = $("activity");
  els.btnBack = $("btn-back");
  els.objectTitle = $("object-title");
  els.stageHint = $("stage-hint");
  els.view3d = $("view-3d");
  els.view2d = $("view-2d");
  els.viewList = $("view-list");
  els.worldHost = $("world-host");
  els.markers3d = $("markers-3d");
  els.worldStatus = $("world-status");
  els.diagramHost = $("diagram-host");
  els.listItems = $("list-items");
  els.pointList = $("point-list");
  els.detail = $("detail");
  els.progressNote = $("progress-note");
  els.btn3d = $("btn-3d");
  els.btn2d = $("btn-2d");
  els.btnList = $("btn-list");
  els.btnCredits = $("btn-credits");
  els.btnCreditsFoot = $("btn-credits-foot");
  els.btnCreditsClose = $("btn-credits-close");
  els.creditsOverlay = $("credits-overlay");
  els.creditList = $("credit-list");
  els.kbdHelp = $("kbd-help");

  webglOk = hasWebGL();
  if (!webglOk || prefersReducedMotion()) viewMode = "list";

  renderCards();
  renderCreditsList(creditsData);
  setViewButtons();

  if (!webglOk) {
    setCoaching("This browser cannot run 3D. Use List or 2D — every coaching note is there. Nothing is scored.", false);
  } else if (prefersReducedMotion()) {
    setCoaching("Reduced motion is on, so the list is shown first. 3D does not auto-rotate. Switch to 3D or 2D anytime.", false);
  }

  els.cards.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-open]");
    if (btn) openObject(btn.getAttribute("data-open"));
  });
  els.btnBack.addEventListener("click", closeObject);
  els.btn3d.addEventListener("click", () => applyView("3d"));
  els.btn2d.addEventListener("click", () => applyView("2d"));
  els.btnList.addEventListener("click", () => applyView("list"));
  els.activity.addEventListener("click", onActivateHotspot);
  els.btnCredits.addEventListener("click", () => openCredits(els.btnCredits));
  els.btnCreditsFoot.addEventListener("click", () => openCredits(els.btnCreditsFoot));
  els.btnCreditsClose.addEventListener("click", closeCredits);
  els.creditsOverlay.addEventListener("click", (ev) => {
    if (ev.target === els.creditsOverlay) closeCredits();
  });

  bindPointer();
  bindKeys();
  window.addEventListener("resize", resize);

  fetch("credits.json")
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((data) => {
      if (Array.isArray(data) && data.length) {
        creditsData = data;
        renderCreditsList(data);
      }
    })
    .catch(() => {});

  if (location.hash === "#credits") openCredits(els.btnCredits);
}

init();
