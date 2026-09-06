import { useDocumentStore } from "../store/documentStore";
import { getCatalogEntry } from "../catalog/catalog";
import {
  movePlacementCommand,
  rotatePlacementCommand,
  scalePlacementCommand,
} from "../commands/placementCommands";

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

export default function Inspector() {
  const selectedId = useDocumentStore((s) => s.selectedId);
  const placement = useDocumentStore((s) => s.doc.placements.find((p) => p.id === selectedId));
  const dispatch = useDocumentStore((s) => s.dispatch);

  if (!placement) {
    return (
      <aside style={{ padding: "0.75rem", color: "#777" }}>
        <p>Select a piece of furniture to edit it.</p>
      </aside>
    );
  }

  const entry = getCatalogEntry(placement.catalogId);

  const field = (
    label: string,
    value: number,
    onCommit: (next: number) => void,
    step = 1,
  ) => (
    <label style={{ display: "block", marginBottom: "0.4rem" }}>
      {label}
      <input
        type="number"
        step={step}
        value={Number.isFinite(value) ? Math.round(value * 100) / 100 : 0}
        onChange={(e) => onCommit(Number(e.target.value))}
        style={{ width: "100%" }}
      />
    </label>
  );

  return (
    <aside style={{ padding: "0.75rem" }}>
      <h3 style={{ marginTop: 0 }}>{entry?.name ?? placement.catalogId}</h3>
      {field("X (cm)", placement.x, (next) =>
        dispatch(movePlacementCommand(placement.id, next - placement.x, 0, 0)),
      )}
      {field("Y (cm)", placement.y, (next) =>
        dispatch(movePlacementCommand(placement.id, 0, next - placement.y, 0)),
      )}
      {field("Elevation (cm)", placement.elevation, (next) =>
        dispatch(movePlacementCommand(placement.id, 0, 0, next - placement.elevation)),
      )}
      {field("Rotation (deg)", placement.rotationY * RAD_TO_DEG, (next) =>
        dispatch(
          rotatePlacementCommand(placement.id, next * DEG_TO_RAD - placement.rotationY),
        ),
      )}
      {field(
        "Scale X",
        placement.scaleX,
        (next) => dispatch(scalePlacementCommand(placement.id, next - placement.scaleX, 0, 0)),
        0.1,
      )}
      {field(
        "Scale Y",
        placement.scaleY,
        (next) => dispatch(scalePlacementCommand(placement.id, 0, next - placement.scaleY, 0)),
        0.1,
      )}
      {field(
        "Scale Z",
        placement.scaleZ,
        (next) => dispatch(scalePlacementCommand(placement.id, 0, 0, next - placement.scaleZ)),
        0.1,
      )}
    </aside>
  );
}
