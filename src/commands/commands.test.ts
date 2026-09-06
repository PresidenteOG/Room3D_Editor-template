import { describe, expect, it } from "vitest";
import { emptyDocument } from "../doc/document";
import {
  addPlacementCommand,
  movePlacementCommand,
  removePlacementCommand,
  rotatePlacementCommand,
  scalePlacementCommand,
} from "./placementCommands";
import { createRectangularRoomCommand } from "./roomCommands";
import type { Placement } from "../doc/types";

const samplePlacement: Placement = {
  id: "p1",
  catalogId: "bed-single",
  x: 50,
  y: 50,
  elevation: 0,
  rotationY: 0,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
};

describe("apply -> invert -> apply identity", () => {
  it("holds for movePlacementCommand", () => {
    const doc = { ...emptyDocument(), placements: [samplePlacement] };
    const move = movePlacementCommand("p1", 10, -5, 2);

    const once = move.apply(doc);
    const inverse = move.invert(doc);
    const restored = inverse.apply(once);
    expect(restored).toEqual(doc);

    const twice = move.apply(restored);
    expect(twice).toEqual(once);
  });

  it("holds for rotatePlacementCommand", () => {
    const doc = { ...emptyDocument(), placements: [samplePlacement] };
    const rotate = rotatePlacementCommand("p1", Math.PI / 4);
    const once = rotate.apply(doc);
    const restored = rotate.invert(doc).apply(once);
    expect(restored).toEqual(doc);
  });

  it("holds for scalePlacementCommand", () => {
    const doc = { ...emptyDocument(), placements: [samplePlacement] };
    const scale = scalePlacementCommand("p1", 0.5, 0, 0.5);
    const once = scale.apply(doc);
    const restored = scale.invert(doc).apply(once);
    expect(restored).toEqual(doc);
  });

  it("holds for add/removePlacementCommand", () => {
    const doc = emptyDocument();
    const add = addPlacementCommand(samplePlacement);
    const withPlacement = add.apply(doc);
    expect(withPlacement.placements).toHaveLength(1);

    const remove = removePlacementCommand("p1");
    const removed = remove.apply(withPlacement);
    expect(removed.placements).toHaveLength(0);

    const reinserted = remove.invert(withPlacement).apply(removed);
    expect(reinserted).toEqual(withPlacement);
  });

  it("holds for createRectangularRoomCommand", () => {
    const doc = emptyDocument();
    const create = createRectangularRoomCommand(500, 400, 270);
    const once = create.apply(doc);
    const restored = create.invert(doc).apply(once);
    expect(restored).toEqual(doc);
  });
});
