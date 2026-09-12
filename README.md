![Room Planner 3D banner](./docs/banner.png)

# Room Planner 3D

![Rust](https://img.shields.io/badge/Rust-000000?style=flat&logo=rust&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Tauri](https://img.shields.io/badge/Tauri-24C8DB?style=flat&logo=tauri&logoColor=white)

A desktop app for laying out rooms in 3D — place furniture from a catalog, plan in 2D, preview in
3D, save and reload your layout.

## Showcase

![A fresh room: the 2D floor plan on the left with a bed, desk and wardrobe, the same three pieces in the three.js view in the middle, the inspector on the right waiting for a selection](./docs/screenshots/overview.png)

![The desk selected and then rotated and widened from the inspector — the 2D plan and the 3D view both update, and the transform gizmo sits on the desk in 3D](./docs/screenshots/editing.png)

Both captured from `npm run dev` in a browser rather than the native Tauri window — the
React and three.js UI is the same either way. "New Room" drops in a starter bed, desk and
wardrobe; the inspector edits position, rotation and scale, and every edit is undoable.

## Stack

Tauri 2 (Rust shell) + React + three.js.

## Download

Pre-built desktop packages are attached to the [releases](https://github.com/PresidenteOG/room-planner-3d/releases) page.

## Running from source

```bash
npm install
npm run tauri dev
```

## Architecture

![Room Planner 3D architecture: 2D plan, 3D render and catalog feed a Zustand command/undo store holding a plain-data room document, with a geometry layer converting between plan, 3D and file coordinates, persisted to a .roomz file through the Tauri shell](./docs/architecture.png)

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full breakdown.

## License

[PolyForm Noncommercial 1.0.0](./LICENSE). Free for personal and non-commercial use —
not for shipping inside a product someone pays for.
