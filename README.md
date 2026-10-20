# Websites

Source of the **Rikka Apps** websites, built with [VuePress 1.x](https://v1.vuepress.vuejs.org/).
One repository, four independent static sites, each with its own VuePress config and
multi-language content (English / 简体中文 / 繁體中文).

| Directory           | Site            | Production URL          | Build output                          |
| ------------------- | --------------- | ----------------------- | ------------------------------------- |
| `www/`              | Rikka Apps      | https://rikka.app       | `www/.vuepress/dist`                  |
| `appops/`           | App Ops         | https://appops.rikka.app| `appops/.vuepress/dist`               |
| `shizuku/`          | Shizuku         | https://shizuku.rikka.app| `shizuku/.vuepress/dist`             |
| `storage_redirect/` | Storage Isolation | https://sr.rikka.app   | `storage_redirect/.vuepress/dist`     |

`webhooks/` is **not** part of the build. It is a small Node service that pulls the repo,
rebuilds the sites and purges the Cloudflare cache on a webhook; it needs a local
`webhooks/config.json` (secrets, therefore not in the repository) and is never executed by CI.

## Requirements

- **Node.js 24** (see [`node-version.yml`](node-version.yml)) — any Node 18+ works locally
- npm 9+ (ships with Node 24)

## Getting started

```bash
git clone https://github.com/Newhub280380/websites.git
cd websites
npm ci          # or: npm install
```

### Dev server

Run one site with a hot-reloading dev server (default <http://localhost:8080>):

```bash
npm run www:dev         # http://localhost:8080
npm run appops:dev
npm run shizuku:dev
npm run sr:dev          # storage_redirect
```

### Production build

```bash
npm run www:build       # -> www/.vuepress/dist
npm run appops:build    # -> appops/.vuepress/dist
npm run shizuku:build   # -> shizuku/.vuepress/dist
npm run sr:build        # -> storage_redirect/.vuepress/dist

npm run build:all       # all four, sequentially
npm test                # smoke-check the generated dist folders
```

`npm test` verifies that each build produced a non-empty `index.html`, `404.html` and
`sitemap.xml`. Build artifacts are git-ignored — CI uploads them as workflow artifacts.

## Repository layout

```
.
├── package.json          # root scripts, VuePress dependencies
├── package-lock.json     # pinned dependency tree (used by CI via `npm ci`)
├── node-version.yml      # Node version shared by CI and local dev
├── scripts/
│   └── check-build.js    # build smoke-check used by CI and `npm test`
├── .github/workflows/
│   └── ci.yml            # build matrix for all four sites
├── www/  appops/  shizuku/  storage_redirect/
│   ├── .vuepress/config.js   # per-site VuePress config (title, locales, plugins, nav)
│   ├── README.md             # site front-matter / home page
│   └── guide/, zh-hans/, zh-hant/   # content per language
├── assets/               # shared fonts
└── webhooks/             # deploy service (needs local secrets, not built by CI)
```

## How the sites are built

- Each site is a standalone VuePress project rooted at its own directory; `base: '/'` and the
  domain is set via `hostname` in `.vuepress/config.js`.
- `vuepress-plugin-clean-urls` rewrites links to extension-less URLs, `vuepress-plugin-sitemap`
  generates `sitemap.xml` from the discovered routes.
- Locales are declared inside a single config, so translations live in `zh-hans/` and
  `zh-hant/` next to the English content.

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push to `master` and on
every pull request:

1. `actions/setup-node` reads the version from `node-version.yml` and caches the npm store.
2. `npm ci` installs the pinned dependency tree.
3. A **matrix** builds all four sites in parallel, so one broken site does not hide the others.
4. `node scripts/check-build.js <dist>` smoke-checks the output.
5. The `dist` folder is uploaded as a workflow artifact (`site-<name>`).

Run the same pipeline locally before pushing:

```bash
npm ci && npm run build:all && npm test
```

## Deployment

Production is deployed by the `webhooks/` service (pull → build → purge Cloudflare cache),
not by GitHub Actions. The workflows above only produce and verify the static output.
