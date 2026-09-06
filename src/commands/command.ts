import type { RoomDoc } from "../doc/types";

export interface Command {
  readonly label: string;
  apply(doc: RoomDoc): RoomDoc;
  /**
   * Produce the command that undoes this one. Called with the document as it
   * was immediately BEFORE apply() runs, so commands that need to restore
   * removed data (e.g. deleting a placement) can capture it here instead of
   * snapshotting the whole document generically.
   */
  invert(preDoc: RoomDoc): Command;
}

export function makeCommand(
  label: string,
  apply: (doc: RoomDoc) => RoomDoc,
  invert: (preDoc: RoomDoc) => Command,
): Command {
  return { label, apply, invert };
}
