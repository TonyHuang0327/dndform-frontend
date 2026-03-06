"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FormField } from "@/types/form";
import { Box, Card, Typography } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

const CANVAS_ID = "canvas";

export interface SortableFieldItemProps {
  field: FormField;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function SortableFieldItem({
  field,
  isSelected,
  onSelect,
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
      <Box
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
      </Box>
      {/* 卡片主體：點擊選取並顯示屬性編輯 */}
      <Box
        onClick={() => onSelect(field.id)}
        sx={{ flex: 1, cursor: "pointer" }}
      >
        <Typography variant="body2">{field.label}</Typography>
        <Typography variant="caption" color="text.secondary">
          {field.type}
        </Typography>
      </Box>
    </Card>
  );
}

export { CANVAS_ID };
