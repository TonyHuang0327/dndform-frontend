"use client";

import { useRef, useState } from "react";
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
  type LayoutVariant,
} from "@/types/form";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useReactToPrint } from "react-to-print";
import { DragDropProvider, type DragDropEventHandlers } from "@dnd-kit/react";
import CloseIcon from "@mui/icons-material/Close";

type Mode = "design" | "preview";
type PreviewMode = "document" | "interactive";
type DragEndEventArg = Parameters<
  NonNullable<DragDropEventHandlers["onDragEnd"]>
>[0];
type DragOverEventArg = Parameters<
  NonNullable<DragDropEventHandlers["onDragOver"]>
>[0];

export default function FormBuilderContent() {
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("design");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("document");
  const [formTitle, setFormTitle] = useState("未命名表單");

  function normalizeLayoutVariant(
    variant: LayoutVariant | undefined | null
  ): LayoutVariant {
    return variant === "plain" ? "plain" : "labeled";
  }

  function normalizeItemsWithContainerMeta(input: CanvasItem[]) {
    let hasChanged = false;
    const normalized = input.map((item) => {
      if (!isLayoutContainer(item)) return item;
      const normalizedVariant = normalizeLayoutVariant(item.variant);
      const variantChanged = item.variant !== normalizedVariant;
      let columnChanged = false;
      const columns = item.columns.map((col) => {
        if (col.label != null) return col;
        columnChanged = true;
        hasChanged = true;
        return { ...col, label: normalizedVariant === "plain" ? "" : "標題" };
      });
      if (!columnChanged && !variantChanged) return item;
      hasChanged = true;
      return { ...item, variant: normalizedVariant, columns };
    });
    return hasChanged ? normalized : input;
  }

  function setItemsNormalized(
    updater: CanvasItem[] | ((prev: CanvasItem[]) => CanvasItem[])
  ) {
    setItems((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return normalizeItemsWithContainerMeta(next);
    });
  }

  // ── 巢狀查找與更新 ───────────────────────────────────────────

  function handleChange(id: string, patch: Partial<FormField>) {
    setItemsNormalized((prev) =>
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
    setItemsNormalized((prev) =>
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

  function handleChangeColumnLabel(
    containerId: string,
    columnId: string,
    label: string
  ) {
    setItemsNormalized((prev) =>
      prev.map((item) => {
        if (!isLayoutContainer(item) || item.id !== containerId) return item;
        return {
          ...item,
          columns: item.columns.map((col) =>
            col.id === columnId ? { ...col, label } : col
          ),
        };
      })
    );
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
    setItemsNormalized((prev) =>
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

  function applyCanvasSort(
    prev: CanvasItem[],
    event: DragEndEventArg | DragOverEventArg
  ) {
    const { source, target } = event.operation;
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
    if (!(target.id === CANVAS_ID || isCanvasItemId(target.id, prev))) return prev;
    return move(prev, event);
  }

  // ── Drag Handlers ─────────────────────────────────────────────

  const handleDragEnd: DragDropEventHandlers["onDragEnd"] = (event) => {
    const { source, target } = event.operation;
    if (mode !== "design") return;
    if (!target) return;

    const data = source?.data as
      | {
          type?: FormField["type"];
          layoutType?: LayoutType;
          layoutVariant?: LayoutVariant;
          source?: string;
        }
      | undefined;

    if (data?.source === "palette") {
      // 版面容器拖入畫布
      if (data.layoutType) {
        const container = createLayoutContainer(
          data.layoutType,
          normalizeLayoutVariant(data.layoutVariant)
        );
        setItemsNormalized((prev) => {
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
          setItemsNormalized((prev) => {
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
    setItemsNormalized((prev) => applyCanvasSort(prev, event));
  };

  const handleDragOver: DragDropEventHandlers["onDragOver"] = (event) => {
    const { source, target } = event.operation;
    if (mode !== "design") return;
    if (!target) return;
    if (source?.id === target.id) return;

    const data = source?.data as { source?: string } | undefined;
    if (data?.source === "palette") return;

    setItemsNormalized((prev) => applyCanvasSort(prev, event));
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
                onChangeColumnLabel={handleChangeColumnLabel}
                formTitle={formTitle}
                onChangeFormTitle={setFormTitle}
              />
            </Box>
          </Box>

          <Drawer
            anchor="right"
            open={Boolean(selectedField)}
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
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Tabs
              value={previewMode}
              onChange={(_, value: PreviewMode) => setPreviewMode(value)}
              aria-label="預覽模式切換"
            >
              <Tab value="document" label="文件模式" />
              <Tab value="interactive" label="表單模式" />
            </Tabs>
            {previewMode === "document" && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => handlePrintPreview()}
                disabled={items.length === 0}
              >
                列印 / 儲存為PDF
              </Button>
            )}
          </Box>
          <div ref={previewRef}>
            <FormPreview
              items={items}
              formTitle={formTitle}
              previewMode={previewMode}
            />
          </div>
        </Box>
      )}
    </Box>
  );
}
