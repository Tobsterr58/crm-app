# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Laravel 13 + Vue 3 project scaffold, but in practice the entire CRM application ("Databáze RFO" for PZK — Czech/Slovak trade association) is a **client-side mockup living in one file**: [resources/js/App.vue](resources/js/App.vue). All UI text is in Czech.

The Laravel backend is essentially the stock skeleton — default `User` model, default migrations (users/cache/jobs only), and `routes/web.php` just renders the `welcome` blade view. There are no custom controllers, models, migrations, or API routes. Do not assume a REST API exists; there isn't one.

All application state (users, companies, CRM records/opportunities, comment history) is hardcoded in `ref()` arrays at the top of `App.vue`'s `<script setup>` block and mutated directly in memory — nothing persists across a page reload, and there is no database or HTTP call involved in normal app usage. Auth is a plaintext username/password match against the in-memory `users` array (mock only, not real auth).

## Commands

Frontend (the part that actually matters for most changes):
```bash
npm run dev      # Vite dev server with HMR
npm run build    # Production build -> public/build
```

Full Laravel stack (rarely needed since there's no real backend logic yet):
```bash
composer run dev   # Runs php artisan serve + queue:listen + pail + vite concurrently
php artisan test   # Runs PHPUnit tests in tests/Feature and tests/Unit
php artisan test --filter=TestName   # Run a single test
vendor/bin/pint    # Laravel Pint (PHP code style)
```

There is no JS lint/test setup — `package.json` only defines `dev`/`build`.

## Architecture notes

- **Entry point**: `index.html` (root) and `resources/views/welcome.blade.php` both load `resources/js/app.js`, which just does `createApp(App).mount('#app')` with `App` = `App.vue`. There is no Vue Router — `App.vue` uses local refs (`currentView`, `isLoggedIn`, modal-open booleans) to switch between login screen, admin panel, and the main CRM view, all in one template.
- **Data shape** (see the `ref([...])` blocks in `App.vue`): `companiesList` (companies) is separate from `records` (CRM engagement records, one per company, holding `status`, `markers`, `opportunities[]`, `contacts[]`, `history[]`). Records reference companies by `companyId`, not by embedding company data.
- **Deployment**: this is deployed as a static site to Vercel (`vercel.json` rewrites everything to `index.html`). `dist/` is a prebuilt static output (Vite `build` output plus a copy of `public/index.php`); `public/build/` is the Laravel-Vite manifest-driven build output. Both exist because the project is straddling "static SPA on Vercel" and "Laravel app" deployment models — check which one is actually being targeted before assuming Laravel routes/middleware will run in production.
- When extending the CRM functionality, the natural next step is usually more state/computed/methods inside `App.vue`'s `<script setup>` rather than new Vue files or Laravel endpoints — unless the task explicitly calls for wiring up a real backend (persistence, real auth, multi-user sync), in which case flag that this is a bigger architectural change (adding API routes/controllers/migrations, replacing the mock auth, switching client state to fetch from the server).
- `public/vite-test.php` is a debug scratch file (currently untracked in git) for verifying the Vite manifest resolves correctly in a deployed PHP environment — not part of the app.
