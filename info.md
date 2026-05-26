# Reset Music Blog - Technical Architecture & Developer Guide

Welcome to the **Reset Music Blog** repository. This document serves as the primary reference for the system architecture, database design, key engineering workflows, and developer operations for the platform.

---

## 1. System Overview & Tech Stack

Reset Music is a modern, high-performance editorial-style blog platform designed for music production tips, beat-making tutorials, and industry insights. It balances rich, search-engine-optimized public pages with a secure and robust admin CMS dashboard.

* **Core Framework**: **Next.js 16 (App Router)** with TypeScript
* **Database**: **MongoDB** with **Mongoose ODM**
* **Styling**: **TailwindCSS** (v4/v3 compatible structure) & **Lucide React** icons
* **Cloud Storage**: **AWS S3** (Object storage for cover assets and in-line content images)
* **Authentication**: JWT-based session security for admin CMS routes

---

## 2. Directory Architecture

```
reset-music-blog/
├── public/                 # Static assets served by Next.js
│   └── og-default.png      # Global fall-back Open Graph banner card
├── src/
│   ├── app/                # Next.js App Router (Page routing & layouts)
│   │   ├── admin/          # CMS views (managing articles, authors, categories)
│   │   ├── blog/           # Public article feeds & individual article pages
│   │   ├── category/       # Category page feeds (ISR rendering)
│   │   ├── tag/            # Tag page feeds (ISR rendering)
│   │   ├── login/          # Secure admin login form
│   │   ├── layout.tsx      # Root layout, base HTML structure & navbar/footer populate
│   │   ├── page.tsx        # Homepage (featured, latest, and trending articles)
│   │   ├── robots.ts       # SEO search engine crawl indexing directives
│   │   └── sitemap.ts      # Dynamic XML sitemap generator
│   ├── components/         # Reusable React components
│   │   ├── article/        # Article UI (Card, Markdown renderer, TOC, Social share)
│   │   ├── blog/           # Feed filters and search state controls
│   │   └── layout/         # Header and footer menus
│   ├── lib/                # Shared utilities & configurations
│   │   ├── mongoose.ts     # Database connection pool manager
│   │   └── seo.ts          # Metadata helper interfaces
│   └── models/             # Mongoose database schemas
│       ├── AdminUser.ts    # Admin credentials
│       ├── Article.ts      # Main article content & settings
│       ├── Author.ts       # Writer bio & credentials
│       ├── Category.ts     # Section topics
│       └── Tag.ts          # Metadata tags
├── seed-admin.js           # Database administrator credential seed script
├── tailwind.config.ts      # Tailwind styling rules
├── tsconfig.json           # Strict TypeScript configuration compiler rules
└── next.config.ts          # Next.js bundler and server settings
```

---

## 3. Database Domain Models & Schema Design

### 3.1 Article Schema (`src/models/Article.ts`)
Tracks article content, state, routing parameters, and specific SEO overrides:
* **title** (`String`, Required)
* **slug** (`String`, Required, Unique): Used for SEO-friendly page routing.
* **excerpt** (`String`): Short summary shown on feeds.
* **content** (`String`, Required): Raw Markdown text representing the body of the article.
* **coverImage** (`String`): URL to the cover banner hosted on AWS S3.
* **socialImage** (`String`): Optional custom Open Graph sharing override URL.
* **author** (`ObjectId` -> `Author`): Relational link to author profile.
* **category** (`ObjectId` -> `Category`): Relational link to category.
* **tags** (`[ObjectId]` -> `Tag`): Multi-select tags.
* **seoTitle** / **seoDescription** (`String`): Metadata overrides to optimize click-through rate in search results.
* **publishStatus** (`"draft" | "published"`, default: `"draft"`)
* **featured** (`Boolean`): Renders article in hero zones when true.
* **viewCount** (`Number`): Tracked for sorting popular trending lists.

---

## 4. Key Engineering Workflows & Pipelines

### 4.1 Incremental Static Regeneration (ISR)
The public homepage and article indices utilize Next.js ISR:
* `export const revalidate = 60;` is exported from root feeds to cache pages in the background, updating them at most once every 60 seconds. This results in near-instantaneous page loads for clients while preserving live database sync.

### 4.2 Dynamic SEO & Social Share Previews (Open Graph)
* Next.js `generateMetadata()` matches database contents on dynamic routes like `/blog/[slug]`.
* If a post does not configure a custom cover, it falls back gracefully to a premium default branding asset (`public/og-default.png`).
* Absolute URLs are automatically verified against `https://blog.musicreset.com` (using `metadataBase`) to ensure compatibility with messaging client link preview renderers (WhatsApp, Slack, Twitter).

### 4.3 AWS S3 File Upload Pipeline
Rather than routing heavy image buffers through Next.js server threads, the app uses a high-performance direct S3 upload approach:
1. The client requests a presigned PUT URL from Next.js server actions (`getPresignedUrlAction`).
2. The server calls AWS S3, generates a temporary signed URL valid for 5 minutes, and sends it to the client.
3. The client browser uploads the file directly to the S3 bucket via standard binary `fetch(PUT)`, completely bypassing Next.js processing overhead.

### 4.4 Clipboard DOM-Parser (HTML-to-Markdown)
To allow editors to copy and paste text directly from **Google Docs** or **Word** while preserving formatting without external heavy parsers:
* Intercepts `onPaste` event in the editor textarea.
* Mounts raw HTML temporarily inside a hidden browser DOM node.
* Reads layout rules directly from the browser's style solver using **`window.getComputedStyle`**, extracting font weights, italics, sizes, and Google Docs bullet selectors (`●`).
* Re-compiles it contextually to clean, un-nested Markdown and inserts it at the exact cursor caret position.

---

## 5. Developer & Seeding Operations

### 5.1 Seeding an Admin User
To populate the initial administrator database records in MongoDB, configure your connection string in `.env` and execute:
```bash
node seed-admin.js
```
*Creates `admin@resetmusic.com` with a hashed version of `password123`.*

### 5.2 Local Development Server
Start the Next.js development server:
```bash
npm run dev
```
*Access the site locally at `http://localhost:3000` (CMS panel is at `/admin`).*

### 5.3 Production Builds
To test the bundling, static generation, sitemap compiler, and TypeScript checks:
```bash
npm run build
```