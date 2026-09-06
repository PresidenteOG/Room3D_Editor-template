# Row 9 — Tauri capability review (SP0)

Reviewed: `tauri.conf.json`, `capabilities/main.json`, `Cargo.toml` plugin set.

## In place

- **CSP** (`tauri.conf.json`): `default-src 'self'` with no `unsafe-eval` and no remote
  origins. `connect-src 'self'` blocks the webview from making network requests
  anywhere but its own origin — there is no legitimate reason for Room3D_Editor to talk to
  a remote server in SP0. `style-src 'unsafe-inline'` is present for React's inline
  `style` prop; this is a minor, low-risk relaxation (style injection cannot execute
  script) and does not need `unsafe-eval` or remote script sources to work around.
- **No shell plugin.** `tauri-plugin-shell` is absent from `Cargo.toml` — the app cannot
  spawn arbitrary processes, which is the highest-severity capability Tauri offers and
  the one this app has no legitimate use for.
- **fs scope is real, not cosmetic.** `capabilities/main.json` grants
  `fs:allow-read-file` / `fs:allow-write-file` scoped to `$APPDATA/**` only — not `**`
  or `$HOME/**`. `src/persist/roomzIO.ts` deliberately roots both the open and save
  dialogs inside `appDataDir()` so every path the app can reach in practice is one the
  capability actually covers, rather than granting a broad scope "to be safe."
- **`core:default`** added explicitly (the standard bundle covering path resolution,
  window and app basics) so `appDataDir()` resolves without silently failing — this is
  the same baseline a normal Tauri scaffold ships with, not an expansion.
- **`withGlobalTauri` left at its v2 default (false).** No `window.__TAURI__` global is
  injected into the page; API access requires an explicit ESM import, which is a
  narrower attack surface for any future third-party content the webview might load.

## Deliberately deferred to SP4

- **Arbitrary save/open locations.** Sharing a `.roomz` file with a friend means saving
  to and opening from anywhere the user picks (Desktop, a synced Drive folder), not
  just `$APPDATA`. That needs either a broader fs scope keyed to the dialog's own
  returned path, or the dialog-plugin's path-bridging pattern — a real design decision,
  not a capability tweak, and belongs with the SP4 sharing work.
- **The hardened `.roomz` loader's adversarial test suite.** `src/persist/roomzFormat.ts`
  already rejects path traversal, disallowed extensions, oversized archives, and
  malformed JSON (see `roomzFormat.test.ts`) — that baseline exists now so the format
  doesn't need reshaping later. Fuzz-style adversarial coverage (truncated archives,
  deeply nested zips, hostile encodings) is SP4's job, per the original design doc.
- **Expansion-pack downloads.** Not present in SP0 at all; when they land in SP4 they
  need their own scoped `http` capability plus manifest signature/hash pinning, not an
  extension of today's fs scope.

No changes requested to code outside `src-tauri/capabilities/main.json` (added
`core:default`) as a result of this review.
