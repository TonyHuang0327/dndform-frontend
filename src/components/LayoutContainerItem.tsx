"use client";

import { useDroppable } from "@dnd-kit/react";
import {
  Box,
  Card,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  isPlainLayout,
  type FormField,
  type LayoutContainer,
} from "@/types/form";
import SortableFieldItem from "./SortableFieldItem";
import { useSortable } from "@dnd-kit/react/sortable";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteIconOutlined from "@mui/icons-material/DeleteOutlined";

export interface LayoutContainerItemProps {
  container: LayoutContainer;
  index: number;
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
  titleBackgroundColor: string;
}

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
  titleBackgroundColor: string;
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
  titleBackgroundColor,
}: ColumnSlotProps) {
  const { ref, isDropTarget } = useDroppable({ id: columnId });

  return (
    <Stack direction="column" ref={ref} gap={1}>
      {!isPlain && (
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
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
            variant="standard"
          />
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          border: "1px dashed",
          borderColor: isDropTarget ? "primary.main" : "grey.400",
          bgcolor: isDropTarget ? "action.hover" : "background.paper",
          p: 1,
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
              titleBackgroundColor={titleBackgroundColor}
            />
          ))
        )}
      </Box>
    </Stack>
  );
}

export default function LayoutContainerItem({
  container,
  index,
  selectedId,
  onSelect,
  onDelete,
  onChange,
  onChangeColumnLabel,
  titleBackgroundColor,
}: LayoutContainerItemProps) {
  const plain = isPlainLayout(container);
  const { isDragging, ref, handleRef, sourceRef, targetRef } = useSortable({
    id: container.id,
    index,
  });
  return (
    <Card
      ref={(node) => {
        ref(node);
        sourceRef(node);
        targetRef(node);
      }}
      sx={{
        border: "1px solid",
        borderColor: "grey.300",
        borderRadius: 1,
        p: 2,
        position: "relative",
        bgcolor: "grey.50",
        opacity: isDragging ? 0.6 : 1,
        display: "flex",
        alignItems: "center",
        gap: 1,
        ...(plain ? {} : { borderLeft: `6px solid ${titleBackgroundColor}` }),
      }}
    >
      {/* 格子區域（橫向排列） */}
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
      {container.columns.map((col) => (
        <Box key={col.id} sx={{ flex: 1 }}>
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
            titleBackgroundColor={titleBackgroundColor}
          />
        </Box>
      ))}
      <IconButton
        size="small"
        color="error"
        onClick={() => onDelete(container.id)}
        aria-label="刪除版面容器"
      >
        <DeleteIconOutlined fontSize="small" />
      </IconButton>
    </Card>
  );
}
