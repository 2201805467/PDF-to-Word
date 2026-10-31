# ورقة — PDF to Word

A bilingual Arabic/English web app that converts text-based PDFs into editable DOCX files or extracts their text. PDF processing runs in the browser: documents are never uploaded to an application server.

## Run locally

Use Node.js 24 (configured in `pdf-to-word/.node-version`).

```sh
cd pdf-to-word
npm ci
npm run dev
```

Open the URL printed by Vite. Use `npm run build` to generate `dist/`, `npm run preview` to preview the build, and `npm test` to run conversion and page-selection tests. Run `npm run test:browser` for real Chrome upload, page-range, download, language, and mobile checks (requires installed Google Chrome).

## Features

- Arabic RTL and English UI, with remembered language preference.
- Drag-and-drop PDF input, 25 MB limit, file size and page count.
- All pages or selected ranges, including Arabic page numbers.
- Editable Word output with basic line and page boundaries and RTL text support.
- Text preview, clipboard copy, TXT and DOCX downloads, real processing progress.
- Responsive keyboard-accessible controls and clear error states.

## Limits and privacy

This is text reconstruction, not exact PDF layout conversion. Images, original typography, tables, and complex column layouts are not reconstructed. OCR and encrypted PDFs are not supported; image-only files show a clear message. Mixed scanned/text documents warn about empty pages. Extraction quality depends on the PDF's text encoding and reading order.

File bytes and extracted text stay in browser memory. Removing a file or closing the tab releases the document; no file history is stored. The language preference is saved in localStorage. Google Fonts requests font assets but receives no document contents. No analytics, accounts, or backend storage are used.

## Deploy to Cloudflare Pages

Connect the GitHub repository to Cloudflare Pages and use these build settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | `None` |
| Root directory | `pdf-to-word` |
| Build command | `npm run build` |
| Build output directory | `dist` |

The `.node-version` file selects Node.js 24. No environment secrets, database, or backend service are needed. Cloudflare installs npm dependencies before running the build. The build script also copies the PDF.js CMaps and standard fonts required by PDF processing.

For a manual upload, run `npm run build` inside `pdf-to-word`, then upload the **contents of `pdf-to-word/dist`** with Cloudflare Pages Direct Upload. Do not upload the source directory or `node_modules`.

See Cloudflare's [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/) and [Node.js build environment](https://developers.cloudflare.com/pages/configuration/build-image/) documentation.

Source: [2201805467/PDF-to-Word](https://github.com/2201805467/PDF-to-Word) (public).

Built with [PDF.js](https://mozilla.github.io/pdf.js/) and [docx](https://docx.js.org/).
