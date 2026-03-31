import type {
  CanvasItem,
  FormField,
  FormFieldOption,
  LayoutColumn,
  LayoutContainer,
  LayoutVariant,
} from "@/types/form";
import type { TemplateV1 } from "@/types/template";

const MAX_TEMPLATE_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_TEMPLATE_ITEMS = 300;
const MAX_TEMPLATE_FIELDS = 1500;
const DEFAULT_FORM_TITLE = "未命名表單";

export class TemplateIOError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TemplateIOError";
  }
}

export function getMaxTemplateFileSizeBytes(): number {
  return MAX_TEMPLATE_FILE_SIZE_BYTES;
}

export function buildTemplateV1(formTitle: string, items: CanvasItem[]): TemplateV1 {
  return {
    schemaVersion: 1,
    meta: {
      exportedAt: new Date().toISOString(),
      source: "dndform-frontend",
    },
    formTitle,
    items,
  };
}

export function serializeTemplate(template: TemplateV1): string {
  return JSON.stringify(template, null, 2);
}

export function parseTemplateJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new TemplateIOError("JSON 格式錯誤，請檢查檔案內容");
  }
}

interface ValidateResult {
  template: TemplateV1;
  warnings: string[];
}

export function validateAndNormalizeTemplate(raw: unknown): ValidateResult {
  if (!isObject(raw)) {
    throw new TemplateIOError("範本結構不完整，請確認檔案來源");
  }
  if (raw.schemaVersion !== 1) {
    throw new TemplateIOError("範本版本不支援（schemaVersion）");
  }
  if (!isObject(raw.meta)) {
    throw new TemplateIOError("範本結構不完整，請確認檔案來源");
  }
  if (raw.meta.source !== "dndform-frontend") {
    throw new TemplateIOError("範本結構不完整，請確認檔案來源");
  }
  if (!isRfc3339(raw.meta.exportedAt)) {
    throw new TemplateIOError("範本結構不完整，請確認檔案來源");
  }
  if (!Array.isArray(raw.items)) {
    throw new TemplateIOError("範本結構不完整，請確認檔案來源");
  }

  if (raw.items.length > MAX_TEMPLATE_ITEMS) {
    throw new TemplateIOError("範本內容過大，請拆分後再匯入");
  }

  const warnings = new Set<string>();
  const itemIds = new Set<string>();
  const columnIds = new Set<string>();
  const fieldIds = new Set<string>();

  let totalFields = 0;

  const normalizedItems: CanvasItem[] = raw.items.map((item) => {
    const normalizedItem = normalizeCanvasItem(
      item,
      itemIds,
      columnIds,
      fieldIds,
      warnings
    );
    if (isLayoutContainerLike(normalizedItem)) {
      for (const col of normalizedItem.columns) {
        totalFields += col.fields.length;
      }
    } else {
      totalFields += 1;
    }
    return normalizedItem;
  });

  if (totalFields > MAX_TEMPLATE_FIELDS) {
    throw new TemplateIOError("範本內容過大，請拆分後再匯入");
  }

  const normalizedTitle =
    typeof raw.formTitle === "string" && raw.formTitle.trim() !== ""
      ? raw.formTitle
      : DEFAULT_FORM_TITLE;
  if (normalizedTitle !== raw.formTitle) {
    warnings.add("表單標題為空，已自動改為「未命名表單」");
  }

  return {
    template: {
      schemaVersion: 1,
      meta: {
        exportedAt: raw.meta.exportedAt,
        source: "dndform-frontend",
      },
      formTitle: normalizedTitle,
      items: normalizedItems,
    },
    warnings: [...warnings],
  };
}

function normalizeCanvasItem(
  rawItem: unknown,
  itemIds: Set<string>,
  columnIds: Set<string>,
  fieldIds: Set<string>,
  warnings: Set<string>
): CanvasItem {
  if (!isObject(rawItem) || typeof rawItem.id !== "string" || rawItem.id === "") {
    throw new TemplateIOError("範本結構不完整，請確認檔案來源");
  }
  ensureUniqueId(rawItem.id, itemIds);

  if (rawItem.type === "layout") {
    return normalizeLayoutItem(rawItem, columnIds, fieldIds, warnings);
  }
  return normalizeFormField(rawItem, fieldIds, warnings);
}

function normalizeLayoutItem(
  rawItem: Record<string, unknown>,
  columnIds: Set<string>,
  fieldIds: Set<string>,
  warnings: Set<string>
): LayoutContainer {
  const variant: LayoutVariant = rawItem.variant === "plain" ? "plain" : "labeled";
  if (rawItem.variant !== variant) {
    warnings.add("部分版面容器 variant 非法，已自動修正");
  }
  if (!Array.isArray(rawItem.columns)) {
    throw new TemplateIOError("範本結構不完整，請確認檔案來源");
  }

  const columns: LayoutColumn[] = rawItem.columns.map((col) => {
    if (!isObject(col) || typeof col.id !== "string" || col.id === "") {
      throw new TemplateIOError("範本結構不完整，請確認檔案來源");
    }
    ensureUniqueId(col.id, columnIds);
    if (!Array.isArray(col.fields)) {
      throw new TemplateIOError("範本結構不完整，請確認檔案來源");
    }

    const normalizedSpan = normalizeSpan(col.span, warnings, "欄位容器寬度");
    const normalizedLabel =
      typeof col.label === "string" ? col.label : variant === "plain" ? "" : "標題";
    const fields = col.fields.map((field) =>
      normalizeFormField(field, fieldIds, warnings)
    );

    return {
      id: col.id,
      span: normalizedSpan,
      label: normalizedLabel,
      fields,
    };
  });

  return {
    id: rawItem.id as string,
    type: "layout",
    variant,
    columns,
  };
}

function normalizeFormField(
  rawField: unknown,
  fieldIds: Set<string>,
  warnings: Set<string>
): FormField {
  if (!isObject(rawField)) {
    throw new TemplateIOError("範本結構不完整，請確認檔案來源");
  }
  if (typeof rawField.id !== "string" || rawField.id === "") {
    throw new TemplateIOError("範本結構不完整，請確認檔案來源");
  }
  if (typeof rawField.label !== "string") {
    throw new TemplateIOError("範本結構不完整，請確認檔案來源");
  }

  ensureUniqueId(rawField.id, fieldIds);

  const span = normalizeSpan(rawField.span, warnings, "欄位寬度");
  const required = Boolean(rawField.required);

  switch (rawField.type) {
    case "text":
    case "textarea":
    case "number":
      return {
        id: rawField.id,
        type: rawField.type,
        label: rawField.label,
        required,
        span,
        placeholder:
          typeof rawField.placeholder === "string" ? rawField.placeholder : "",
      };
    case "checkbox":
      return {
        id: rawField.id,
        type: "checkbox",
        label: rawField.label,
        required,
        span,
        defaultChecked: Boolean(rawField.defaultChecked),
      };
    case "radio":
    case "select":
      return {
        id: rawField.id,
        type: rawField.type,
        label: rawField.label,
        required,
        span,
        options: normalizeOptions(rawField.options),
      };
    case "ocr-list":
      return {
        id: rawField.id,
        type: "ocr-list",
        label: rawField.label,
        required,
        span,
        selectedOcr: normalizeSelectedOcr(rawField.selectedOcr),
      };
    case "labeled-input":
      return {
        id: rawField.id,
        type: "labeled-input",
        label: rawField.label,
        required,
        span,
      };
    default:
      throw new TemplateIOError("範本結構不完整，請確認檔案來源");
  }
}

function normalizeOptions(rawOptions: unknown): FormFieldOption[] {
  if (!Array.isArray(rawOptions) || rawOptions.length === 0) {
    throw new TemplateIOError("範本結構不完整，請確認檔案來源");
  }
  return rawOptions.map((opt) => {
    if (!isObject(opt) || typeof opt.value !== "string" || typeof opt.label !== "string") {
      throw new TemplateIOError("範本結構不完整，請確認檔案來源");
    }
    return { value: opt.value, label: opt.label };
  });
}

function normalizeSelectedOcr(rawSelectedOcr: unknown): { id: number; name: string }[] | undefined {
  if (rawSelectedOcr == null) return undefined;
  if (!Array.isArray(rawSelectedOcr)) {
    throw new TemplateIOError("範本結構不完整，請確認檔案來源");
  }
  return rawSelectedOcr.map((item) => {
    if (!isObject(item) || typeof item.id !== "number" || typeof item.name !== "string") {
      throw new TemplateIOError("範本結構不完整，請確認檔案來源");
    }
    return { id: item.id, name: item.name };
  });
}

function normalizeSpan(rawSpan: unknown, warnings: Set<string>, source: string): number {
  const numericSpan =
    typeof rawSpan === "number"
      ? rawSpan
      : typeof rawSpan === "string"
        ? Number(rawSpan)
        : 12;
  if (Number.isNaN(numericSpan)) {
    warnings.add(`${source}非法，已自動修正`);
    return 12;
  }
  const normalized = Math.max(1, Math.min(12, Math.trunc(numericSpan)));
  if (normalized !== numericSpan) {
    warnings.add(`${source}非法，已自動修正`);
  }
  return normalized;
}

function ensureUniqueId(id: string, namespace: Set<string>) {
  if (namespace.has(id)) {
    throw new TemplateIOError("偵測到重複 id，無法匯入");
  }
  namespace.add(id);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLayoutContainerLike(value: CanvasItem): value is LayoutContainer {
  return value.type === "layout";
}

function isRfc3339(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const regex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;
  if (!regex.test(value)) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}
