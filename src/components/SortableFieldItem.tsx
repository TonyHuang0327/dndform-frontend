"use client";

import { useEffect, useRef } from "react";
import type { FormField } from "@/types/form";
import {
  Box,
  ButtonBase,
  Card,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteIconOutlined from "@mui/icons-material/DeleteOutlined";
import { useSortable } from "@dnd-kit/react/sortable";
import { DEFAULT_LABELS } from "@/types/form";

const CANVAS_ID = "canvas";

export interface SortableFieldItemProps {
  field: FormField;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onChange: (id: string, patch: Partial<FormField>) => void;
  disableResize?: boolean; // 在容器格子內傳入 true 以停用右側 resize handle
}

export default function SortableFieldItem({
  field,
  index,
  isSelected,
  onSelect,
  onDelete,
  onChange,
  disableResize = false,
}: SortableFieldItemProps) {
  const { isDragging, ref, handleRef, sourceRef, targetRef } = useSortable({
    id: field.id,
    index,
  });
  const span = field.span ?? 12;
  const dragStartXRef = useRef<number | null>(null);
  const dragStartSpanRef = useRef<number>(span);
  const moveHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const upHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);

  function handleResizeMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    dragStartXRef.current = event.clientX;
    dragStartSpanRef.current = span;

    function handleMouseMove(e: MouseEvent) {
      if (dragStartXRef.current == null) return;
      const deltaX = e.clientX - dragStartXRef.current;
      const stepWidth = 100; // 每 100px 視為一格
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

    moveHandlerRef.current = handleMouseMove;
    upHandlerRef.current = handleMouseUp;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  useEffect(() => {
    return () => {
      if (moveHandlerRef.current) {
        window.removeEventListener("mousemove", moveHandlerRef.current);
      }
      if (upHandlerRef.current) {
        window.removeEventListener("mouseup", upHandlerRef.current);
      }
      dragStartXRef.current = null;
    };
  }, []);

  return (
    <Card
      ref={(node) => {
        ref(node);
        sourceRef(node);
        targetRef(node);
      }}
      sx={{
        p: 1,
        border: 2,
        borderColor: isSelected ? "primary.main" : "transparent",
        display: "flex",
        alignItems: "center",
        gap: 1,
        opacity: isDragging ? 0.6 : 1,
        width: "100%",
      }}
    >
      {/* 拖拉把手：只有此區可拖動排序 */}
      <IconButton
        ref={handleRef}
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
      {field.type === "labeled-input" ? (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <TextField
            value={field.label}
            onChange={(e) => onChange(field.id, { label: e.target.value })}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="標題方塊"
            variant="outlined"
            size="small"
            sx={{
              "& .MuiInputBase-input": {
                padding: "6px 8px",
              },
            }}
          />
        </Box>
      ) : (
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
          <Typography variant="body1">{DEFAULT_LABELS[field.type]}</Typography>
        </ButtonBase>
      )}
      {/* 刪除欄位 */}
      <IconButton
        size="small"
        color="error"
        onClick={() => onDelete(field.id)}
        aria-label="刪除欄位"
      >
        <DeleteIconOutlined fontSize="small" />
      </IconButton>
      {/* 右側拖拉把手：拖移改變 span 大小；容器格子內由 disableResize 停用 */}
      {!disableResize && (
        <Box
          onMouseDown={handleResizeMouseDown}
          sx={{
            ml: 1,
            alignSelf: "stretch",
            width: 8,
            cursor: "col-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "&::before": {
              content: '""',
              display: "block",
              width: 2,
              height: 20,
              bgcolor: "text.disabled",
            },
          }}
          role="slider"
          aria-orientation="vertical"
          aria-valuenow={span}
          aria-valuemin={3}
          aria-valuemax={12}
          aria-label="拖拉調整欄位寬度"
        />
      )}
    </Card>
  );
}

export { CANVAS_ID };
