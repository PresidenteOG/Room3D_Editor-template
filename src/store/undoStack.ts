import type { RoomDoc } from "../doc/types";
import type { Command } from "../commands/command";

export class UndoStack {
  private undoList: Command[] = [];
  private redoList: Command[] = [];

  execute(doc: RoomDoc, command: Command): RoomDoc {
    const inverse = command.invert(doc);
    const next = command.apply(doc);
    this.undoList.push(inverse);
    this.redoList = [];
    return next;
  }

  undo(doc: RoomDoc): RoomDoc | null {
    const command = this.undoList.pop();
    if (!command) return null;
    const inverse = command.invert(doc);
    const next = command.apply(doc);
    this.redoList.push(inverse);
    return next;
  }

  redo(doc: RoomDoc): RoomDoc | null {
    const command = this.redoList.pop();
    if (!command) return null;
    const inverse = command.invert(doc);
    const next = command.apply(doc);
    this.undoList.push(inverse);
    return next;
  }

  canUndo(): boolean {
    return this.undoList.length > 0;
  }

  canRedo(): boolean {
    return this.redoList.length > 0;
  }

  clear(): void {
    this.undoList = [];
    this.redoList = [];
  }
}
