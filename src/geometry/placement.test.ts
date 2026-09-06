import { describe, expect, it } from "vitest";
import type { Placement } from "../doc/types";
import { aabbOverlaps, footprintCorners, placementAABB, pointInAABB } from "./placement";

function placement(overrides: Partial<Placement> = {}): Placement {
  return {
    id: "p1",
    catalogId: "desk-basic",
    x: 100,
    y: 100,
    elevation: 0,
    rotationY: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    ...overrides,
  };
}

const dims = { width: 120, depth: 60, height: 75 };

describe("footprintCorners / placementAABB", () => {
  it("computes an axis-aligned box at rotation 0", () => {
    const box = placementAABB(placement(), dims);
    expect(box.minX).toBeCloseTo(40);
    expect(box.maxX).toBeCloseTo(160);
    expect(box.minY).toBeCloseTo(70);
    expect(box.maxY).toBeCloseTo(130);
  });

  it("swaps footprint extents at a 90 degree rotation", () => {
    const box = placementAABB(placement({ rotationY: Math.PI / 2 }), dims);
    expect(box.maxX - box.minX).toBeCloseTo(60);
    expect(box.maxY - box.minY).toBeCloseTo(120);
  });

  it("scales the footprint with scaleX/scaleZ", () => {
    const box = placementAABB(placement({ scaleX: 2, scaleZ: 1 }), dims);
    expect(box.maxX - box.minX).toBeCloseTo(240);
    expect(box.maxY - box.minY).toBeCloseTo(60);
  });

  it("produces 4 corners", () => {
    expect(footprintCorners(placement(), dims)).toHaveLength(4);
  });
});

describe("pointInAABB", () => {
  it("hit-tests inside and outside the box", () => {
    const box = placementAABB(placement(), dims);
    expect(pointInAABB({ x: 100, y: 100 }, box)).toBe(true);
    expect(pointInAABB({ x: 0, y: 0 }, box)).toBe(false);
  });
});

describe("aabbOverlaps", () => {
  it("detects overlapping boxes", () => {
    const a = placementAABB(placement({ x: 100, y: 100 }), dims);
    const b = placementAABB(placement({ x: 150, y: 100 }), dims);
    expect(aabbOverlaps(a, b)).toBe(true);
  });

  it("detects non-overlapping boxes", () => {
    const a = placementAABB(placement({ x: 100, y: 100 }), dims);
    const b = placementAABB(placement({ x: 1000, y: 1000 }), dims);
    expect(aabbOverlaps(a, b)).toBe(false);
  });
});
