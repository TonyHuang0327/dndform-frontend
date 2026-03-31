"use client";

import type { CanvasItem, FormField } from "@/types/form";
import { isLayoutContainer } from "@/types/form";
import { Box, Grid, TextField, Typography } from "@mui/material";
import SortableFieldItem, { CANVAS_ID } from "./SortableFieldItem";
import LayoutContainerItem from "./LayoutContainerItem";
import { useDroppable } from "@dnd-kit/react";

export { CANVAS_ID };

export interface FormCanvasProps {
  items: CanvasItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onChange: (id: string, patch: Partial<FormField>) => void;
  onChangeColumnLabel: (
    containerId: string,
    columnId: string,
    label: string
  ) => void;
  formTitle: string;
  onChangeFormTitle: (title: string) => void;
}

export default function FormCanvas({
  items,
  selectedId,
  onSelect,
  onDelete,
  onChange,
  onChangeColumnLabel,
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
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          從左側拖入欄位
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid
              size={isLayoutContainer(item) ? 12 : (item.span ?? 12)}
              key={item.id}
            >
              {isLayoutContainer(item) ? (
                <LayoutContainerItem
                  container={item}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onChange={onChange}
                  onChangeColumnLabel={onChangeColumnLabel}
                  index={index}
                />
              ) : (
                <SortableFieldItem
                  field={item}
                  index={index}
                  isSelected={selectedId === item.id}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onChange={onChange}
                />
              )}
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
