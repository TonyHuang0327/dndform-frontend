"use client";

import {
  type CanvasItem,
} from "@/types/form";
import {
  Grid,
  Typography,
} from "@mui/material";
import { DocumentPreviewRows } from "@/features/document-preview/components/DocumentPreviewRows";

export interface DocumentPreviewProps {
  items: CanvasItem[];
  formTitle: string;
  titleBackgroundColor: string;
  titleFontColor: string;
}

export default function DocumentPreview({
  items,
  formTitle,
  titleBackgroundColor,
  titleFontColor,
}: DocumentPreviewProps) {
  return (
    <Grid
      container
      spacing={0}
      sx={{
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
        <Typography variant="h6" sx={{ fontWeight: "bold", color: titleFontColor }}>
          {formTitle}
        </Typography>
      </Grid>

      <DocumentPreviewRows
        items={items}
        titleBackgroundColor={titleBackgroundColor}
        titleFontColor={titleFontColor}
      />
    </Grid>
  );
}
