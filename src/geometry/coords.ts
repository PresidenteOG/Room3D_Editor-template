// Single source of truth for the doc-space <-> view-space conversions.
// Doc space: centimetres, x = horizontal, y = depth, elevation = height above floor.
// three.js is Y-up: doc (x, y, elevation) -> three (x, elevation, y).
// Canvas2D is Y-down pixels: doc (x, y) -> canvas (originX + x*scale, originY + y*scale).
// Both render3d and plan2d must consume these helpers rather than inventing their own,
// or selection/dragging will disagree between the two views.

export interface Vector3Like {
  x: number;
  y: number;
  z: number;
}

export function docToThree(x: number, y: number, elevation: number): Vector3Like {
  return { x, y: elevation, z: y };
}

export function threeToDoc(v: Vector3Like): { x: number; y: number; elevation: number } {
  return { x: v.x, y: v.z, elevation: v.y };
}

/**
 * Doc rotationY is a standard counter-clockwise rotation in the doc x/y plane
 * (see geometry/placement.ts footprintCorners). Once doc y is mapped to three
 * z, three's native Y-axis rotation turns the opposite way, so a doc rotation
 * fed straight into mesh.rotation.y would spin furniture backwards. Negate
 * going in, negate again reading a mesh's rotation.y back into doc space —
 * every consumer must go through this helper rather than re-deriving the sign.
 */
export function docRotationYToThree(rotationY: number): number {
  return -rotationY;
}

export function threeRotationYToDoc(rotationY: number): number {
  return -rotationY;
}

export interface CanvasView {
  originX: number; // canvas px where doc x=0 maps to
  originY: number; // canvas px where doc y=0 maps to
  scale: number; // canvas px per cm
}

export function docToCanvas(x: number, y: number, view: CanvasView): { x: number; y: number } {
  return { x: view.originX + x * view.scale, y: view.originY + y * view.scale };
}

export function canvasToDoc(px: number, py: number, view: CanvasView): { x: number; y: number } {
  return { x: (px - view.originX) / view.scale, y: (py - view.originY) / view.scale };
}
