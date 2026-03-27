"use client";

import DocumentPreview from "@/components/DocumentPreview";
import InteractiveFormPreview from "@/components/InteractiveFormPreview";
import { type CanvasItem, type FormField, isFormField, isLayoutContainer } from "@/types/form";
import { useMemo, useState } from "react";

export interface FormPreviewProps {
  items: CanvasItem[];
  formTitle: string;
  previewMode: "document" | "interactive";
}

function flattenFields(items: CanvasItem[]): FormField[] {
  const flattened: FormField[] = [];
  const seen = new Set<string>();

  const pushField = (field: FormField) => {
    if (seen.has(field.id)) {
      console.warn(`偵測到重複欄位 id：${field.id}，將採用首次出現者`);
      return;
    }
    seen.add(field.id);
    flattened.push(field);
  };

  for (const item of items) {
    if (isFormField(item)) {
      pushField(item);
      continue;
    }
    if (isLayoutContainer(item)) {
      for (const col of item.columns) {
        for (const field of col.fields) {
          pushField(field);
        }
      }
    }
  }

  return flattened;
}

function getInitialValue(field: FormField): unknown {
  if (field.type === "text" || field.type === "textarea" || field.type === "number") {
    return "";
  }
  if (field.type === "checkbox") return Boolean(field.defaultChecked);
  if (field.type === "radio" || field.type === "select") return "";
  return undefined;
}

export default function FormPreview({
  items,
  formTitle,
  previewMode,
}: FormPreviewProps) {
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [submitSuccessOpen, setSubmitSuccessOpen] = useState(false);
  const flattenedFields = useMemo(() => flattenFields(items), [items]);

  const effectiveFormValues = useMemo(() => {
    const next: Record<string, unknown> = {};

    for (const field of flattenedFields) {
      if (formValues[field.id] !== undefined) {
        next[field.id] = formValues[field.id];
      } else {
        next[field.id] = getInitialValue(field);
      }
    }

    for (const field of flattenedFields) {
      if (field.type !== "radio" && field.type !== "select") continue;
      const current = next[field.id];
      const optionValues = new Set(field.options.map((opt) => opt.value));
      if (typeof current !== "string" || (current !== "" && !optionValues.has(current))) {
        next[field.id] = "";
      }
    }

    return next;
  }, [flattenedFields, formValues]);

  if (previewMode === "document") {
    return <DocumentPreview items={items} formTitle={formTitle} />;
  }

  return (
    <InteractiveFormPreview
      items={items}
      formTitle={formTitle}
      formValues={effectiveFormValues}
      setFormValues={setFormValues}
      submitSuccessOpen={submitSuccessOpen}
      setSubmitSuccessOpen={setSubmitSuccessOpen}
    />
  );
}
