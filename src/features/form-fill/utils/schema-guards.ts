import type { CanvasItem, FormField, LayoutContainer } from "@/types/form";

import type { FormSchema } from "../types";

function isValidFieldShape(field: unknown): field is FormField {
  if (!field || typeof field !== "object") {
    return false;
  }

  const candidate = field as Partial<FormField>;
  return (
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    typeof candidate.type === "string" &&
    typeof candidate.label === "string"
  );
}

export function isValidFormSchema(schema: unknown): schema is FormSchema {
  if (!schema || typeof schema !== "object") {
    return false;
  }

  const candidate = schema as Partial<FormSchema>;
  if (
    candidate.schemaVersion !== 1 ||
    typeof candidate.formTitle !== "string" ||
    !candidate.meta ||
    typeof candidate.meta.exportedAt !== "string" ||
    typeof candidate.meta.source !== "string" ||
    !Array.isArray(candidate.items)
  ) {
    return false;
  }

  return hasValidItemsAndUniqueFieldIds(candidate.items);
}

function hasValidItemsAndUniqueFieldIds(items: CanvasItem[]): boolean {
  const seenFieldIds = new Set<string>();

  for (const item of items) {
    if (!item || typeof item !== "object" || typeof item.id !== "string") {
      return false;
    }

    if (item.type === "layout") {
      const container = item as LayoutContainer;
      if (!Array.isArray(container.columns)) {
        return false;
      }

      for (const column of container.columns) {
        if (!Array.isArray(column.fields)) {
          return false;
        }

        for (const field of column.fields) {
          if (!isValidFieldShape(field)) {
            return false;
          }
          if (seenFieldIds.has(field.id)) {
            return false;
          }
          seenFieldIds.add(field.id);
        }
      }
      continue;
    }

    const fieldItem = item as FormField;
    if (!isValidFieldShape(fieldItem)) {
      return false;
    }
    if (seenFieldIds.has(fieldItem.id)) {
      return false;
    }
    seenFieldIds.add(fieldItem.id);
  }

  return true;
}
