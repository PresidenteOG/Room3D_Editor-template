import { addPlacementCommand } from "./placementCommands";
import type { Command } from "./command";

/** Gives a freshly created room something to look at and move — a real UX
 * decision (SP3 replaces this with catalog browsing), kept as commands so it
 * goes through the same undo-tracked path as every other mutation. */
export function seedStarterFurnitureCommands(width: number, depth: number): Command[] {
  const margin = 30;
  return [
    addPlacementCommand({
      id: crypto.randomUUID(),
      catalogId: "bed-single",
      x: margin + 50,
      y: margin + 100,
      elevation: 0,
      rotationY: 0,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
    }),
    addPlacementCommand({
      id: crypto.randomUUID(),
      catalogId: "desk-basic",
      x: Math.max(width - margin - 60, margin + 60),
      y: margin + 30,
      elevation: 0,
      rotationY: Math.PI / 2,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
    }),
    addPlacementCommand({
      id: crypto.randomUUID(),
      catalogId: "wardrobe-basic",
      x: margin + 50,
      y: Math.max(depth - margin - 30, margin + 30),
      elevation: 0,
      rotationY: 0,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
    }),
  ];
}
