import { useState } from "react";
import { useDocumentStore } from "../store/documentStore";
import { createRectangularRoomCommand } from "../commands/roomCommands";
import { seedStarterFurnitureCommands } from "../commands/seed";

export default function NewRoomForm() {
  const dispatch = useDocumentStore((s) => s.dispatch);
  const [width, setWidth] = useState(400);
  const [depth, setDepth] = useState(300);
  const [height, setHeight] = useState(260);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createRectangularRoomCommand(width, depth, height));
    for (const command of seedStarterFurnitureCommands(width, depth)) {
      dispatch(command);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem", alignItems: "end" }}>
      <label>
        Width (cm)
        <input
          type="number"
          min={100}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
        />
      </label>
      <label>
        Depth (cm)
        <input
          type="number"
          min={100}
          value={depth}
          onChange={(e) => setDepth(Number(e.target.value))}
        />
      </label>
      <label>
        Height (cm)
        <input
          type="number"
          min={150}
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
        />
      </label>
      <button type="submit">New Room</button>
    </form>
  );
}
