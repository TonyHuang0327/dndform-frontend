"use client";

import DocumentPreview from "@/components/DocumentPreview";
import InteractiveFormPreview from "@/components/InteractiveFormPreview";
import { type CanvasItem } from "@/types/form";

export interface FormPreviewProps {
  items: CanvasItem[];
  formTitle: string;
  previewMode: "document" | "interactive";
  titleBackgroundColor: string;
  titleFontColor: string;
}

export default function FormPreview({
  items,
  formTitle,
  previewMode,
  titleBackgroundColor,
  titleFontColor,
}: FormPreviewProps) {
  if (previewMode === "document") {
    return (
      <DocumentPreview
        items={items}
        formTitle={formTitle}
        titleBackgroundColor={titleBackgroundColor}
        titleFontColor={titleFontColor}
      />
    );
  }

  return (
    <InteractiveFormPreview
      items={items}
      formTitle={formTitle}
      titleBackgroundColor={titleBackgroundColor}
      titleFontColor={titleFontColor}
    />
  );
}
