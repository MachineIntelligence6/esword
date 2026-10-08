"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clientApiHandlers from "@/client/handlers";
import { IBook } from "@/shared/types/models.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import definedMessages from "@/shared/constants/messages";

function SortableRow({ book, index }: { book: IBook; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: book.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-md border bg-background px-3 py-2 text-sm ${
        isDragging ? "z-10 shadow-lg" : ""
      }`}
    >
      <button
        type="button"
        aria-label={`Drag ${book.name}`}
        className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <span className="w-8 text-muted-foreground">{index + 1}</span>
      <span className="flex-1 font-medium">{book.name}</span>
    </li>
  );
}

export function BookReorderDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [books, setBooks] = useState<IBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    clientApiHandlers.books.get({ page: 1, perPage: -1 }).then((res) => {
      if (res.succeed && res.data) {
        // Same order as the reader sidebar: priority ascending, 0 last.
        const sorted = [...res.data].sort((a, b) => {
          if (a.priority === b.priority) return a.id - b.id;
          if (a.priority === 0) return 1;
          if (b.priority === 0) return -1;
          return a.priority - b.priority;
        });
        setBooks(sorted);
      }
      setLoading(false);
    });
  }, [open]);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setBooks((prev) =>
      arrayMove(
        prev,
        prev.findIndex((b) => b.id === active.id),
        prev.findIndex((b) => b.id === over.id)
      )
    );
  };

  const save = async () => {
    setSaving(true);
    const res = await clientApiHandlers.books.reorder(books.map((b) => b.id));
    setSaving(false);
    if (res.succeed) {
      toast({ title: "Order saved", description: "Book order updated." });
      onSaved();
      onOpenChange(false);
    } else {
      toast({
        title: "Could not save order",
        variant: "destructive",
        description: definedMessages.UNKNOWN_ERROR,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Reorder books</DialogTitle>
          <DialogDescription>
            Drag books into the order they should appear. Saving renumbers
            priorities 1, 2, 3…
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-1">
          {loading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={books.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-1.5">
                  {books.map((book, i) => (
                    <SortableRow key={book.id} book={book} index={i} />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || loading || books.length === 0}>
            {saving ? "Saving…" : "Save order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
