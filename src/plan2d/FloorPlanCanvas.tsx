import { useCallback, useEffect, useRef, useState } from "react";
import { useDocumentStore } from "../store/documentStore";
import { getCatalogEntry } from "../catalog/catalog";
import { footprintCorners } from "../geometry/placement";
import { pointInPolygon } from "../geometry/room";
import { canvasToDoc, docToCanvas, type CanvasView } from "../geometry/coords";
import { movePlacementCommand } from "../commands/placementCommands";
import type { Point2 } from "../doc/types";

const PADDING_CM = 60;

function computeView(polygon: Point2[], widthPx: number, heightPx: number): CanvasView {
  const xs = polygon.map((p) => p.x);
  const ys = polygon.map((p) => p.y);
  const minX = Math.min(...xs) - PADDING_CM;
  const maxX = Math.max(...xs) + PADDING_CM;
  const minY = Math.min(...ys) - PADDING_CM;
  const maxY = Math.max(...ys) + PADDING_CM;
  const roomW = Math.max(maxX - minX, 1);
  const roomH = Math.max(maxY - minY, 1);
  const scale = widthPx > 0 && heightPx > 0 ? Math.min(widthPx / roomW, heightPx / roomH) : 1;
  const originX = (widthPx - roomW * scale) / 2 - minX * scale;
  const originY = (heightPx - roomH * scale) / 2 - minY * scale;
  return { originX, originY, scale };
}

interface DragPreview {
  id: string;
  dx: number;
  dy: number;
}

export default function FloorPlanCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<CanvasView>({ originX: 0, originY: 0, scale: 1 });
  const dragRef = useRef<{ id: string; grabOffsetX: number; grabOffsetY: number } | null>(null);

  const doc = useDocumentStore((s) => s.doc);
  const selectedId = useDocumentStore((s) => s.selectedId);
  const select = useDocumentStore((s) => s.select);
  const dispatch = useDocumentStore((s) => s.dispatch);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const widthPx = container.clientWidth;
    const heightPx = container.clientHeight;
    canvas.width = Math.max(1, Math.floor(widthPx * dpr));
    canvas.height = Math.max(1, Math.floor(heightPx * dpr));
    canvas.style.width = `${widthPx}px`;
    canvas.style.height = `${heightPx}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, widthPx, heightPx);

    const view = computeView(doc.room.polygon, widthPx, heightPx);
    viewRef.current = view;

    ctx.beginPath();
    doc.room.polygon.forEach((p, i) => {
      const c = docToCanvas(p.x, p.y, view);
      if (i === 0) ctx.moveTo(c.x, c.y);
      else ctx.lineTo(c.x, c.y);
    });
    ctx.closePath();
    ctx.fillStyle = "#f5f2ea";
    ctx.fill();
    ctx.lineWidth = Math.max(2, doc.room.wallThickness * view.scale);
    ctx.strokeStyle = "#8a8578";
    ctx.stroke();

    for (const placement of doc.placements) {
      const entry = getCatalogEntry(placement.catalogId);
      if (!entry) continue;
      const effective =
        dragPreview && dragPreview.id === placement.id
          ? { ...placement, x: placement.x + dragPreview.dx, y: placement.y + dragPreview.dy }
          : placement;
      const corners = footprintCorners(effective, entry.dimensions);
      ctx.beginPath();
      corners.forEach((c, i) => {
        const pc = docToCanvas(c.x, c.y, view);
        if (i === 0) ctx.moveTo(pc.x, pc.y);
        else ctx.lineTo(pc.x, pc.y);
      });
      ctx.closePath();
      ctx.fillStyle = selectedId === placement.id ? "#ffb703" : entry.color;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#33302a";
      ctx.stroke();
    }
  }, [doc, selectedId, dragPreview]);

  useEffect(() => {
    draw();
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => draw());
    observer.observe(container);
    return () => observer.disconnect();
  }, [draw]);

  const hitTest = (docPoint: Point2): string | null => {
    for (let i = doc.placements.length - 1; i >= 0; i--) {
      const placement = doc.placements[i];
      const entry = getCatalogEntry(placement.catalogId);
      if (!entry) continue;
      if (pointInPolygon(docPoint, footprintCorners(placement, entry.dimensions))) {
        return placement.id;
      }
    }
    return null;
  };

  const toDocPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point2 => {
    const rect = e.currentTarget.getBoundingClientRect();
    return canvasToDoc(e.clientX - rect.left, e.clientY - rect.top, viewRef.current);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const docPoint = toDocPoint(e);
    const hitId = hitTest(docPoint);
    select(hitId);
    if (hitId) {
      const placement = doc.placements.find((p) => p.id === hitId)!;
      dragRef.current = {
        id: hitId,
        grabOffsetX: docPoint.x - placement.x,
        grabOffsetY: docPoint.y - placement.y,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const placement = doc.placements.find((p) => p.id === drag.id);
    if (!placement) return;
    const docPoint = toDocPoint(e);
    const intendedX = docPoint.x - drag.grabOffsetX;
    const intendedY = docPoint.y - drag.grabOffsetY;
    setDragPreview({ id: drag.id, dx: intendedX - placement.x, dy: intendedY - placement.y });
  };

  const handlePointerUp = () => {
    const drag = dragRef.current;
    if (drag && dragPreview && dragPreview.id === drag.id) {
      if (dragPreview.dx !== 0 || dragPreview.dy !== 0) {
        dispatch(movePlacementCommand(drag.id, dragPreview.dx, dragPreview.dy, 0));
      }
    }
    dragRef.current = null;
    setDragPreview(null);
  };

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ display: "block", touchAction: "none" }}
      />
    </div>
  );
}
