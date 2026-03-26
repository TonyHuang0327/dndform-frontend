"use client";

import {
  FIELD_TYPE_DEFINITIONS,
  type FormFieldType,
  type LayoutType,
} from "@/types/form";
import { Box, Grid, Paper, Typography } from "@mui/material";
import NotesIcon from "@mui/icons-material/Notes";
import ViewListIcon from "@mui/icons-material/ViewList";
import { useDraggable } from "@dnd-kit/react";

function PaletteItem({ type, label }: { type: FormFieldType; label: string }) {
  const id = `palette-${type}`;
  const { ref } = useDraggable({
    id,
    data: { type, source: "palette" as const },
  });

  return (
    <Paper
      sx={{
        p: 2,
        cursor: "grab",
        "&:active": { cursor: "grabbing" },
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
      ref={ref}
    >
      <NotesIcon />
      <Typography variant="body2">{label}</Typography>
    </Paper>
  );
}

const LAYOUT_TYPE_DEFINITIONS: { layoutType: LayoutType; label: string }[] = [
  { layoutType: "1col", label: "單欄" },
  { layoutType: "2col", label: "雙欄" },
];

function LayoutItem({
  layoutType,
  label,
}: {
  layoutType: LayoutType;
  label: string;
}) {
  const id = `palette-layout-${layoutType}`;
  const { ref } = useDraggable({
    id,
    data: { layoutType, source: "palette" as const },
  });

  return (
    <Paper
      sx={{
        p: 2,
        cursor: "grab",
        "&:active": { cursor: "grabbing" },
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
      ref={ref}
    >
      <ViewListIcon />
      <Typography variant="body2">{label}</Typography>
    </Paper>
  );
}

export default function ComponentPalette() {
  return (
    <Box
      sx={{
        width: "25%",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        border: "1px solid #e0e0e0",
        p: 2,
        backgroundColor: "aliceblue",
        borderRadius: 1,
      }}
    >
      <Typography color="text.secondary">元件庫</Typography>
      <Grid container spacing={2}>
        {FIELD_TYPE_DEFINITIONS.map(({ type, label }) => (
          <Grid size={6} key={type}>
            <PaletteItem type={type} label={label} />
          </Grid>
        ))}
      </Grid>
      <Typography color="text.secondary">版面配置</Typography>
      <Grid container spacing={2}>
        {LAYOUT_TYPE_DEFINITIONS.map(({ layoutType, label }) => (
          <Grid size={6} key={layoutType}>
            <LayoutItem layoutType={layoutType} label={label} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
