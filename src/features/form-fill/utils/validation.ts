import type { FormField } from "@/types/form";

const REQUIRED_ERROR_MESSAGE = "此欄位為必填";

function isEmptyStringValue(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function isEmptyNumberValue(value: unknown): boolean {
  return typeof value !== "number" || Number.isNaN(value);
}

function isEmptyOcrListValue(value: unknown): boolean {
  if (!Array.isArray(value)) {
    return true;
  }

  const normalized = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return normalized.length === 0;
}

export function validateRequiredField(
  field: FormField,
  value: unknown
): string | undefined {
  if (!field.required) {
    return undefined;
  }

  switch (field.type) {
    case "text":
    case "textarea":
    case "select":
    case "radio":
    case "labeled-input":
      return isEmptyStringValue(value) ? REQUIRED_ERROR_MESSAGE : undefined;
    case "number":
      return isEmptyNumberValue(value) ? REQUIRED_ERROR_MESSAGE : undefined;
    case "checkbox":
      return value === true ? undefined : REQUIRED_ERROR_MESSAGE;
    case "ocr-list":
      return isEmptyOcrListValue(value) ? REQUIRED_ERROR_MESSAGE : undefined;
    default:
      return undefined;
  }
}
