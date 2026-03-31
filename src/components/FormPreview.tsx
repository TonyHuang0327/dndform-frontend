"use client";

import DocumentPreview from "@/components/DocumentPreview";
import InteractiveFormPreview from "@/components/InteractiveFormPreview";
import { type CanvasItem } from "@/types/form";

export interface FormPreviewProps {
  items: CanvasItem[];
  formTitle: string;
  previewMode: "document" | "interactive";
}

export default function FormPreview({
  items,
  formTitle,
  previewMode,
}: FormPreviewProps) {
  if (previewMode === "document") {
    return <DocumentPreview items={items} formTitle={formTitle} />;
  }

  return <InteractiveFormPreview items={items} formTitle={formTitle} />;
}
