"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { FormField } from "@/types/form";
import { Box, Grid, TextField, Typography } from "@mui/material";
import SortableFieldItem, { CANVAS_ID } from "./SortableFieldItem";

export { CANVAS_ID };

export interface FormCanvasProps {
  fields: FormField[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onChange: (id: string, patch: Partial<FormField>) => void;
  formTitle: string;
  onChangeFormTitle: (title: string) => void;
}

export default function FormCanvas({
  fields,
  selectedId,
  onSelect,
  onDelete,
  onChange,
  formTitle,
  onChangeFormTitle,
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
      <TextField
        aria-label="表單標題"
        fullWidth
        placeholder="表單標題"
        value={formTitle}
        onChange={(e) => onChangeFormTitle(e.target.value)}
        sx={{ mb: 2 }}
        variant="standard"
        required
      />
      {fields.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          從左側拖入欄位
        </Typography>
      ) : (
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <Grid container spacing={2}>
            {fields.map((field) => (
              <Grid size={field.span ?? 12} key={field.id}>
                <SortableFieldItem
                  field={field}
                  isSelected={selectedId === field.id}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onChange={onChange}
                />
              </Grid>
            ))}
          </Grid>
        </SortableContext>
      )}
    </Box>
  );
}
