import type { RoomGeometry } from "../doc/types";
import { rectangleRoom } from "../geometry/room";
import { makeCommand, type Command } from "./command";

export function replaceRoomCommand(room: RoomGeometry): Command {
  return makeCommand(
    "replace room",
    (doc) => ({ ...doc, room }),
    (preDoc) => replaceRoomCommand(preDoc.room),
  );
}

export function createRectangularRoomCommand(
  width: number,
  depth: number,
  wallHeight: number,
  wallThickness = 10,
): Command {
  const room = rectangleRoom(width, depth, wallHeight, wallThickness);
  return makeCommand(
    "create rectangular room",
    (doc) => ({ ...doc, room }),
    (preDoc) => replaceRoomCommand(preDoc.room),
  );
}
