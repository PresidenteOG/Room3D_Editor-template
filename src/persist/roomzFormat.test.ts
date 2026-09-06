import { zipSync, strToU8 } from "fflate";
import { describe, expect, it } from "vitest";
import { emptyDocument } from "../doc/document";
import { decodeRoomz, encodeRoomz, RoomzDecodeError, ROOMZ_PROJECT_ENTRY } from "./roomzFormat";

describe("encodeRoomz / decodeRoomz round trip", () => {
  it("round-trips a document losslessly", () => {
    const doc = emptyDocument();
    const bytes = encodeRoomz(doc);
    const { doc: decoded } = decodeRoomz(bytes);
    expect(decoded).toEqual(doc);
  });

  it("round-trips a thumbnail alongside the document", () => {
    const doc = emptyDocument();
    const thumbnail = new Uint8Array([137, 80, 78, 71]); // PNG magic bytes, fake payload
    const bytes = encodeRoomz(doc, thumbnail);
    const { doc: decoded, thumbnail: decodedThumb } = decodeRoomz(bytes);
    expect(decoded).toEqual(doc);
    expect(decodedThumb).toEqual(thumbnail);
  });
});

describe("decodeRoomz validation", () => {
  it("rejects an archive missing project.json", () => {
    const bytes = zipSync({ "thumbnail.png": new Uint8Array([1, 2, 3]) });
    expect(() => decodeRoomz(bytes)).toThrow(RoomzDecodeError);
  });

  it("rejects malformed JSON in project.json", () => {
    const bytes = zipSync({ [ROOMZ_PROJECT_ENTRY]: strToU8("{not valid json") });
    expect(() => decodeRoomz(bytes)).toThrow(RoomzDecodeError);
  });

  it("rejects a project.json missing schemaVersion", () => {
    const doc = emptyDocument() as unknown as Record<string, unknown>;
    const { schemaVersion, ...withoutVersion } = doc;
    void schemaVersion;
    const bytes = zipSync({ [ROOMZ_PROJECT_ENTRY]: strToU8(JSON.stringify(withoutVersion)) });
    expect(() => decodeRoomz(bytes)).toThrow(RoomzDecodeError);
  });

  it("rejects non-finite numbers smuggled into project.json", () => {
    const doc = emptyDocument();
    const bad = { ...doc, room: { ...doc.room, wallHeight: "Infinity" } };
    // JSON has no Infinity literal, so simulate what a hand-crafted hostile file could contain:
    // a huge finite number is allowed, but a non-numeric wallHeight must be rejected.
    const bytes = zipSync({ [ROOMZ_PROJECT_ENTRY]: strToU8(JSON.stringify(bad)) });
    expect(() => decodeRoomz(bytes)).toThrow(RoomzDecodeError);
  });

  it("rejects a path-traversal entry name", () => {
    const doc = emptyDocument();
    const bytes = zipSync({
      [ROOMZ_PROJECT_ENTRY]: strToU8(JSON.stringify(doc)),
      "../../evil.json": strToU8("{}"),
    });
    expect(() => decodeRoomz(bytes)).toThrow(RoomzDecodeError);
  });

  it("rejects a disallowed entry extension", () => {
    const doc = emptyDocument();
    const bytes = zipSync({
      [ROOMZ_PROJECT_ENTRY]: strToU8(JSON.stringify(doc)),
      "payload.exe": strToU8("not actually an exe, but the extension alone must be rejected"),
    });
    expect(() => decodeRoomz(bytes)).toThrow(RoomzDecodeError);
  });

  it("rejects a corrupted archive", () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);
    expect(() => decodeRoomz(bytes)).toThrow(RoomzDecodeError);
  });
});
