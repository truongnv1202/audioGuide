# Lato font

The app uses `@fontsource/lato` from `package.json`, imported in `src/app/globals.css`:

- `@fontsource/lato/400.css`
- `@fontsource/lato/700.css`
- `@fontsource/lato/900.css`

During `npm install` and Docker build, the font files are installed into `node_modules` and bundled by Next.js. There is no runtime dependency on browser-installed fonts or Google Fonts.
