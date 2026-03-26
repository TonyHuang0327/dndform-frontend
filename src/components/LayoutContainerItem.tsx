"use client";

import { useDroppable } from "@dnd-kit/react";
import { Box, Grid, IconButton, TextField, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { FormField, LayoutContainer } from "@/types/form";
import SortableFieldItem from "./SortableFieldItem";

export interface LayoutContainerItemProps {
  container: LayoutContainer;
  /** 目前被選取的欄位 id，用於 SortableFieldItem highlight */
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** 刪除容器本身（傳 container.id）或容器內欄位（傳 field.id） */
  onDelete: (id: string) => void;
  onChange: (id: string, patch: Partial<FormField>) => void;
}

const LABEL_WIDTH = 150;

function ColumnSlot({
  columnId,
  fields,
  selectedId,
  onSelect,
  onDelete,
  onChange,
}: {
  columnId: string;
  fields: FormField[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onChange: (id: string, patch: Partial<FormField>) => void;
}) {
  const { ref, isDropTarget } = useDroppable({ id: columnId });

  return (
    <Grid
      container
      ref={ref}
      sx={{
        border: "1px solid",
        borderColor: isDropTarget ? "primary.main" : "grey.400",
        bgcolor: isDropTarget ? "action.hover" : "background.paper",
      }}
    >
      <Box
        sx={{
          width: LABEL_WIDTH,
          minWidth: LABEL_WIDTH,
          flexShrink: 0,
          borderRight: "1px solid black",
          display: "flex",
          p: 1,
          alignItems: "center",
        }}
      >
        <TextField
          id={`${columnId}-label`}
          defaultValue="標題"
          variant="outlined"
          sx={{
            "& .MuiInputBase-input": {
              padding: 0,
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "& .Mui-focused": {
              backgroundColor: "aliceblue",
            },
          }}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
        }}
      >
        {fields.length === 0 ? (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ textAlign: "center", p: 1, display: "block" }}
          >
            拖入欄位
          </Typography>
        ) : (
          fields.map((field, index) => (
            <SortableFieldItem
              key={field.id}
              field={field}
              index={index}
              isSelected={selectedId === field.id}
              onSelect={onSelect}
              onDelete={onDelete}
              onChange={onChange}
              disableResize
            />
          ))
        )}
      </Box>
    </Grid>
  );
}

export default function LayoutContainerItem({
  container,
  selectedId,
  onSelect,
  onDelete,
  onChange,
}: LayoutContainerItemProps) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "grey.300",
        borderRadius: 1,
        p: 1,
        position: "relative",
        bgcolor: "grey.50",
      }}
    >
      {/* 右上角刪除容器按鈕 */}
      {/* <IconButton
        size="small"
        color="error"
        onClick={() => onDelete(container.id)}
        aria-label="刪除版面容器"
        sx={{ position: "absolute", top: 4, right: 4, zIndex: 1 }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton> */}

      {/* 格子區域（橫向排列） */}
      <Box sx={{ display: "flex", gap: 1 }}>
        {container.columns.map((col) => (
          <Box key={col.id} sx={{ flex: col.span }}>
            <ColumnSlot
              columnId={col.id}
              fields={col.fields}
              selectedId={selectedId}
              onSelect={onSelect}
              onDelete={onDelete}
              onChange={onChange}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
