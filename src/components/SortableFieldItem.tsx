"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FormField } from "@/types/form";
import { Card, Typography } from "@mui/material";

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
      {...attributes}
      {...listeners}
      onClick={() => onSelect(field.id)}
      sx={{
        p: 1.5,
        cursor: "grab",
        opacity: isDragging ? 0.5 : 1,
        border: 2,
        borderColor: isSelected ? "primary.main" : "transparent",
        "&:active": { cursor: "grabbing" },
      }}
    >
      <Typography variant="body2">{field.label}</Typography>
      <Typography variant="caption" color="text.secondary">
        {field.type}
      </Typography>
    </Card>
  );
}

export { CANVAS_ID };
