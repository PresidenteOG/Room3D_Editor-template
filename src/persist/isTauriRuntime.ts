/** True inside the packaged Tauri window, false in the plain Vite dev server
 * (the Browser pane can only run the latter — see CLAUDE.md testing notes). */
export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}
