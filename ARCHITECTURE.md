# Architecture

Built a cross-platform desktop room planner with 2D layout, live 3D preview and undo/redo, that
saves and reloads a custom `.roomz` file, using Tauri 2, React and three.js.

You open the app to an empty room you can resize by width, depth and height, drag furniture in
from a catalog, move it around in the 2D plan while watching it update live in the 3D view, and
undo or redo any of that. When you're happy with the layout, save writes it to a `.roomz` file on
disk; opening that file later restores the exact same room.

![Room3D_Editor architecture: 2D plan, 3D render and catalog feed a Zustand command/undo store holding a plain-data room document, with a geometry layer converting between plan, 3D and file coordinates, persisted to a .roomz file through the Tauri shell](./docs/architecture.png)

**Why Tauri over Electron**: Tauri ships a Rust shell instead of bundling a full Chromium and
Node runtime per app, so the installer is a few megabytes instead of over a hundred — worth it for
a desktop tool this size, where Electron's extra weight buys nothing the app actually needs.

## Structure

| Folder | What it does |
|---|---|
| `src-tauri/` | The Rust shell. Thin on purpose — opens the window and exposes the file dialog + filesystem plugins; almost no app logic lives here. |
| `src/render3d/` | The three.js scene: renders the room and its furniture in 3D. |
| `src/plan2d/` | The 2D floor-plan view used for layout. |
| `src/catalog/` | The furniture catalog data and lookup. |
| `src/commands/` | Every user action (`roomCommands`, `placementCommands`) implemented as a
  command object, which is what makes undo/redo possible. |
| `src/store/` | App state (`documentStore`) plus the undo/redo stack that replays or reverses
  commands. |
| `src/persist/` | Reads and writes the project's own `.roomz` file format
  (`roomzFormat`, `roomzIO`) and checks whether it's running inside Tauri or a plain browser. |
| `src/doc/` | The room document itself — `RoomDoc` and its `types`, plus `validateDocument`.
  Plain data, no three.js / React / Tauri imports. Everything on screen is derived from this
  shape; the store holds one of these and the renderers never own state. |
| `src/geometry/` | Pure math with no rendering: the doc-space ↔ three.js ↔ canvas2D
  coordinate conversions (`coords`), furniture footprint and AABB overlap tests
  (`placement`), and room-polygon helpers (`room`). `render3d` and `plan2d` both consume
  these instead of each inventing their own. |
| `src/ui/` | React components. |

## Language / framework breakdown

| Part | Technology |
|---|---|
| Desktop shell | Rust (Tauri 2) |
| UI | React + TypeScript |
| 3D rendering | three.js, via `@react-three/fiber` and `@react-three/drei` |
| State | Zustand, with a custom command/undo stack on top |

## Data and external services

No database, no external API, no network calls at all. Saving a room writes a `.roomz` file to
disk through Tauri's filesystem plugin — that's the entire persistence layer. This template
doesn't add a local database because there was nothing external to replace: the app was already
local-only by design.

## Running it

```bash
npm install
npm run tauri dev
```

Tests: `npm run test`.
