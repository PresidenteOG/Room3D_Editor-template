import type { Dimensions } from "../geometry/placement";

export interface CatalogEntry {
  id: string;
  name: string;
  kind: string;
  dimensions: Dimensions;
  color: string;
}

// SP0 parametric fallback set. GLB catalog pipeline lands in SP3.
export const PROCEDURAL_CATALOG: CatalogEntry[] = [
  {
    id: "bed-single",
    name: "Single Bed",
    kind: "bed",
    dimensions: { width: 100, depth: 200, height: 45 },
    color: "#8a6d5c",
  },
  {
    id: "desk-basic",
    name: "Desk",
    kind: "desk",
    dimensions: { width: 120, depth: 60, height: 75 },
    color: "#5c7a8a",
  },
  {
    id: "wardrobe-basic",
    name: "Wardrobe",
    kind: "wardrobe",
    dimensions: { width: 100, depth: 60, height: 200 },
    color: "#6d5c8a",
  },
];

export function getCatalogEntry(id: string): CatalogEntry | undefined {
  return PROCEDURAL_CATALOG.find((e) => e.id === id);
}
