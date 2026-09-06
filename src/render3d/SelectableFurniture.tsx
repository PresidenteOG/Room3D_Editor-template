import { useRef, useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import type * as THREE from "three";
import type { Placement } from "../doc/types";
import { getCatalogEntry } from "../catalog/catalog";
import { docRotationYToThree, docToThree, threeToDoc } from "../geometry/coords";
import { movePlacementCommand } from "../commands/placementCommands";
import { useDocumentStore } from "../store/documentStore";

interface Props {
  placement: Placement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orbitRef: React.RefObject<any>;
}

export default function SelectableFurniture({ placement, orbitRef }: Props) {
  const [mesh, setMesh] = useState<THREE.Mesh | null>(null);
  const selectedId = useDocumentStore((s) => s.selectedId);
  const select = useDocumentStore((s) => s.select);
  const dispatch = useDocumentStore((s) => s.dispatch);
  const dragStartBase = useRef<{ x: number; y: number; elevation: number } | null>(null);

  const entry = getCatalogEntry(placement.catalogId);
  if (!entry) return null;
  const dims = entry.dimensions;
  const isSelected = selectedId === placement.id;
  const centerElevation = placement.elevation + (dims.height * placement.scaleY) / 2;
  const pos = docToThree(placement.x, placement.y, centerElevation);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    select(placement.id);
  };

  const handleDragStart = () => {
    if (orbitRef.current) orbitRef.current.enabled = false;
    dragStartBase.current = {
      x: placement.x,
      y: placement.y,
      elevation: placement.elevation,
    };
  };

  const handleDragEnd = () => {
    if (orbitRef.current) orbitRef.current.enabled = true;
    if (!dragStartBase.current || !mesh) return;
    const { x: newX, y: newY, elevation: newCenterElevation } = threeToDoc(mesh.position);
    const newBaseElevation = newCenterElevation - (dims.height * placement.scaleY) / 2;
    const dx = newX - dragStartBase.current.x;
    const dy = newY - dragStartBase.current.y;
    const dElevation = newBaseElevation - dragStartBase.current.elevation;
    if (dx !== 0 || dy !== 0 || dElevation !== 0) {
      dispatch(movePlacementCommand(placement.id, dx, dy, dElevation));
    }
    dragStartBase.current = null;
  };

  return (
    <>
      <mesh
        ref={setMesh}
        position={[pos.x, pos.y, pos.z]}
        rotation={[0, docRotationYToThree(placement.rotationY), 0]}
        scale={[placement.scaleX, placement.scaleY, placement.scaleZ]}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[dims.width, dims.height, dims.depth]} />
        <meshStandardMaterial color={isSelected ? "#ffb703" : entry.color} />
      </mesh>
      {isSelected && mesh && (
        <TransformControls
          object={mesh}
          mode="translate"
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
        />
      )}
    </>
  );
}
