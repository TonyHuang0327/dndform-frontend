"use client";

import { useEffect, useRef, useState } from "react";
import { move } from "@dnd-kit/helpers";
import ComponentPalette from "@/components/ComponentPalette";
import FieldPropertyEditor from "@/components/FieldPropertyEditor";
import FormCanvas, { CANVAS_ID } from "@/components/FormCanvas";
import FormPreview from "@/components/FormPreview";
import {
  createField,
  createLayoutContainer,
  findFieldInItems,
  isCanvasItemId,
  isFormField,
  isLayoutContainer,
  isSameColumn,
  type CanvasItem,
  type FormField,
  type LayoutType,
} from "@/types/form";
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
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("design");
  const [formTitle, setFormTitle] = useState("未命名表單");

  function normalizeItemsWithColumnLabel(input: CanvasItem[]) {
    let hasChanged = false;
    const normalized = input.map((item) => {
      if (!isLayoutContainer(item)) return item;
      let columnChanged = false;
      const columns = item.columns.map((col) => {
        if (col.label != null) return col;
        columnChanged = true;
        hasChanged = true;
        return { ...col, label: "標題" };
      });
      if (!columnChanged) return item;
      return { ...item, columns };
    });
    return hasChanged ? normalized : input;
  }

  useEffect(() => {
    setItems((prev) => normalizeItemsWithColumnLabel(prev));
  }, []);

  // ── 巢狀查找與更新 ───────────────────────────────────────────

  function handleChange(id: string, patch: Partial<FormField>) {
    setItems((prev) =>
      prev.map((item) => {
        if (isFormField(item) && item.id === id) {
          return { ...item, ...patch } as FormField;
        }
        if (isLayoutContainer(item)) {
          return {
            ...item,
            columns: item.columns.map((col) => ({
              ...col,
              fields: col.fields.map((f) =>
                f.id === id ? ({ ...f, ...patch } as FormField) : f
              ),
            })),
          };
        }
        return item;
      })
    );
  }

  function handleDelete(id: string) {
    setItems((prev) =>
      prev
        .filter((item) => !(isFormField(item) && item.id === id))
        .filter((item) => !(isLayoutContainer(item) && item.id === id))
        .map((item) => {
          if (!isLayoutContainer(item)) return item;
          return {
            ...item,
            columns: item.columns.map((col) => ({
              ...col,
              fields: col.fields.filter((f) => f.id !== id),
            })),
          };
        })
    );
    setSelectedId((current) => (current === id ? null : current));
  }

  // ── 拖曳：判斷 column 是否為目標 ────────────────────────────

  function isColumnId(id: unknown): boolean {
    if (typeof id !== "string") return false;
    return items.some(
      (item) =>
        isLayoutContainer(item) && item.columns.some((col) => col.id === id)
    );
  }

  function insertFieldIntoColumn(columnId: string, field: FormField) {
    setItems((prev) =>
      prev.map((item) => {
        if (!isLayoutContainer(item)) return item;
        return {
          ...item,
          columns: item.columns.map((col) =>
            col.id === columnId
              ? { ...col, fields: [...col.fields, field] }
              : col
          ),
        };
      })
    );
  }

  // ── Drag Handlers ─────────────────────────────────────────────

  const handleDragEnd: DragDropEventHandlers["onDragEnd"] = (event) => {
    const { source, target } = event.operation;
    if (mode !== "design") return;
    if (!target) return;

    const data = source?.data as
      | { type?: FormField["type"]; layoutType?: LayoutType; source?: string }
      | undefined;

    if (data?.source === "palette") {
      // 版面容器拖入畫布
      if (data.layoutType) {
        const container = createLayoutContainer(data.layoutType);
        setItems((prev) => {
          const copy = [...prev];
          const insertIndex =
            target.id === CANVAS_ID
              ? copy.length
              : copy.findIndex((item) => item.id === target.id);
          const safeIndex = insertIndex === -1 ? copy.length : insertIndex;
          copy.splice(safeIndex, 0, container);
          return copy;
        });
        return;
      }

      // 表單欄位拖入畫布或容器格子
      if (data.type) {
        const fieldType = data.type;
        if (isColumnId(target.id)) {
          insertFieldIntoColumn(target.id as string, createField(fieldType));
        } else {
          setItems((prev) => {
            const copy = [...prev];
            const insertIndex =
              target.id === CANVAS_ID
                ? copy.length
                : copy.findIndex((item) => item.id === target.id);
            const safeIndex = insertIndex === -1 ? copy.length : insertIndex;
            copy.splice(safeIndex, 0, createField(fieldType));
            return copy;
          });
        }
      }
      return;
    }

    // 畫布內排序
    setItems((prev) => {
      if (!source?.id || !target?.id) return prev;

      // 同一 column 內排序
      if (isSameColumn(source.id as string, target.id as string, prev)) {
        const meta = findFieldInItems(source.id as string, prev);
        if (!meta?.columnId) return prev;
        const colId = meta.columnId;
        return prev.map((item) => {
          if (!isLayoutContainer(item)) return item;
          return {
            ...item,
            columns: item.columns.map((col) => {
              if (col.id !== colId) return col;
              return { ...col, fields: move(col.fields, event) };
            }),
          };
        });
      }

      // 頂層 CanvasItem 排序
      if (!isCanvasItemId(source.id, prev)) return prev;
      if (!(target.id === CANVAS_ID || isCanvasItemId(target.id, prev)))
        return prev;
      return move(prev, event);
    });
  };

  const handleDragOver: DragDropEventHandlers["onDragOver"] = (event) => {
    const { source, target } = event.operation;
    if (mode !== "design") return;
    if (!target) return;
    if (source?.id === target.id) return;

    const data = source?.data as { source?: string } | undefined;
    if (data?.source === "palette") return;

    setItems((prev) => {
      if (!source?.id || !target?.id) return prev;

      // 同一 column 內即時排序
      if (isSameColumn(source.id as string, target.id as string, prev)) {
        const meta = findFieldInItems(source.id as string, prev);
        if (!meta?.columnId) return prev;
        const colId = meta.columnId;
        return prev.map((item) => {
          if (!isLayoutContainer(item)) return item;
          return {
            ...item,
            columns: item.columns.map((col) => {
              if (col.id !== colId) return col;
              return { ...col, fields: move(col.fields, event) };
            }),
          };
        });
      }

      // 頂層即時排序
      if (!isCanvasItemId(source.id, prev)) return prev;
      if (!(target.id === CANVAS_ID || isCanvasItemId(target.id, prev)))
        return prev;
      return move(prev, event);
    });
  };

  // ── Print ────────────────────────────────────────────────────

  const previewRef = useRef<HTMLDivElement>(null);
  const handlePrintPreview = useReactToPrint({
    contentRef: previewRef,
    documentTitle: "form-preview",
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 0;
      }
    `,
  });

  // ── Render ───────────────────────────────────────────────────

  const selectedField = selectedId
    ? findFieldInItems(selectedId, items)?.field ?? null
    : null;

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
                items={items}
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
              {selectedField && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <FieldPropertyEditor
                    field={selectedField}
                    onChange={handleChange}
                  />
                </Paper>
              )}
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
              disabled={items.length === 0}
            >
              列印 / 儲存為PDF
            </Button>
          </Box>
          <div ref={previewRef}>
            <FormPreview items={items} formTitle={formTitle} />
          </div>
        </Box>
      )}
    </Box>
  );
}
