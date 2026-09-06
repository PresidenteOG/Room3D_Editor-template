import { describe, expect, it } from "vitest";
import { emptyDocument } from "../doc/document";
import { movePlacementCommand } from "../commands/placementCommands";
import { UndoStack } from "./undoStack";
import type { RoomDoc } from "../doc/types";

describe("UndoStack over a 10-command sequence", () => {
  it("undoes back to the original document and redoes back to the final one", () => {
    const original: RoomDoc = {
      ...emptyDocument(),
      placements: [
        {
          id: "p1",
          catalogId: "bed-single",
          x: 0,
          y: 0,
          elevation: 0,
          rotationY: 0,
          scaleX: 1,
          scaleY: 1,
          scaleZ: 1,
        },
      ],
    };

    const stack = new UndoStack();
    let doc = original;
    for (let i = 0; i < 10; i++) {
      doc = stack.execute(doc, movePlacementCommand("p1", 1, 1, 0));
    }
    const finalDoc = doc;
    expect(finalDoc.placements[0].x).toBe(10);
    expect(finalDoc.placements[0].y).toBe(10);

    for (let i = 0; i < 10; i++) {
      const undone = stack.undo(doc);
      expect(undone).not.toBeNull();
      doc = undone!;
    }
    expect(doc).toEqual(original);
    expect(stack.undo(doc)).toBeNull();

    for (let i = 0; i < 10; i++) {
      const redone = stack.redo(doc);
      expect(redone).not.toBeNull();
      doc = redone!;
    }
    expect(doc).toEqual(finalDoc);
    expect(stack.redo(doc)).toBeNull();
  });

  it("clears the redo stack on a new dispatch after an undo", () => {
    const stack = new UndoStack();
    let doc: RoomDoc = {
      ...emptyDocument(),
      placements: [
        {
          id: "p1",
          catalogId: "bed-single",
          x: 0,
          y: 0,
          elevation: 0,
          rotationY: 0,
          scaleX: 1,
          scaleY: 1,
          scaleZ: 1,
        },
      ],
    };
    doc = stack.execute(doc, movePlacementCommand("p1", 5, 0, 0));
    doc = stack.undo(doc)!;
    expect(stack.canRedo()).toBe(true);
    doc = stack.execute(doc, movePlacementCommand("p1", 3, 0, 0));
    expect(stack.canRedo()).toBe(false);
  });
});
