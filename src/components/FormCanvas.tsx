"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { FormField } from "@/types/form";
import { Box, Typography } from "@mui/material";
import SortableFieldItem, { CANVAS_ID } from "./SortableFieldItem";

export { CANVAS_ID };

export interface FormCanvasProps {
  fields: FormField[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChange: (id: string, patch: Partial<FormField>) => void;
  onDelete: (id: string) => void;
}

export default function FormCanvas({
  fields,
  selectedId,
  onSelect,
  onDelete,
}: FormCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: CANVAS_ID });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        flex: 1,
        minHeight: 200,
        p: 2,
        borderRadius: 1,
        bgcolor: isOver ? "action.hover" : "background.paper",
        border: "1px dashed",
        borderColor: "divider",
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        畫布
      </Typography>
      {fields.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          從左側拖入欄位
        </Typography>
      ) : (
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {fields.map((field) => (
              <SortableFieldItem
                key={field.id}
                field={field}
                isSelected={selectedId === field.id}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            ))}
          </Box>
        </SortableContext>
      )}
    </Box>
  );
}
