# Architecture

Built a cross-platform desktop room planner with 2D layout, live 3D preview and undo/redo, that
saves and reloads a custom `.roomz` file, using Tauri 2, React and three.js.

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
