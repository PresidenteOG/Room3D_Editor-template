import { useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { useDocumentStore } from "../store/documentStore";
import { docToThree } from "../geometry/coords";
import { roomCenter } from "../geometry/room";
import Walls from "./Walls";
import SelectableFurniture from "./SelectableFurniture";

export default function Scene3D() {
  const doc = useDocumentStore((s) => s.doc);
  const select = useDocumentStore((s) => s.select);
  // drei's OrbitControls ref type (OrbitControlsImpl from three-stdlib) isn't
  // worth importing just to read/write `.enabled`; `any` is the pragmatic fit.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orbitRef = useRef<any>(null);

  const target = useMemo(() => {
    const c = roomCenter(doc.room.polygon);
    const t = docToThree(c.x, c.y, doc.room.wallHeight * 0.3);
    return [t.x, t.y, t.z] as [number, number, number];
  }, [doc.room.polygon, doc.room.wallHeight]);

  return (
    <Canvas
      frameloop="demand"
      shadows
      camera={{ position: [target[0] + 500, 500, target[2] + 700], fov: 45, near: 1, far: 8000 }}
      onPointerMissed={() => select(null)}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[400, 600, 300]} intensity={0.9} castShadow />
      <Environment preset="apartment" />
      <Walls room={doc.room} />
      {doc.placements.map((p) => (
        <SelectableFurniture key={p.id} placement={p} orbitRef={orbitRef} />
      ))}
      <OrbitControls ref={orbitRef} makeDefault target={target} />
    </Canvas>
  );
}
