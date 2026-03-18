"use client";

import type { FormField } from "@/types/form";
import { Box, Grid, TextField, Typography } from "@mui/material";
import SortableFieldItem, { CANVAS_ID } from "./SortableFieldItem";
import { useDroppable } from "@dnd-kit/react";

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
  const { ref, isDropTarget } = useDroppable({ id: CANVAS_ID });

  return (
    <Box
      ref={ref}
      sx={{
        flex: 1,
        minHeight: 200,
        p: 2,
        borderRadius: 1,
        bgcolor: isDropTarget ? "action.hover" : "background.paper",
        border: "1px dashed",
        borderColor: isDropTarget ? "primary.main" : "divider",
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
        <Grid container spacing={2}>
          {fields.map((field, index) => (
            <Grid size={field.span ?? 12} key={field.id}>
              <SortableFieldItem
                field={field}
                index={index}
                isSelected={selectedId === field.id}
                onSelect={onSelect}
                onDelete={onDelete}
                onChange={onChange}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
