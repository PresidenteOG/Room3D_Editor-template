import type { Placement, Point2 } from "../doc/types";

export interface Dimensions {
  width: number;
  depth: number;
  height: number;
}

export interface AABB {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** The four footprint corners in doc space, rotated about the placement center. */
export function footprintCorners(placement: Placement, dims: Dimensions): Point2[] {
  const hw = (dims.width * placement.scaleX) / 2;
  const hd = (dims.depth * placement.scaleZ) / 2;
  const local: Point2[] = [
    { x: -hw, y: -hd },
    { x: hw, y: -hd },
    { x: hw, y: hd },
    { x: -hw, y: hd },
  ];
  const cos = Math.cos(placement.rotationY);
  const sin = Math.sin(placement.rotationY);
  return local.map((p) => ({
    x: placement.x + p.x * cos - p.y * sin,
    y: placement.y + p.x * sin + p.y * cos,
  }));
}

export function aabbFromCorners(corners: Point2[]): AABB {
  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

export function placementAABB(placement: Placement, dims: Dimensions): AABB {
  return aabbFromCorners(footprintCorners(placement, dims));
}

export function pointInAABB(point: Point2, box: AABB): boolean {
  return point.x >= box.minX && point.x <= box.maxX && point.y >= box.minY && point.y <= box.maxY;
}

export function aabbOverlaps(a: AABB, b: AABB): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}
