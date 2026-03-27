"use client";

import { useDroppable } from "@dnd-kit/react";
import {
  Box,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  isPlainLayout,
  type FormField,
  type LayoutContainer,
} from "@/types/form";
import SortableFieldItem from "./SortableFieldItem";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenWithIcon from "@mui/icons-material/OpenWith";

export interface LayoutContainerItemProps {
  container: LayoutContainer;
  /** 目前被選取的欄位 id，用於 SortableFieldItem highlight */
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** 刪除容器本身（傳 container.id）或容器內欄位（傳 field.id） */
  onDelete: (id: string) => void;
  onChange: (id: string, patch: Partial<FormField>) => void;
  onChangeColumnLabel: (
    containerId: string,
    columnId: string,
    label: string
  ) => void;
}

const LABEL_WIDTH = 150;
type ColumnSlotProps = {
  isPlain: boolean;
  containerId: string;
  columnId: string;
  columnLabel: string;
  fields: FormField[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onChange: (id: string, patch: Partial<FormField>) => void;
  onChangeColumnLabel: (
    containerId: string,
    columnId: string,
    label: string
  ) => void;
};
function ColumnSlot({
  isPlain,
  containerId,
  columnId,
  columnLabel,
  fields,
  selectedId,
  onSelect,
  onDelete,
  onChange,
  onChangeColumnLabel,
}: ColumnSlotProps) {
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
      {!isPlain && (
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
            value={columnLabel}
            onChange={(e) =>
              onChangeColumnLabel(containerId, columnId, e.target.value)
            }
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="欄位標題"
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
      )}

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
  onChangeColumnLabel,
}: LayoutContainerItemProps) {
  const plain = isPlainLayout(container);
  return (
    <Tooltip
      title={
        <>
          <IconButton
            size="small"
            color="inherit"
            aria-label="移動版面容器"
            sx={{
              cursor: "move",
            }}
          >
            <OpenWithIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(container.id)}
            aria-label="刪除版面容器"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      }
      placement="top-end"
      slotProps={{
        tooltip: {
          sx: {
            p: 0,
          },
        },
        popper: {
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, -10],
              },
            },
          ],
        },
      }}
    >
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
        {/* 格子區域（橫向排列） */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {container.columns.map((col) => (
            <Box key={col.id} sx={{ flex: col.span }}>
              <ColumnSlot
                isPlain={plain}
                containerId={container.id}
                columnId={col.id}
                columnLabel={col.label ?? "標題"}
                fields={col.fields}
                selectedId={selectedId}
                onSelect={onSelect}
                onDelete={onDelete}
                onChange={onChange}
                onChangeColumnLabel={onChangeColumnLabel}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Tooltip>
  );
}
