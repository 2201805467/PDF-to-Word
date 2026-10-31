# ورقة — PDF to Word

A bilingual Arabic/English web app that converts text-based PDFs into editable DOCX files or extracts their text. PDF processing runs in the browser: documents are never uploaded to an application server.

## Run locally

Requires Node.js 20.19+ or 22.12+.

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

## Hosting and GitHub

The static build can be hosted on any HTTPS static host. The optional `.openai/hosting.json` inside the app configures Sites hosting; it is separate from the GitHub repository.

Source: [2201805467/PDF-to-Word](https://github.com/2201805467/PDF-to-Word) (public).

Owner-private test deployment: [Waraqa](https://waraqa-pdf-taha.nearbybike2.chatgpt.site).

Built with [PDF.js](https://mozilla.github.io/pdf.js/) and [docx](https://docx.js.org/).
