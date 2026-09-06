import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// The document model, geometry engine, command stack and catalog must stay
// headless — no three.js, React or Tauri import — so they can run under
// Vitest without a DOM or a Tauri runtime, and so render3d/plan2d/persist
// stay strictly downstream consumers rather than sources of truth.
const HEADLESS_DIRS = ["doc", "geometry", "commands", "catalog"];
const BANNED = [/from ["']three["']/, /from ["']react/, /from ["']@tauri-apps/];

function collectTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectTsFiles(full));
    } else if (full.endsWith(".ts") && !full.endsWith(".test.ts")) {
      out.push(full);
    }
  }
  return out;
}

describe("headless boundary", () => {
  for (const dirName of HEADLESS_DIRS) {
    it(`src/${dirName} imports no three/react/@tauri-apps`, () => {
      const dir = join(__dirname, dirName);
      const files = collectTsFiles(dir);
      expect(files.length).toBeGreaterThan(0);
      for (const file of files) {
        const content = readFileSync(file, "utf-8");
        for (const pattern of BANNED) {
          expect(pattern.test(content), `${file} matched ${pattern}`).toBe(false);
        }
      }
    });
  }
});
