"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { move } from "@dnd-kit/helpers";
import ComponentPalette from "@/components/ComponentPalette";
import FieldPropertyEditor from "@/components/FieldPropertyEditor";
import FormCanvas, { CANVAS_ID } from "@/components/FormCanvas";
import FormPreview from "@/components/FormPreview";
import {
  buildTemplateV1,
  getMaxTemplateFileSizeBytes,
  parseTemplateJson,
  serializeTemplate,
  TemplateIOError,
  validateAndNormalizeTemplate,
} from "@/features/template-io/templateIO";
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
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  IconButton,
  Paper,
  Snackbar,
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
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<{
    open: boolean;
    severity: "success" | "error" | "warning";
    message: string;
  }>({
    open: false,
    severity: "success",
    message: "",
  });

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
        const normalizedLabel =
          col.label != null
            ? col.label
            : normalizedVariant === "plain"
            ? ""
            : "標題";
        const rebalancedFields = rebalanceColumnFieldSpans(col.fields);
        const fieldSpanChanged = col.fields.some(
          (field, index) => field.span !== rebalancedFields[index]?.span
        );
        const labelChanged = col.label !== normalizedLabel;

        if (!fieldSpanChanged && !labelChanged) return col;
        columnChanged = true;
        hasChanged = true;
        return {
          ...col,
          label: normalizedLabel,
          fields: rebalancedFields,
        };
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

  function rebalanceColumnFieldSpans(fields: FormField[]): FormField[] {
    const count = fields.length;
    if (count === 0) return fields;

    const base = Math.floor(12 / count);
    const remainder = 12 % count;

    return fields.map((field, index) => ({
      ...field,
      span: Math.max(1, base + (index < remainder ? 1 : 0)),
    }));
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
              fields: rebalanceColumnFieldSpans(
                col.fields.filter((f) => f.id !== id)
              ),
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
              ? {
                  ...col,
                  fields: rebalanceColumnFieldSpans([...col.fields, field]),
                }
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
    if (!(target.id === CANVAS_ID || isCanvasItemId(target.id, prev)))
      return prev;
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
  const importInputRef = useRef<HTMLInputElement>(null);
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

  function setFeedbackMessage(
    severity: "success" | "error" | "warning",
    message: string
  ) {
    setFeedback({ open: true, severity, message });
  }

  function buildExportFilename() {
    const now = new Date();
    const pad2 = (value: number) => String(value).padStart(2, "0");
    const stamp = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(
      now.getDate()
    )}-${pad2(now.getHours())}${pad2(now.getMinutes())}${pad2(
      now.getSeconds()
    )}`;
    return `form-template-${stamp}.json`;
  }

  function handleExportTemplate() {
    try {
      const template = buildTemplateV1(formTitle, items);
      const content = serializeTemplate(template);
      const blob = new Blob([content], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = buildExportFilename();
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      setFeedbackMessage("success", "JSON 匯出成功");
    } catch (error) {
      console.error(error);
      setFeedbackMessage("error", "匯出失敗，請稍後重試");
    }
  }

  function handleSelectImportFile() {
    if (!importInputRef.current) return;
    importInputRef.current.value = "";
    importInputRef.current.click();
  }

  async function applyImportFile(file: File) {
    if (file.size > getMaxTemplateFileSizeBytes()) {
      setFeedbackMessage("error", "範本內容過大，請拆分後再匯入");
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseTemplateJson(text);
      const { template, warnings } = validateAndNormalizeTemplate(parsed);
      setFormTitle(template.formTitle);
      setItemsNormalized(template.items);
      setSelectedId(null);
      setMode("design");
      if (warnings.length > 0) {
        setFeedbackMessage("warning", "匯入成功，部分欄位已自動修正");
        return;
      }
      setFeedbackMessage("success", "匯入成功");
    } catch (error) {
      if (error instanceof TemplateIOError) {
        setFeedbackMessage("error", error.message);
        return;
      }
      setFeedbackMessage("error", "匯入失敗，請稍後重試");
    }
  }

  async function handleImportInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (items.length > 0) {
      setPendingImportFile(file);
      setImportConfirmOpen(true);
      return;
    }
    await applyImportFile(file);
  }

  function handleConfirmImportCancel() {
    setImportConfirmOpen(false);
    setPendingImportFile(null);
  }

  async function handleConfirmImportApply() {
    const file = pendingImportFile;
    setImportConfirmOpen(false);
    setPendingImportFile(null);
    if (!file) return;
    await applyImportFile(file);
  }

  // ── Render ───────────────────────────────────────────────────

  const selectedField = selectedId
    ? findFieldInItems(selectedId, items)?.field ?? null
    : null;

  return (
    <Box sx={{ minHeight: "100vh", boxSizing: "border-box", p: 2 }}>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        {mode === "design" && (
          <Stack direction="row" spacing={1} sx={{ mr: 1 }}>
            <Button variant="outlined" onClick={handleExportTemplate}>
              匯出 JSON
            </Button>
            <Button variant="outlined" onClick={handleSelectImportFile}>
              匯入 JSON
            </Button>
          </Stack>
        )}
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
              onChange={(_, value: PreviewMode) => {
                if (value === "document" || value === "interactive") {
                  setPreviewMode(value);
                }
              }}
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

      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: "none" }}
        onChange={handleImportInputChange}
      />

      <Dialog open={importConfirmOpen} onClose={handleConfirmImportCancel}>
        <DialogTitle>覆蓋目前表單？</DialogTitle>
        <DialogContent>
          <DialogContentText>
            匯入 JSON 會覆蓋目前畫布內容，是否繼續？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmImportCancel}>取消</Button>
          <Button variant="contained" onClick={handleConfirmImportApply}>
            確認匯入
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={feedback.open}
        autoHideDuration={2600}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={feedback.severity}
          variant="filled"
          onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
