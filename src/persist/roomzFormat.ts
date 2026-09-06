import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { validateDocument } from "../doc/document";
import type { RoomDoc } from "../doc/types";

// .roomz is a zip: project.json (required) + thumbnail.png (optional) + assets/**
// (user-imported models, SP3+). Bundled catalog pieces are referenced by id, never
// embedded, so a typical shared file stays small.
export const ROOMZ_PROJECT_ENTRY = "project.json";
export const ROOMZ_THUMBNAIL_ENTRY = "thumbnail.png";

const ALLOWED_EXTENSIONS = [".json", ".png", ".glb"];
const MAX_COMPRESSED_BYTES = 50 * 1024 * 1024;
const MAX_UNCOMPRESSED_BYTES = 200 * 1024 * 1024;
const MAX_ENTRIES = 2000;

export class RoomzDecodeError extends Error {}

export function encodeRoomz(doc: RoomDoc, thumbnailPng?: Uint8Array): Uint8Array {
  const files: Record<string, Uint8Array> = {
    [ROOMZ_PROJECT_ENTRY]: strToU8(JSON.stringify(doc)),
  };
  if (thumbnailPng) files[ROOMZ_THUMBNAIL_ENTRY] = thumbnailPng;
  return zipSync(files, { level: 6 });
}

/**
 * .roomz files are the one untrusted input this app handles (received from a
 * friend). Reject anything that looks like a zip-slip / zip-bomb / oversized
 * archive before trusting its contents, then validate project.json's shape
 * before any geometry gets constructed from it. Deeper adversarial coverage
 * (truncated archives, hostile nesting) lands with the SP4 hardened loader —
 * this is the baseline the format is designed not to outgrow.
 */
export function decodeRoomz(bytes: Uint8Array): { doc: RoomDoc; thumbnail?: Uint8Array } {
  if (bytes.byteLength > MAX_COMPRESSED_BYTES) {
    throw new RoomzDecodeError("Archive exceeds maximum compressed size");
  }

  let entries: Record<string, Uint8Array>;
  try {
    entries = unzipSync(bytes);
  } catch (err) {
    throw new RoomzDecodeError(`Malformed archive: ${(err as Error).message}`);
  }

  const names = Object.keys(entries);
  if (names.length > MAX_ENTRIES) {
    throw new RoomzDecodeError("Archive has too many entries");
  }

  for (const name of names) {
    if (name.includes("..") || name.startsWith("/") || name.startsWith("\\") || /^[a-zA-Z]:/.test(name)) {
      throw new RoomzDecodeError(`Unsafe entry path: ${name}`);
    }
    if (!ALLOWED_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext))) {
      throw new RoomzDecodeError(`Disallowed entry type: ${name}`);
    }
  }

  const totalUncompressed = Object.values(entries).reduce((sum, buf) => sum + buf.byteLength, 0);
  if (totalUncompressed > MAX_UNCOMPRESSED_BYTES) {
    throw new RoomzDecodeError("Archive expands beyond maximum uncompressed size");
  }

  const projectBytes = entries[ROOMZ_PROJECT_ENTRY];
  if (!projectBytes) {
    throw new RoomzDecodeError("Missing project.json");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(strFromU8(projectBytes));
  } catch (err) {
    throw new RoomzDecodeError(`Invalid project.json: ${(err as Error).message}`);
  }

  if (!validateDocument(parsed)) {
    throw new RoomzDecodeError("project.json failed schema validation");
  }

  return { doc: parsed, thumbnail: entries[ROOMZ_THUMBNAIL_ENTRY] };
}
