"use client";

import { useRef, useState } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import ComponentPalette from "@/components/ComponentPalette";
import FieldPropertyEditor from "@/components/FieldPropertyEditor";
import FormCanvas, { CANVAS_ID } from "@/components/FormCanvas";
import FormPreview from "@/components/FormPreview";
import { createField } from "@/types/form";
import type { FormField } from "@/types/form";
import { Box, Button, Paper, Tab, Tabs } from "@mui/material";
import { useReactToPrint } from "react-to-print";

type Mode = "design" | "preview";

export default function FormBuilderContent() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("design");
  const [formTitle, setFormTitle] = useState("");

  function handleDragEnd(event: DragEndEvent) {
    if (mode !== "design") return;

    const { active, over } = event;
    if (!over) return;

    const data = active.data.current as
      | { type?: FormField["type"]; source?: string }
      | undefined;

    if (data?.source === "palette" && data?.type) {
      const insertIndex =
        over.id === CANVAS_ID
          ? fields.length
          : fields.findIndex((f) => f.id === over.id);
      const newField = createField(data.type);
      setFields((prev) => {
        const copy = [...prev];
        copy.splice(
          insertIndex === -1 ? copy.length : insertIndex,
          0,
          newField
        );
        return copy;
      });
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

  function handleDelete(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  }
  const previewRef = useRef<HTMLDivElement>(null);
  const handlePrintPreview = useReactToPrint({
    contentRef: previewRef,
    documentTitle: "form-preview",
  });

  return (
    <Box sx={{ minHeight: "100vh", p: 2, boxSizing: "border-box" }}>
      <Tabs
        value={mode}
        onChange={(_, value: Mode) => setMode(value)}
        aria-label="模式切換"
        sx={{ mb: 2 }}
      >
        <Tab label="設計" value="design" />
        <Tab label="預覽" value="preview" />
      </Tabs>

      {mode === "design" ? (
        <DndContext onDragEnd={handleDragEnd}>
          <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
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
              {selectedId &&
                (() => {
                  const selected = fields.find((f) => f.id === selectedId);
                  return selected ? (
                    <Paper sx={{ p: 2 }}>
                      <FieldPropertyEditor
                        field={selected}
                        onChange={handleChange}
                      />
                    </Paper>
                  ) : null;
                })()}
              <FormCanvas
                fields={fields}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onDelete={handleDelete}
                onChange={handleChange}
                formTitle={formTitle}
                onChangeFormTitle={setFormTitle}
              />
            </Box>
          </Box>
        </DndContext>
      ) : (
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handlePrintPreview()}
              disabled={fields.length === 0}
            >
              列印 / 儲存為PDF
            </Button>
          </Box>
          <div ref={previewRef}>
            <FormPreview fields={fields} formTitle={formTitle} />
          </div>
        </Box>
      )}
    </Box>
  );
}
