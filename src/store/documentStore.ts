import { create } from "zustand";
import type { RoomDoc } from "../doc/types";
import type { Command } from "../commands/command";
import { emptyDocument } from "../doc/document";
import { UndoStack } from "./undoStack";

interface DocumentState {
  doc: RoomDoc;
  selectedId: string | null;
  canUndo: boolean;
  canRedo: boolean;
  dispatch: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  select: (id: string | null) => void;
  loadDocument: (doc: RoomDoc) => void;
}

const stack = new UndoStack();

export const useDocumentStore = create<DocumentState>((set, get) => ({
  doc: emptyDocument(),
  selectedId: null,
  canUndo: false,
  canRedo: false,
  dispatch: (command) => {
    const next = stack.execute(get().doc, command);
    set({ doc: next, canUndo: stack.canUndo(), canRedo: stack.canRedo() });
  },
  undo: () => {
    const next = stack.undo(get().doc);
    if (next) set({ doc: next, canUndo: stack.canUndo(), canRedo: stack.canRedo() });
  },
  redo: () => {
    const next = stack.redo(get().doc);
    if (next) set({ doc: next, canUndo: stack.canUndo(), canRedo: stack.canRedo() });
  },
  select: (id) => set({ selectedId: id }),
  loadDocument: (doc) => {
    stack.clear();
    set({ doc, selectedId: null, canUndo: false, canRedo: false });
  },
}));
