import { useMemo } from "react";
import * as THREE from "three";
import type { RoomGeometry } from "../doc/types";
import { docToThree, docRotationYToThree } from "../geometry/coords";
import { wallSegments } from "../geometry/room";

export default function Walls({ room }: { room: RoomGeometry }) {
  const { polygon, wallHeight, wallThickness } = room;
  const segments = useMemo(() => wallSegments(polygon), [polygon]);

  return (
    <group>
      {segments.map((seg) => {
        const dx = seg.end.x - seg.start.x;
        const dy = seg.end.y - seg.start.y;
        const length = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const midX = (seg.start.x + seg.end.x) / 2;
        const midY = (seg.start.y + seg.end.y) / 2;
        const pos = docToThree(midX, midY, wallHeight / 2);
        return (
          <mesh
            key={seg.edgeIndex}
            position={[pos.x, pos.y, pos.z]}
            rotation={[0, docRotationYToThree(angle), 0]}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[length, wallHeight, wallThickness]} />
            <meshStandardMaterial color="#d8d3c8" />
          </mesh>
        );
      })}
      <Floor polygon={polygon} />
    </group>
  );
}

function Floor({ polygon }: { polygon: RoomGeometry["polygon"] }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    polygon.forEach((p, i) => {
      if (i === 0) s.moveTo(p.x, p.y);
      else s.lineTo(p.x, p.y);
    });
    s.closePath();
    return s;
  }, [polygon]);

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color="#c9c2b3" side={THREE.DoubleSide} />
    </mesh>
  );
}
