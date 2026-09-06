import type { Point2, RoomGeometry } from "../doc/types";

export function rectangleRoom(
  width: number,
  depth: number,
  wallHeight: number,
  wallThickness = 10,
): RoomGeometry {
  return {
    polygon: [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: depth },
      { x: 0, y: depth },
    ],
    wallHeight,
    wallThickness,
    openings: [],
  };
}

export interface WallSegment {
  start: Point2;
  end: Point2;
  edgeIndex: number;
}

/** Consecutive polygon edges, wrapping from the last vertex back to the first. */
export function wallSegments(polygon: Point2[]): WallSegment[] {
  const segments: WallSegment[] = [];
  for (let i = 0; i < polygon.length; i++) {
    const start = polygon[i];
    const end = polygon[(i + 1) % polygon.length];
    segments.push({ start, end, edgeIndex: i });
  }
  return segments;
}

function segmentsIntersect(a1: Point2, a2: Point2, b1: Point2, b2: Point2): boolean {
  const d = (p: Point2, q: Point2, r: Point2) =>
    (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const d1 = d(b1, b2, a1);
  const d2 = d(b1, b2, a2);
  const d3 = d(a1, a2, b1);
  const d4 = d(a1, a2, b2);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }
  return false;
}

/** Rejects self-intersecting outlines. Adjacent edges (sharing a vertex) are exempt. */
export function isSimplePolygon(polygon: Point2[]): boolean {
  if (polygon.length < 3) return false;
  const segments = wallSegments(polygon);
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const adjacent =
        j === i + 1 || (i === 0 && j === segments.length - 1);
      if (adjacent) continue;
      if (segmentsIntersect(segments[i].start, segments[i].end, segments[j].start, segments[j].end)) {
        return false;
      }
    }
  }
  return true;
}

export function roomCenter(polygon: Point2[]): Point2 {
  const xs = polygon.map((p) => p.x);
  const ys = polygon.map((p) => p.y);
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
}

/** Ray-casting point-in-polygon. Boundary points are treated as inside. */
export function pointInPolygon(point: Point2, polygon: Point2[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const onEdge =
      Math.min(yi, yj) <= point.y &&
      point.y <= Math.max(yi, yj) &&
      Math.min(xi, xj) <= point.x &&
      point.x <= Math.max(xi, xj) &&
      (yj - yi) * (point.x - xi) === (xj - xi) * (point.y - yi);
    if (onEdge) return true;

    const intersects =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}
