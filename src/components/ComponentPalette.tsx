"use client";

import { useDraggable } from "@dnd-kit/core";
import { FIELD_TYPE_DEFINITIONS, type FormFieldType } from "@/types/form";
import { Box, Paper, Typography } from "@mui/material";


function PaletteItem({ type, label }: { type: FormFieldType; label: string }) {
  const id = `palette-${type}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { type, source: "palette" as const },
  });

  return (
    <Paper
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      elevation={isDragging ? 3 : 1}
      sx={{
        p: 1.5,
        cursor: "grab",
        opacity: isDragging ? 0.6 : 1,
        "&:active": { cursor: "grabbing" },
      }}
    >
      <Typography variant="body2">{label}</Typography>
    </Paper>
  );
}

export default function ComponentPalette() {
  return (
    <Box
      sx={{
        width: 160,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
        元件庫
      </Typography>
      {FIELD_TYPE_DEFINITIONS.map(({ type, label }) => (
        <PaletteItem key={type} type={type} label={label} />
      ))}
    </Box>
  );
}
