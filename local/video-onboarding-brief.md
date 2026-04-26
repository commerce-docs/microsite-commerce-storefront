# Storefront onboarding video — production brief

Adobe Commerce Storefront on Edge Delivery Services. Use this brief for storyboarding, recording, or handing off to video production.

---

## Purpose

Give a new developer a visual anchor before (or while) they read architecture topics: what a real page looks like, which regions are content versus Commerce, and how that connects to documents and the Git repository.

This video is orientation only. It does not teach Site Creator, Git, GraphQL, or how to install a drop-in.

---

## Learning outcome for the viewer

After about 3–6 minutes, the viewer should be able to point at a live storefront page and say:

- This region is marketing or layout from the document (a content block).
- This region is Commerce (a Commerce block)—wired to code; can host cart, PDP, checkout, account, and similar flows.
- The interactive UI in that Commerce region comes from a drop-in (an npm package), not from pasting drop-in markup into the document by hand.
- Merchants change structure and copy in the document; developers change behavior and wiring in the Git repository.

---

## What to show (in order)

### 1. Opening (about 5–15 seconds)

- Full-page shot of a real shopper-facing storefront (boilerplate-style demo, published preview, or production).
- One-line goal on screen or in narration: name the main regions of the page and tie each region to Edge Delivery Services and the repo.

### 2. Page pan with labels (top to bottom)

Use callouts or lower-thirds; avoid dense paragraphs.

- Header or nav: label as content blocks (layout and marketing).
- Hero or promo row: content block.
- At least one clear Commerce region: Commerce block (name the flow you show, for example cart, PDP, or checkout).
- Footer: content block.

Use the same vocabulary as the developer docs: content block versus Commerce block.

### 3. One Commerce region, closer (about 30–90 seconds)

Stay on one Commerce block (for example cart or PDP).

- Show live behavior (add to cart, change quantity, or change variant) so the region is clearly dynamic, not a screenshot.
- On-screen chain (diagram or four boxes is enough): Commerce block → block decorator in `blocks/<name>/` → initializer in `scripts/initializers/` → npm package `@dropins/storefront-*`.
- You do not need to open every file; labels or a simple diagram are enough.

### 4. Merchant versus developer (about 15–30 seconds, optional but high value)

Two beats or split screen:

- Document Authoring or Universal Editor (or a sanitized document view): merchants use document tables and rows to choose which blocks appear and in what order.
- GitHub or VS Code (one file, slow scroll): developers supply JavaScript, styles, and configuration so Commerce blocks know which drop-in to run and which endpoints to use.

Keep secrets, credentials, and internal URLs off screen.

### 5. Close (about 10 seconds)

Point to written next steps, for example: How a page loads, then Blocks and the repository, in the Storefront Architecture section of the developer guide. Reinforce that the video complements the docs; it does not replace them.

---

## What not to show (first version)

- Long Commerce Admin or API key setup.
- Long Sidekick or full publish workflow unless this video is explicitly an authoring tutorial; for developer onboarding, a glance at a document is enough.
- DevTools Network tab or GraphQL payloads (reserve for a separate short “proof” video if needed).

---

## Length and tone

- Target 3–6 minutes for the core flow: labeled page, one Commerce deep dive, optional merchant versus developer.
- Calm pacing; labels large enough to read; hold each label long enough to read once.

---

## Optional second video (different goal)

Title idea: Under the hood in 90 seconds.

- Open browser DevTools → Network, filter to GraphQL (or relevant calls).
- Show one request after a shopper action in a Commerce block.

Supports readers who want evidence of browser-to-Commerce traffic. Keep it separate from the first, reassuring tour.

---

## Where to host and link (for the docs team)

- Primary: a dedicated Get started topic, or a page under Storefront Videos in the doc site, with the embed.
- Cross-link from: Get started hub, Storefront Architecture overview, and Blocks and the repository—so new readers hit the video on the path they already follow.

---

Document generated for print and handoff. Source file: `local/video-onboarding-brief.md`.
