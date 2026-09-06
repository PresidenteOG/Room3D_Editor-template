import { describe, expect, it } from "vitest";
import { isSimplePolygon, pointInPolygon, rectangleRoom, roomCenter, wallSegments } from "./room";

describe("rectangleRoom", () => {
  it("derives a 4-vertex polygon matching the given dimensions", () => {
    const room = rectangleRoom(400, 300, 260, 10);
    expect(room.polygon).toEqual([
      { x: 0, y: 0 },
      { x: 400, y: 0 },
      { x: 400, y: 300 },
      { x: 0, y: 300 },
    ]);
    expect(room.wallHeight).toBe(260);
    expect(room.wallThickness).toBe(10);
    expect(room.openings).toEqual([]);
  });
});

describe("wallSegments", () => {
  it("returns 4 wrapping segments for a rectangle", () => {
    const room = rectangleRoom(400, 300, 260);
    const segments = wallSegments(room.polygon);
    expect(segments).toHaveLength(4);
    expect(segments[3].end).toEqual(segments[0].start);
  });
});

describe("isSimplePolygon", () => {
  it("accepts a rectangle", () => {
    const room = rectangleRoom(400, 300, 260);
    expect(isSimplePolygon(room.polygon)).toBe(true);
  });

  it("rejects a self-intersecting bowtie", () => {
    const bowtie = [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      { x: 100, y: 0 },
      { x: 0, y: 100 },
    ];
    expect(isSimplePolygon(bowtie)).toBe(false);
  });

  it("rejects fewer than 3 points", () => {
    expect(isSimplePolygon([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(false);
  });
});

describe("roomCenter", () => {
  it("returns the bounding-box center", () => {
    const room = rectangleRoom(400, 300, 260);
    expect(roomCenter(room.polygon)).toEqual({ x: 200, y: 150 });
  });
});

describe("pointInPolygon", () => {
  const room = rectangleRoom(400, 300, 260);

  it("reports points inside as inside", () => {
    expect(pointInPolygon({ x: 200, y: 150 }, room.polygon)).toBe(true);
  });

  it("reports points outside as outside", () => {
    expect(pointInPolygon({ x: -10, y: 150 }, room.polygon)).toBe(false);
    expect(pointInPolygon({ x: 200, y: 400 }, room.polygon)).toBe(false);
  });

  it("treats boundary points as inside", () => {
    expect(pointInPolygon({ x: 0, y: 150 }, room.polygon)).toBe(true);
    expect(pointInPolygon({ x: 400, y: 0 }, room.polygon)).toBe(true);
  });
});
