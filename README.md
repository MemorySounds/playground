# Playground Sessions

A simple indie-website for avant-garde happenings.
Built with Eleventy (static site generator), Nunjucks templates, SCSS, and vanilla JS.

Live: https://playyground.art/

## How It Works

- **Content** lives in `src/_data/*.yml` (pages) and `src/events/*.md` (event posts).
- **Templates** are in `src/_includes/` (Nunjucks). Eleventy compiles everything into `_site/`.
- **Styles** are written in SCSS under `styles/` and compiled to `styles.css`.
- **Navigation** is a hash-based SPA — pages are loaded dynamically via `scripts/spa.js` without full page reloads.
- **Deployment** is automatic — pushing to `main` triggers a GitHub Actions build and deploys to GitHub Pages.

## Local Development

```bash
git clone https://github.com/MemorySounds/playground.git
cd playground
npm install
npm run dev
```

`npm run dev` watches SCSS for changes and runs the Eleventy dev server simultaneously. The site is available at `http://localhost:8080`.

Other useful commands:

```bash
npm run build        # full production build (CSS + Eleventy)
npm run build:css    # compile SCSS only
npm run build:11ty   # run Eleventy only
```

## Project Structure

```
src/                  # source templates and content
  _data/              # page content as YAML (editable via CMS)
  _includes/          # Nunjucks base and post templates
  events/             # event posts as Markdown (editable via CMS)
  admin/              # Sveltia CMS interface and config
styles/               # SCSS source files
scripts/              # vanilla JS (SPA routing, audio player)
assets/               # images, audio, video
_site/                # compiled output (do not edit directly)
```

## CMS — Content Management

Non-technical editors can manage content via Sveltia CMS.
Authentication is handled by a Cloudflare Worker (`sveltia-cms-auth`) using a GitHub OAuth App. Saved changes commit directly to `main` and trigger an automatic redeploy.
