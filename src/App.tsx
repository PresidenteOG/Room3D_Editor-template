import { useEffect } from "react";
import { useDocumentStore } from "./store/documentStore";
import Scene3D from "./render3d/Scene3D";
import FloorPlanCanvas from "./plan2d/FloorPlanCanvas";
import Toolbar from "./ui/Toolbar";
import NewRoomForm from "./ui/NewRoomForm";
import Inspector from "./ui/Inspector";

function isEditableTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export default function App() {
  const undo = useDocumentStore((s) => s.undo);
  const redo = useDocumentStore((s) => s.redo);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target) || !e.ctrlKey || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <Toolbar />
      <div style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}>
        <NewRoomForm />
      </div>
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <div style={{ flex: 1, borderRight: "1px solid #ddd" }}>
          <FloorPlanCanvas />
        </div>
        <div style={{ flex: 1 }}>
          <Scene3D />
        </div>
        <div style={{ width: "260px", borderLeft: "1px solid #ddd" }}>
          <Inspector />
        </div>
      </div>
    </div>
  );
}
