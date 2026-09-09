![Room3D_Editor](./docs/banner.png)

# Room3D_Editor [TEMPLATE]

![Rust](https://img.shields.io/badge/Rust-000000?style=flat&logo=rust&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Tauri](https://img.shields.io/badge/Tauri-24C8DB?style=flat&logo=tauri&logoColor=white)

A desktop app for laying out rooms in 3D — place furniture from a catalog, plan in 2D, preview in
3D, save and reload your layout.

## Showcase

![Room3D_Editor's UI: 2D floor plan, room canvas and inspector panel, viewed in a browser](./docs/screenshot.png)

*Real screenshot of the app actually running (`npm run dev`), viewed in a browser rather than the
native Tauri window — same React/three.js UI either way.*

## Stack

Tauri 2 (Rust shell) + React + three.js.

## Running it

```bash
npm install
npm run tauri dev
```

## Architecture

![Room3D_Editor architecture: 2D plan, 3D render and catalog feed a Zustand command/undo store holding a plain-data room document, with a geometry layer converting between plan, 3D and file coordinates, persisted to a .roomz file through the Tauri shell](./docs/architecture.png)

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full breakdown.

## License

[PolyForm Noncommercial 1.0.0](./LICENSE). Free for personal and non-commercial use —
not for shipping inside a product someone pays for.
