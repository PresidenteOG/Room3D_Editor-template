import { open, save } from "@tauri-apps/plugin-dialog";
import { readFile, writeFile } from "@tauri-apps/plugin-fs";
import { appDataDir, join as joinPath } from "@tauri-apps/api/path";
import { decodeRoomz, encodeRoomz, RoomzDecodeError } from "./roomzFormat";
import type { RoomDoc } from "../doc/types";

export { RoomzDecodeError };

const FILTERS = [{ name: "Room3D_Editor Project", extensions: ["roomz"] }];

/**
 * SP0 keeps both dialogs rooted at the app data directory so the default
 * `fs:allow-*-file` capability scope ($APPDATA/**) already covers every path
 * a user can reach without extra prompts. Picking an arbitrary location
 * (Desktop, a shared Drive folder) is what sharing actually needs and is a
 * deliberate SP4/row-9 follow-up, not an oversight — see
 * ClaudeFX/Planning/Room3D_Editor/SP0-dispatch.md.
 */
async function defaultRoomzPath(fileName = "room.roomz"): Promise<string> {
  const dir = await appDataDir();
  return joinPath(dir, fileName);
}

export async function saveRoomzDialog(doc: RoomDoc, thumbnailPng?: Uint8Array): Promise<string | null> {
  const defaultPath = await defaultRoomzPath();
  const path = await save({ filters: FILTERS, defaultPath });
  if (!path) return null;
  await writeFile(path, encodeRoomz(doc, thumbnailPng));
  return path;
}

export async function openRoomzDialog(): Promise<{ doc: RoomDoc; path: string } | null> {
  const defaultPath = await defaultRoomzPath();
  const path = await open({ filters: FILTERS, multiple: false, defaultPath });
  if (!path || Array.isArray(path)) return null;
  const bytes = await readFile(path);
  const { doc } = decodeRoomz(bytes);
  return { doc, path };
}
