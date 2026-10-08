# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Lattice Systems** is the corporate/commercial site for the software studio behind SpaceIA. Single public-facing marketing page — no auth, no admin/client portals, no backend of its own.

This project is independent from the SpaceIA monorepo's MVP-phase rules and approval gates (own repo, own scope) — same status as `../spaceai-landing-web-frontend`, which it is cross-linked with: that project's footer already links out to `https://latticesystems.dev`, and this site's Proyectos section links back to the SpaceIA product.

## Tech Stack

- **Framework:** Angular 22 (standalone components, signals)
- **Styling:** Tailwind CSS v4
- **Fonts:** self-hosted variable fonts via `@fontsource-variable/bricolage-grotesque` (display + body) and `@fontsource-variable/geist-mono` (labels, nav, data), imported in `src/styles.css`. No external `<link>`.
- **Icons:** `@ng-icons/lucide`
- **Component library:** spartan/ui (shadcn port for Angular), vendored locally under `libs/ui/` — same setup as `spaceai-landing-web-frontend`
- **Motion:** no animation library. Scroll reveals use the `Reveal` directive (`src/app/shared/reveal.directive.ts`, IntersectionObserver + safety-net timer so content never ships hidden in headless renders). The hero/contacto/projects background is a live canvas mesh, `LatticeCanvas` (`src/app/shared/lattice-canvas.ts`), the brand's namesake — runs outside Angular, pauses offscreen/hidden, static frame under `prefers-reduced-motion`.

## Architecture

Single-page site, one route (`/`):

```
src/app/
├── layouts/public-layout/    # navbar + router-outlet + footer
└── features/home/            # hero, nosotros, servicios, proyectos, proceso, contacto
```

Each section is a standalone component, assembled in `features/home/home.ts`.

## Design tokens

**Light + dark, one brand family, single locked accent per mode.** Palette is the company navy/slate ramp (`--navy-900 #173046 … --slate-100 #c1ced9`, sampled from the logo). The accent is one "signal" that runs through the lattice, CTAs, active nav and key markers: **navy on light, ice-blue (`#c1ced9`) on dark** — same brand color, tuned to pop against each background. No second accent anywhere.

Tokens live on `:root` (light, default) and `.dark` (dark) in `src/styles.css`. `.dark` is defined as a plain class (not `:root.dark`) so any subtree can opt into dark tokens — the SpaceAI panel carries `class="dark"` to stay a permanent navy island in both modes. Theme is owned by `ThemeService` (`src/app/shared/theme.ts`): initial value from `localStorage['ls-theme']` then `prefers-color-scheme`, toggled from the navbar; an inline script in `index.html` sets the class pre-boot to avoid FOUC. Also: semantic z-index scale, per-theme grain overlay, theme-aware scrims (`.theme-scrim*` fade toward `--bg-rgb`), and the lattice canvas reads `--lattice-line/node/pulse` and re-reads on theme flip.

Navbar is `fixed` (always visible, with a spacer + `scroll-padding-top`). The hero lattice sits on parallax layers (`.parallax-scroll` scroll-driven + `.parallax-pointer` pointer, set outside Angular). Section rhythm alternates base bg and `bg-muted`; Proceso is a scroll-scrubbed signal timeline (not an accordion), Servicios is an index-row list (not a card grid), Proyectos is an asymmetric grid with the drenched SpaceAI panel.

## Commands

```bash
npm install
ng serve                 # dev server at localhost:4200
ng build --configuration production
```

## Contact form

The Contacto section is a client-only demo (no backend call) — on submit it shows a "Gracias" success state. If a real backend is added later, wire it the same way `spaceai-landing-web-frontend`'s `contacto.ts` calls `ContactMessagesService`.

## Deployment

Deployed on Vercel at `lattice-systems-web-frontend.vercel.app`, project `daniel-ojeda-lunas-projects/lattice-systems-web-frontend`, connected to `github.com/lattice-systems/lattice-systems-web-frontend` (public) for auto-deploy on push to `master`. The "Ver SpaceAI" link in the Proyectos section points to the real production URL, `https://spaceai.latticesystems.dev`.
