# Self-hosted Lato fonts

Place the Lato font files used by `src/app/globals.css` in this directory:

- `Lato-Regular.ttf`
- `Lato-Bold.ttf`
- `Lato-Black.ttf`

Official source: Google Fonts repository, `ofl/lato`.

Direct font URLs verified from Google Fonts:

- `https://fonts.gstatic.com/s/lato/v25/S6uyw4BMUTPHvxk.ttf` -> `Lato-Regular.ttf`
- `https://fonts.gstatic.com/s/lato/v25/S6u9w4BMUTPHh6UVew8.ttf` -> `Lato-Bold.ttf`
- `https://fonts.gstatic.com/s/lato/v25/S6u9w4BMUTPHh50Xew8.ttf` -> `Lato-Black.ttf`

The app references only `/fonts/lato/...` paths at runtime, so it does not depend on browser-installed Lato or a remote font stylesheet.
