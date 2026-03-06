"use client";

import { useState } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import ComponentPalette from "@/components/ComponentPalette";
import FieldPropertyEditor from "@/components/FieldPropertyEditor";
import FormCanvas, { CANVAS_ID } from "@/components/FormCanvas";
import { createField } from "@/types/form";
import type { FormField } from "@/types/form";
import { Box, Paper } from "@mui/material";

export default function FormBuilderContent() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const data = active.data.current as
      | { type?: FormField["type"]; source?: string }
      | undefined;

    if (data?.source === "palette" && data?.type) {
      setFields((prev) => [...prev, createField(data.type!)]);
      return;
    }

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    if (oldIndex === -1) return;

    const newIndex =
      over.id === CANVAS_ID
        ? fields.length
        : fields.findIndex((f) => f.id === over.id);
    if (newIndex === -1) return;

    setFields((prev) => arrayMove(prev, oldIndex, newIndex));
  }

  function handleChange(id: string, patch: Partial<FormField>) {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? ({ ...f, ...patch } as FormField) : f))
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Box sx={{ display: "flex", minHeight: "100vh", p: 2 }}>
        <ComponentPalette />
        <Box
          sx={{
            flex: 1,
            ml: 2,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {selectedId && (() => {
            const selected = fields.find((f) => f.id === selectedId);
            return selected ? (
              <Paper sx={{ p: 2 }}>
                <FieldPropertyEditor field={selected} onChange={handleChange} />
              </Paper>
            ) : null;
          })()}
          <FormCanvas
            fields={fields}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChange={handleChange}
          />
        </Box>
      </Box>
    </DndContext>
  );
}
