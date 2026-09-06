import type { Placement } from "../doc/types";
import { makeCommand, type Command } from "./command";

export function addPlacementCommand(placement: Placement): Command {
  return makeCommand(
    `add ${placement.id}`,
    (doc) => ({ ...doc, placements: [...doc.placements, placement] }),
    () => removePlacementCommand(placement.id),
  );
}

export function removePlacementCommand(id: string): Command {
  return makeCommand(
    `remove ${id}`,
    (doc) => ({ ...doc, placements: doc.placements.filter((p) => p.id !== id) }),
    (preDoc) => {
      const removed = preDoc.placements.find((p) => p.id === id);
      if (!removed) {
        // Nothing to restore — invert is a no-op that stays a no-op if inverted again.
        return makeCommand(`noop remove ${id}`, (doc) => doc, () => removePlacementCommand(id));
      }
      return addPlacementCommand(removed);
    },
  );
}

export function movePlacementCommand(id: string, dx: number, dy: number, dElevation: number): Command {
  return makeCommand(
    `move ${id}`,
    (doc) => ({
      ...doc,
      placements: doc.placements.map((p) =>
        p.id === id ? { ...p, x: p.x + dx, y: p.y + dy, elevation: p.elevation + dElevation } : p,
      ),
    }),
    () => movePlacementCommand(id, -dx, -dy, -dElevation),
  );
}

export function rotatePlacementCommand(id: string, dRotationY: number): Command {
  return makeCommand(
    `rotate ${id}`,
    (doc) => ({
      ...doc,
      placements: doc.placements.map((p) =>
        p.id === id ? { ...p, rotationY: p.rotationY + dRotationY } : p,
      ),
    }),
    () => rotatePlacementCommand(id, -dRotationY),
  );
}

export function scalePlacementCommand(
  id: string,
  dScaleX: number,
  dScaleY: number,
  dScaleZ: number,
): Command {
  return makeCommand(
    `scale ${id}`,
    (doc) => ({
      ...doc,
      placements: doc.placements.map((p) =>
        p.id === id
          ? {
              ...p,
              scaleX: p.scaleX + dScaleX,
              scaleY: p.scaleY + dScaleY,
              scaleZ: p.scaleZ + dScaleZ,
            }
          : p,
      ),
    }),
    () => scalePlacementCommand(id, -dScaleX, -dScaleY, -dScaleZ),
  );
}
