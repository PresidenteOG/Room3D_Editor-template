import { describe, expect, it } from "vitest";
import {
  canvasToDoc,
  docRotationYToThree,
  docToCanvas,
  docToThree,
  threeRotationYToDoc,
  threeToDoc,
} from "./coords";

describe("doc <-> three.js conversion", () => {
  it("maps doc y to three z and elevation to three y", () => {
    expect(docToThree(10, 20, 30)).toEqual({ x: 10, y: 30, z: 20 });
  });

  it("round-trips", () => {
    const v = docToThree(10, 20, 30);
    expect(threeToDoc(v)).toEqual({ x: 10, y: 20, elevation: 30 });
  });
});

describe("docRotationYToThree / threeRotationYToDoc", () => {
  it("negates the angle", () => {
    expect(docRotationYToThree(Math.PI / 3)).toBeCloseTo(-Math.PI / 3);
  });

  it("round-trips", () => {
    const original = 1.23;
    expect(threeRotationYToDoc(docRotationYToThree(original))).toBeCloseTo(original);
  });
});

describe("doc <-> canvas conversion", () => {
  const view = { originX: 50, originY: 50, scale: 2 };

  it("round-trips a point through docToCanvas/canvasToDoc", () => {
    const canvasPoint = docToCanvas(100, 150, view);
    const back = canvasToDoc(canvasPoint.x, canvasPoint.y, view);
    expect(back.x).toBeCloseTo(100);
    expect(back.y).toBeCloseTo(150);
  });

  it("applies origin and scale", () => {
    expect(docToCanvas(0, 0, view)).toEqual({ x: 50, y: 50 });
    expect(docToCanvas(10, 10, view)).toEqual({ x: 70, y: 70 });
  });
});
