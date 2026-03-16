"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FormField } from "@/types/form";
import { ButtonBase, Card, IconButton, Typography } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteIcon from "@mui/icons-material/Delete";

const CANVAS_ID = "canvas";

export interface SortableFieldItemProps {
  field: FormField;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SortableFieldItem({
  field,
  isSelected,
  onSelect,
  onDelete,
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

  return (
    <Card
      ref={setNodeRef}
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
    </Card>
  );
}

export { CANVAS_ID };
