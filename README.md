# 3D learning objects — practice

Ungraded **Home Health Aide** practice: inspect a wheelchair, hand sanitizer, and hospital bed. Identify high-touch points and when to sanitize on a home visit. Anatomy heart and chemistry glassware are placeholder cards until those models ship.

This is practice, not a quiz. Coaching notes only. Nothing is scored, and nothing is sent to a gradebook. No LTI, no xAPI, no SCORM, no grade passback.

Open `index.html` in a browser, or use the GitHub Pages URL below. Three.js r170 and GLTFLoader are **vendored in `vendor/`** — no CDN at runtime.

## Views

- **3D** — orbit viewer (click-drag always; pointer lock optional). Arrow keys or **I J K L** orbit; **+ / −** zoom. Tab to numbered hotspots, then Enter or Space.
- **2D** — labeled diagram with the same numbered points.
- **List** — fully completable without WebGL.

If the browser cannot run WebGL, or the learner has `prefers-reduced-motion`, the activity defaults to **List** (2D remains available). 3D never auto-rotates. Missing glTF files show a text note plus a simple procedural stand-in so 3D still works.

## GitHub Pages

Publish this folder as the **repository root** (`index.html` at `/`).

1. **Settings → Pages**.
2. Build and deployment: **Deploy from a branch**.
3. Branch: `main`. Folder: `/ (root)`.
4. Site: `https://dartpac.github.io/learning-3d-objects/`

Use that URL as the iframe `src`. Do not point the iframe at the GitHub repo page (`github.com/...`).

Private repositories on a free GitHub plan cannot serve GitHub Pages. If Pages fails, keep the repo private and host the same static files elsewhere, or use a paid plan — **do not make the repo public** just to enable Pages.

## Embed (Canvas, Brightspace, Open edX)

Same snippet for all three. In the page editor, switch to HTML and paste. Width is 100%; height is 720px. Scripts may run; the frame must **not** navigate the top window.

```html
<iframe
  src="https://dartpac.github.io/learning-3d-objects/?v=1"
  width="100%"
  height="720px"
  title="3D learning objects — practice"
  style="border: 0; width: 100%; height: 720px;"
  sandbox="allow-scripts allow-same-origin allow-pointer-lock"
  allow="pointer-lock"
></iframe>
```

Notes:

- `sandbox` includes `allow-scripts`, `allow-same-origin`, and `allow-pointer-lock`. Also set `allow="pointer-lock"`.
- Pointer lock is **optional**. LMS iframes often block it. Click-and-drag orbit always works.
- Do **not** add `allow-top-navigation` or `allow-top-navigation-by-user-activation`.
- Do **not** add `allow-popups`.
- No cookies are required.
- The LMS does **not** receive a grade from this activity.

### Canvas

Paste the iframe in the page HTML editor (not as a file attachment).

### Brightspace

Insert Stuff → Enter Embed Code, or edit an HTML document in Content, and paste the same iframe.

### Open edX

In Studio, add an **HTML** (or Raw HTML) component and paste the same iframe. Do not paste this repo’s JavaScript into the component. Some campuses filter frames; if it is stripped, ask the operator to allow `github.io`.

## Coursera

Coursera authoring often **strips inline JavaScript** and **some item types strip iframes**. Do not paste `app.js` into a Coursera HTML item.

Prefer the iframe above (or a Coursera lab / ungraded iframe item). If the item type disallows iframes, link `https://dartpac.github.io/learning-3d-objects/` as an external resource. If the frame is blank, an org admin may need to allow-list the Pages origin. Coursera does not receive a grade from this activity.

## No grade passback without LTI

This page does **not** implement LTI, xAPI, SCORM, or assignment callbacks. Completing the practice does not post a score. There is no grade passback without LTI. Learners can screenshot the coaching panel if they need a record.

## Pedagogy

| Object | Practice |
| --- | --- |
| Wheelchair | Identify high-touch points to disinfect: **handles, armrests, wheel rims**. Hotspots match the text list. |
| Hand sanitizer | When to sanitize on a home visit: **entry**, **after gloves off**, **before leaving**. |
| Hospital bed | **Bed rail** and **call pendant** as high-touch. |
| Anatomy heart | Placeholder. Model not shipped. Stand-in + text fallback. |
| Chemistry glassware | Placeholder. Model not shipped. Stand-in + text fallback. |

## Accessibility (WCAG 2.1 AA)

- `lang="en"`. Skip link. Visible focus rings (3px).
- Keyboard: Tab, orbit with arrow keys and IJKL, Enter/Space on hotspots.
- Text alternatives and numbers on every hotspot. Nothing by color alone.
- 24px+ tap targets.
- Credits dialog: focus trap, Esc closes, focus returns to the opener.
- Document title matches the iframe `title`: **3D learning objects — practice**.

## Models and credits

CC-BY glTF, stored locally (no Sketchfab embeds):

| Path | Title | Author | License |
| --- | --- | --- | --- |
| `assets/models/wheelchair/scene.gltf` | Wheelchair | Maxence Rouillet | CC-BY 4.0 |
| `assets/models/hand-sanitizer/scene.gltf` | Hand-sanitizer | Aarondraws8 | CC-BY 4.0 |
| `assets/models/hospital-bed/scene.gltf` | Medical Bed | benellis | CC-BY 4.0 |

See `credits.json` and the in-activity **Credits** screen.

Three.js r170 (MIT) lives in `vendor/`.

## Local preview

```bash
python3 -m http.server 8766 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8766/`.
