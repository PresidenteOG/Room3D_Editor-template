import { describe, expect, it } from "vitest";
import { getCatalogEntry, PROCEDURAL_CATALOG } from "./catalog";

describe("PROCEDURAL_CATALOG", () => {
  it("has three seed pieces with positive dimensions", () => {
    expect(PROCEDURAL_CATALOG).toHaveLength(3);
    for (const entry of PROCEDURAL_CATALOG) {
      expect(entry.dimensions.width).toBeGreaterThan(0);
      expect(entry.dimensions.depth).toBeGreaterThan(0);
      expect(entry.dimensions.height).toBeGreaterThan(0);
    }
  });

  it("has unique ids", () => {
    const ids = new Set(PROCEDURAL_CATALOG.map((e) => e.id));
    expect(ids.size).toBe(PROCEDURAL_CATALOG.length);
  });
});

describe("getCatalogEntry", () => {
  it("finds a known entry", () => {
    expect(getCatalogEntry("bed-single")?.kind).toBe("bed");
  });

  it("returns undefined for an unknown id", () => {
    expect(getCatalogEntry("nonexistent")).toBeUndefined();
  });
});
