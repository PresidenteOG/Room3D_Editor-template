import { describe, expect, it } from "vitest";
import { emptyDocument, validateDocument } from "./document";

describe("emptyDocument", () => {
  it("produces a valid document", () => {
    expect(validateDocument(emptyDocument())).toBe(true);
  });

  it("round-trips losslessly through JSON", () => {
    const doc = emptyDocument();
    const roundTripped = JSON.parse(JSON.stringify(doc));
    expect(roundTripped).toEqual(doc);
    expect(validateDocument(roundTripped)).toBe(true);
  });
});

describe("validateDocument", () => {
  it("rejects a non-object", () => {
    expect(validateDocument(null)).toBe(false);
    expect(validateDocument("nope")).toBe(false);
  });

  it("rejects a polygon with fewer than 3 points", () => {
    const doc = emptyDocument();
    const bad = { ...doc, room: { ...doc.room, polygon: [{ x: 0, y: 0 }] } };
    expect(validateDocument(bad)).toBe(false);
  });

  it("rejects non-finite numbers", () => {
    const doc = emptyDocument();
    const bad = { ...doc, room: { ...doc.room, wallHeight: Infinity } };
    expect(validateDocument(bad)).toBe(false);
    const bad2 = { ...doc, room: { ...doc.room, wallHeight: NaN } };
    expect(validateDocument(bad2)).toBe(false);
  });

  it("rejects a placement missing required fields", () => {
    const doc = emptyDocument();
    const bad = {
      ...doc,
      placements: [{ id: "a", catalogId: "bed-single", x: 0, y: 0 }],
    };
    expect(validateDocument(bad)).toBe(false);
  });

  it("rejects a pathologically large polygon", () => {
    const doc = emptyDocument();
    const polygon = Array.from({ length: 500 }, (_, i) => ({ x: i, y: 0 }));
    const bad = { ...doc, room: { ...doc.room, polygon } };
    expect(validateDocument(bad)).toBe(false);
  });
});
