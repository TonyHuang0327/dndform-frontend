"use client";

import { useRef, useState } from "react";
import { move } from "@dnd-kit/helpers";
import ComponentPalette from "@/components/ComponentPalette";
import FieldPropertyEditor from "@/components/FieldPropertyEditor";
import FormCanvas, { CANVAS_ID } from "@/components/FormCanvas";
import FormPreview from "@/components/FormPreview";
import { createField } from "@/types/form";
import type { FormField } from "@/types/form";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useReactToPrint } from "react-to-print";
import { DragDropProvider, type DragDropEventHandlers } from "@dnd-kit/react";
import CloseIcon from "@mui/icons-material/Close";

type Mode = "design" | "preview";

export default function FormBuilderContent() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("design");
  const [formTitle, setFormTitle] = useState("未命名表單");

  function isFieldId(id: unknown, list: FormField[]) {
    return typeof id === "string" && list.some((f) => f.id === id);
  }

  const handleDragEnd: DragDropEventHandlers["onDragEnd"] = (event) => {
    const { source, target } = event.operation;
    if (mode !== "design") return;
    if (!target) return;

    const data = source?.data as
      | { type?: FormField["type"]; source?: string }
      | undefined;
    if (data?.source === "palette" && data?.type) {
      const fieldType = data.type;
      setFields((prev) => {
        const copy = [...prev];
        const insertIndex =
          target.id === CANVAS_ID
            ? copy.length
            : copy.findIndex((f) => f.id === target.id);
        const safeIndex = insertIndex === -1 ? copy.length : insertIndex;
        copy.splice(safeIndex, 0, createField(fieldType));
        return copy;
      });
    } else {
      setFields((prev) => {
        if (!isFieldId(source?.id, prev)) return prev;
        if (!(target.id === CANVAS_ID || isFieldId(target.id, prev)))
          return prev;
        return move(prev, event);
      });
    }
  };
  const handleDragOver: DragDropEventHandlers["onDragOver"] = (event) => {
    const { source, target } = event.operation;
    if (mode !== "design") return;
    if (!target) return;
    if (source?.id === target?.id) return;

    const data = source?.data as
      | { type?: FormField["type"]; source?: string }
      | undefined;
    // 從 palette 拖入時，不做即時排序；放開後由 onDragEnd 插入
    if (data?.source === "palette") return;

    setFields((prev) => {
      if (!isFieldId(source?.id, prev)) return prev;
      if (!(target.id === CANVAS_ID || isFieldId(target.id, prev))) return prev;
      return move(prev, event);
    });
  };

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
    <Box sx={{ minHeight: "100vh", boxSizing: "border-box", p: 2 }}>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => setMode(mode === "design" ? "preview" : "design")}
        >
          {mode === "design" ? "點擊預覽" : "回到設計"}
        </Button>
      </Stack>

      {mode === "design" ? (
        <DragDropProvider onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
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

          <Drawer
            anchor="right"
            open={Boolean(selectedId)}
            onClose={() => setSelectedId(null)}
          >
            <Box sx={{ width: 360, p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  欄位屬性
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setSelectedId(null)}
                  aria-label="關閉"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              {selectedId &&
                (() => {
                  const selected = fields.find((f) => f.id === selectedId);
                  return selected ? (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <FieldPropertyEditor
                        field={selected}
                        onChange={handleChange}
                      />
                    </Paper>
                  ) : null;
                })()}
            </Box>
          </Drawer>
        </DragDropProvider>
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
