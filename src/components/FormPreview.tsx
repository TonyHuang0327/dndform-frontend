"use client";

import DocumentPreview from "@/components/DocumentPreview";
import InteractiveFormPreview from "@/components/InteractiveFormPreview";
import { type CanvasItem } from "@/types/form";

export interface FormPreviewProps {
  items: CanvasItem[];
  formTitle: string;
  previewMode: "document" | "interactive";
  titleBackgroundColor: string;
}

export default function FormPreview({
  items,
  formTitle,
  previewMode,
  titleBackgroundColor,
}: FormPreviewProps) {
  if (previewMode === "document") {
    return (
      <DocumentPreview
        items={items}
        formTitle={formTitle}
        titleBackgroundColor={titleBackgroundColor}
      />
    );
  }

  return (
    <InteractiveFormPreview
      items={items}
      formTitle={formTitle}
      titleBackgroundColor={titleBackgroundColor}
    />
  );
}
