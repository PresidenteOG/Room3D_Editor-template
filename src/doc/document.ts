import type { RoomDoc } from "./types";
import { rectangleRoom } from "../geometry/room";

export function emptyDocument(): RoomDoc {
  return {
    schemaVersion: 1,
    meta: { name: "Untitled Room", revision: 0 },
    room: rectangleRoom(400, 300, 260),
    materials: {},
    placements: [],
  };
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isPoint2(v: unknown): boolean {
  return (
    typeof v === "object" &&
    v !== null &&
    isFiniteNumber((v as { x: unknown }).x) &&
    isFiniteNumber((v as { y: unknown }).y)
  );
}

/**
 * Hand-rolled structural validator — no schema library in the pinned dependency
 * set. Used for round-trip sanity here, and by the SP4 `.roomz` loader against
 * untrusted input, so it must reject non-finite numbers and malformed shapes
 * rather than merely check types.
 */
export function validateDocument(value: unknown): value is RoomDoc {
  if (typeof value !== "object" || value === null) return false;
  const doc = value as Partial<RoomDoc>;

  if (!isFiniteNumber(doc.schemaVersion) || doc.schemaVersion <= 0) return false;

  if (typeof doc.meta !== "object" || doc.meta === null) return false;
  if (typeof doc.meta.name !== "string") return false;
  if (!isFiniteNumber(doc.meta.revision) || doc.meta.revision < 0) return false;

  const room = doc.room;
  if (typeof room !== "object" || room === null) return false;
  if (!Array.isArray(room.polygon) || room.polygon.length < 3) return false;
  if (room.polygon.length > 200) return false; // bounded against pathological input
  if (!room.polygon.every(isPoint2)) return false;
  if (!isFiniteNumber(room.wallHeight) || room.wallHeight <= 0) return false;
  if (!isFiniteNumber(room.wallThickness) || room.wallThickness <= 0) return false;
  if (!Array.isArray(room.openings)) return false;

  if (typeof doc.materials !== "object" || doc.materials === null) return false;

  if (!Array.isArray(doc.placements)) return false;
  if (doc.placements.length > 5000) return false; // bounded against pathological input
  for (const p of doc.placements) {
    if (typeof p !== "object" || p === null) return false;
    const pl = p as unknown as Record<string, unknown>;
    if (typeof pl.id !== "string" || typeof pl.catalogId !== "string") return false;
    if (
      !isFiniteNumber(pl.x) ||
      !isFiniteNumber(pl.y) ||
      !isFiniteNumber(pl.elevation) ||
      !isFiniteNumber(pl.rotationY) ||
      !isFiniteNumber(pl.scaleX) ||
      !isFiniteNumber(pl.scaleY) ||
      !isFiniteNumber(pl.scaleZ)
    ) {
      return false;
    }
  }

  return true;
}
