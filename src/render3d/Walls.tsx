import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { RoomGeometry } from "../doc/types";
import { docToThree, docRotationYToThree } from "../geometry/coords";
import { wallSegments, roomCenter } from "../geometry/room";

export default function Walls({ room }: { room: RoomGeometry }) {
  const { polygon, wallHeight, wallThickness } = room;
  const segments = useMemo(() => wallSegments(polygon), [polygon]);

  const wallRefs = useRef<(THREE.Mesh | null)[]>([]);
  const centerXZ = useMemo(() => {
    const c = docToThree(roomCenter(polygon).x, roomCenter(polygon).y, 0);
    return new THREE.Vector2(c.x, c.z);
  }, [polygon]);
  const mids = useMemo(
    () =>
      segments.map((seg) => {
        const p = docToThree((seg.start.x + seg.end.x) / 2, (seg.start.y + seg.end.y) / 2, 0);
        return new THREE.Vector2(p.x, p.z);
      }),
    [segments],
  );

  // Hide whichever walls the camera would be looking through from outside, so
  // the room reads as a cutaway instead of a closed box you cannot see into.
  // Standard room-planner behaviour; runs each rendered frame so it tracks orbit.
  const camXZ = useMemo(() => new THREE.Vector2(), []);
  const outward = useMemo(() => new THREE.Vector2(), []);
  const camToWall = useMemo(() => new THREE.Vector2(), []);
  useFrame(({ camera }) => {
    camXZ.set(camera.position.x, camera.position.z);
    for (let i = 0; i < mids.length; i++) {
      const mesh = wallRefs.current[i];
      if (!mesh) continue;
      outward.subVectors(mids[i], centerXZ); // room centre -> out through this wall
      camToWall.subVectors(camXZ, mids[i]);
      mesh.visible = camToWall.dot(outward) <= 0; // camera on the room-side of the wall
    }
  });

  return (
    <group>
      {segments.map((seg, i) => {
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
            ref={(m) => {
              wallRefs.current[i] = m;
            }}
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
