import { useDocumentStore } from "../store/documentStore";
import { isTauriRuntime } from "../persist/isTauriRuntime";
import { openRoomzDialog, saveRoomzDialog } from "../persist/roomzIO";

export default function Toolbar() {
  const doc = useDocumentStore((s) => s.doc);
  const canUndo = useDocumentStore((s) => s.canUndo);
  const canRedo = useDocumentStore((s) => s.canRedo);
  const undo = useDocumentStore((s) => s.undo);
  const redo = useDocumentStore((s) => s.redo);
  const loadDocument = useDocumentStore((s) => s.loadDocument);

  const desktopOnly = !isTauriRuntime();

  const handleSave = async () => {
    if (desktopOnly) {
      window.alert("Save is only available in the packaged desktop app.");
      return;
    }
    await saveRoomzDialog(doc);
  };

  const handleOpen = async () => {
    if (desktopOnly) {
      window.alert("Open is only available in the packaged desktop app.");
      return;
    }
    const result = await openRoomzDialog();
    if (result) loadDocument(result.doc);
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", padding: "0.5rem", borderBottom: "1px solid #ddd" }}>
      <button onClick={handleOpen} title={desktopOnly ? "Desktop app only" : undefined}>
        Open
      </button>
      <button onClick={handleSave} title={desktopOnly ? "Desktop app only" : undefined}>
        Save
      </button>
      <button onClick={undo} disabled={!canUndo}>
        Undo
      </button>
      <button onClick={redo} disabled={!canRedo}>
        Redo
      </button>
    </div>
  );
}
