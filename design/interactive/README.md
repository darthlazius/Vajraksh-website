# VAJRAKSH interactive design mockup

Open `index.html` in a modern browser. Keep `mockup.css`, `mockup.js` and the `assets` folder beside it. No installation, build, server or internet connection is required. Fonts and imagery are local.

This is a separate full-page design prototype. It does not replace the existing homepage or call the contact API. The form opens a preview dialog; no visitor information is sent or persisted. Assessment data and runtime events are synthetic examples of the intended product.

The page contains six sections: Hero, a short Product introduction, the illustrative assessment, Trust, About and Contact. Product is intentionally limited to two headings: the explanation and the interactive example.

The header theme toggle follows the system colour scheme initially and remembers an explicit light/dark choice locally. If browser storage is blocked, the toggle still works for the session. Only this display preference is saved.

Interactions include mobile navigation, keyboard-accessible assessment tabs, a reviewer decision with rationale and a briefing-request preview.

Typography uses Newsreader for editorial headings and Inter for body/interface text. Both are distributed under the SIL Open Font License; the original licences are in `assets`. Newsreader is the open-source design choice for this prototype; Tiempos is not bundled.

The panoramic background was generated with the built-in image_gen tool and converted to WebP. Final prompt: “Create a wide panoramic black and white fine-art photograph of Himalayan mountain ridges: snow-dusted jagged peaks on the right half, lower forested foothills and drifting mist, quiet pale grey sky on the left half. Refined editorial photography for the VAJRAKSH defence software website, high photographic realism, delicate natural film grain, layered atmospheric depth, restrained contrasts, no text, no typography, no letters, no logo, no buildings, no soldiers, no aircraft, no flags, no frames, no UI. Landscape 16:9 composition. This is a standalone background photograph asset, not a website mockup.”

Validation: local fonts, all section anchors and referenced files, browser JavaScript execution, desktop and mobile overflow (1440, 768, 390 and 320px), assessment tabs and keyboard navigation, rationale requirement, form validation and modal, mobile menu, reduced-motion support, light/dark switching, saved theme after reload, system preference, blocked-storage fallback and theme toggle visibility down to 320px. Screenshots are included in `previews`.
