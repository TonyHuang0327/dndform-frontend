"use client";

import {
  type CanvasItem,
} from "@/types/form";
import {
  Box,
  Grid,
  Typography,
} from "@mui/material";
import { DocumentPreviewRows } from "@/features/document-preview/components/DocumentPreviewRows";

export interface DocumentPreviewProps {
  items: CanvasItem[];
  formTitle: string;
  titleBackgroundColor: string;
}

export default function DocumentPreview({
  items,
  formTitle,
  titleBackgroundColor,
}: DocumentPreviewProps) {
  if (items.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          {formTitle}
        </Typography>
      </Box>
    );
  }
  return (
    <Grid
      container
      spacing={0}
      sx={{
        // 採用「上+左」外框，右/下改由各列與各欄補齊，避免重疊線條
        borderTop: "1px solid black",
        borderLeft: "1px solid black",
        width: "70%",
        boxSizing: "border-box",
        margin: "0 auto",
        alignContent: "flex-start",
      }}
    >
      <Grid
        size={12}
        sx={{
          p: 1,
          borderRight: "1px solid black",
          borderBottom: "1px solid black",
          backgroundColor: titleBackgroundColor,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {formTitle}
        </Typography>
      </Grid>

      <DocumentPreviewRows
        items={items}
        titleBackgroundColor={titleBackgroundColor}
      />
    </Grid>
  );
}
