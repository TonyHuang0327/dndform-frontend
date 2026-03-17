"use client";

import { useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FormField } from "@/types/form";
import { Box, ButtonBase, Card, IconButton, Typography } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteIcon from "@mui/icons-material/Delete";

const CANVAS_ID = "canvas";

export interface SortableFieldItemProps {
  field: FormField;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onChange: (id: string, patch: Partial<FormField>) => void;
}

export default function SortableFieldItem({
  field,
  isSelected,
  onSelect,
  onDelete,
  onChange,
}: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const span = field.span ?? 12;
  const dragStartXRef = useRef<number | null>(null);
  const dragStartSpanRef = useRef<number>(span);
  const moveHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const upHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: MouseEvent) {
    if (dragStartXRef.current == null) return;
    const deltaX = e.clientX - dragStartXRef.current;
    const stepWidth = (cardRef.current?.clientWidth ?? 100) / 12;
    const deltaSpan = Math.floor(deltaX / stepWidth);
    const base = dragStartSpanRef.current;
    const next = Math.min(12, Math.max(3, base + deltaSpan));
    onChange(field.id, { span: next });
  }

  function handleMouseUp() {
    dragStartXRef.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    moveHandlerRef.current = null;
    upHandlerRef.current = null;
  }

  function handleResizeMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    dragStartXRef.current = event.clientX;
    dragStartSpanRef.current = span;

    moveHandlerRef.current = handleMouseMove;
    upHandlerRef.current = handleMouseUp;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  // 保底清理：元件 unmount 時一定把 listener 拿掉
  useEffect(() => {
    return () => {
      if (moveHandlerRef.current) {
        window.removeEventListener("mousemove", moveHandlerRef.current);
      }
      if (upHandlerRef.current) {
        window.removeEventListener("mouseup", upHandlerRef.current);
      }
      dragStartXRef.current = null;
      dragStartSpanRef.current = span; // 或預設值
    };
  }, [span]);

  return (
    <Card
      ref={(node) => {
        setNodeRef(node);
        cardRef.current = node;
      }}
      style={style}
      sx={{
        p: 1.5,
        opacity: isDragging ? 0.5 : 1,
        border: 2,
        borderColor: isSelected ? "primary.main" : "transparent",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      {/* 拖拉把手：只有此區可拖動排序 */}
      <IconButton
        {...attributes}
        {...listeners}
        sx={{
          cursor: "grab",
          color: "text.secondary",
          "&:active": { cursor: "grabbing" },
        }}
        aria-label="拖動排序"
      >
        <DragIndicatorIcon fontSize="small" />
      </IconButton>
      {/* 卡片主體：點擊選取並顯示屬性編輯 */}
      <ButtonBase
        onClick={() => onSelect(field.id)}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          textAlign: "left",
        }}
      >
        <Typography variant="body2">{field.label}</Typography>
        <Typography variant="caption" color="text.secondary">
          {field.type}
        </Typography>
      </ButtonBase>
      {/* 刪除欄位 */}
      <IconButton
        size="small"
        onClick={() => onDelete(field.id)}
        aria-label="刪除欄位"
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
      {/* 右側拖拉把手：拖移改變 span 大小 */}
      <Box
        onMouseDown={handleResizeMouseDown}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight")
            onChange(field.id, { span: Math.min(12, span + 1) });
          if (e.key === "ArrowLeft")
            onChange(field.id, { span: Math.max(3, span - 1) });
        }}
        role="slider"
        tabIndex={0}
        aria-valuenow={span}
        aria-valuemin={3}
        aria-valuemax={12}
        sx={{
          ml: 1,
          alignSelf: "stretch",
          width: 8,
          cursor: "col-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderLeft: "1px solid",
          borderColor: "divider",
          "&::before": {
            content: '""',
            display: "block",
            width: 2,
            height: 20,
            bgcolor: "text.disabled",
          },
        }}
        aria-label="拖拉調整欄位寬度"
      />
    </Card>
  );
}

export { CANVAS_ID };
