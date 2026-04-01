"use client";

import {
  FIELD_TYPE_DEFINITIONS,
  type FormFieldType,
  type LayoutType,
  type LayoutVariant,
} from "@/types/form";
import { Box, Grid, Paper, Typography } from "@mui/material";
import ViewListIcon from '@mui/icons-material/ViewList';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import { useDraggable } from "@dnd-kit/react";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import SubjectIcon from "@mui/icons-material/Subject";
import PinIcon from "@mui/icons-material/Pin";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import ArrowDropDownCircleIcon from "@mui/icons-material/ArrowDropDownCircle";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import TitleIcon from "@mui/icons-material/Title";

const FIELD_TYPE_ICONS: Record<FormFieldType, React.ReactNode> = {
  text: <TextFieldsIcon fontSize="small" />,
  textarea: <SubjectIcon fontSize="small" />,
  number: <PinIcon fontSize="small" />,
  checkbox: <CheckBoxIcon fontSize="small" />,
  radio: <RadioButtonCheckedIcon fontSize="small" />,
  select: <ArrowDropDownCircleIcon fontSize="small" />,
  "ocr-list": <DocumentScannerIcon fontSize="small" />,
  "labeled-input": <TitleIcon fontSize="small" />,
};

type LayoutIconKey = `${LayoutType}-${LayoutVariant}`;

const LAYOUT_TYPE_ICONS: Record<LayoutIconKey, React.ReactNode> = {
  "1col-labeled": <ViewListIcon fontSize="small" />,
  "2col-labeled": <VerticalSplitIcon fontSize="small" />,
  "1col-plain": <ViewListIcon fontSize="small" />,
  "2col-plain": <VerticalSplitIcon fontSize="small" />,
};

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
      {FIELD_TYPE_ICONS[type]}
      <Typography variant="body2">{label}</Typography>
    </Paper>
  );
}

const LAYOUT_TYPE_DEFINITIONS: {
  layoutType: LayoutType;
  layoutVariant: LayoutVariant;
  label: string;
}[] = [
  { layoutType: "1col", layoutVariant: "labeled", label: "單欄" },
  { layoutType: "2col", layoutVariant: "labeled", label: "雙欄" },
  { layoutType: "1col", layoutVariant: "plain", label: "無標題單欄" },
  { layoutType: "2col", layoutVariant: "plain", label: "無標題雙欄" },
];

function LayoutItem({
  layoutType,
  layoutVariant,
  label,
}: {
  layoutType: LayoutType;
  layoutVariant: LayoutVariant;
  label: string;
}) {
  const id = `palette-layout-${layoutType}-${layoutVariant}`;
  const { ref } = useDraggable({
    id,
    data: { layoutType, layoutVariant, source: "palette" as const },
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
      {LAYOUT_TYPE_ICONS[`${layoutType}-${layoutVariant}`]}
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
        {LAYOUT_TYPE_DEFINITIONS.map(({ layoutType, layoutVariant, label }) => (
          <Grid size={6} key={`${layoutType}-${layoutVariant}`}>
            <LayoutItem
              layoutType={layoutType}
              layoutVariant={layoutVariant}
              label={label}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
