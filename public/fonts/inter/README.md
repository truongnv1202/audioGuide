# Inter font

The app uses `@fontsource/inter` from `package.json`, imported in `src/app/globals.css`:

- `@fontsource/inter/400.css`
- `@fontsource/inter/600.css`
- `@fontsource/inter/700.css`
- `@fontsource/inter/900.css`

During `npm install` and Docker build, the font files are installed into `node_modules` and bundled by Next.js. There is no runtime dependency on browser-installed fonts or Google Fonts.
