// Document model. Plain data only — no three.js, no React, no Tauri imports.
// Everything the user sees is derived from this shape; renderers never own state.

export interface Point2 {
  x: number;
  y: number;
}

export interface Opening {
  id: string;
  wallEdgeIndex: number; // index into room.polygon, edge from [i] to [i+1]
  offset: number; // cm from edge start to opening center
  width: number;
  height: number;
  sill: number; // cm from floor to bottom of opening (0 for doors)
  kind: "door" | "window";
}

export interface RoomGeometry {
  polygon: Point2[]; // cm, floor footprint, closed implicitly (no repeated last point)
  wallHeight: number; // cm
  wallThickness: number; // cm
  openings: Opening[]; // empty in SP0 — real cutouts land in SP1
}

export interface MaterialDef {
  id: string;
  color: string; // hex, SP0 placeholder — texture/tiling lands in SP2
}

export interface Placement {
  id: string;
  catalogId: string;
  x: number; // cm, doc-space horizontal
  y: number; // cm, doc-space depth (maps to three.js Z — see geometry/coords.ts)
  elevation: number; // cm, height above floor (maps to three.js Y)
  rotationY: number; // radians, rotation about the vertical axis
  scaleX: number;
  scaleY: number;
  scaleZ: number;
}

export interface DocumentMeta {
  name: string;
  author?: string;
  revision: number;
}

export interface RoomDoc {
  schemaVersion: number;
  meta: DocumentMeta;
  room: RoomGeometry;
  materials: Record<string, MaterialDef>;
  placements: Placement[];
}
