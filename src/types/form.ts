/**
 * 表單設計器 — 欄位型別與 Schema
 * 匯出 JSON 與預覽渲染皆依此結構。
 */

export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "radio"
  | "select"
  | "ocr-list";
export interface FormFieldOption {
  value: string;
  label: string;
}

/** 所有欄位共用 */
export interface FormFieldBase {
  id: string;
  type: FormFieldType;
  label: string;
  required?: boolean;
  /** 版面寬度：1~12，預設 12（整行） */
  span?: number;
}

/** 單行／多行／數字：可有 placeholder */
export interface FormFieldTextLike extends FormFieldBase {
  type: "text" | "textarea" | "number";
  placeholder?: string;
}

/** 勾選框：可有預設勾選 */
export interface FormFieldCheckbox extends FormFieldBase {
  type: "checkbox";
  defaultChecked?: boolean;
}

/** 單選／下拉：必有選項，至少一項 */
export interface FormFieldWithOptions extends FormFieldBase {
  type: "radio" | "select";
  options: FormFieldOption[];
}

export interface FormFieldOcrList extends FormFieldBase {
  type: "ocr-list";
  selectedOcr?: { id: number; name: string }[];
}
export type FormField =
  | FormFieldTextLike
  | FormFieldCheckbox
  | FormFieldWithOptions
  | FormFieldOcrList;

export const DEFAULT_LABELS: Record<FormFieldType, string> = {
  text: "單行文字",
  textarea: "多行文字",
  number: "數字",
  checkbox: "勾選框",
  radio: "單選",
  select: "下拉選單",
  "ocr-list": "OCR列表",
};

export const FIELD_TYPE_DEFINITIONS: { type: FormFieldType; label: string }[] =
  (Object.keys(DEFAULT_LABELS) as FormFieldType[]).map((type) => ({
    type,
    label: DEFAULT_LABELS[type],
  }));

export const DEFAULT_OPTION: FormFieldOption = {
  value: "opt1",
  label: "選項 1",
};

function createOptions(): FormFieldOption[] {
  return [{ ...DEFAULT_OPTION }];
}

/**
 * 依類型建立預設欄位，id 使用 crypto.randomUUID() 保證唯一。
 * radio / select 至少一項 options。
 */
export function createField(type: FormFieldType): FormField {
  const id = crypto.randomUUID();
  const label = DEFAULT_LABELS[type];
  const span = 12;

  switch (type) {
    case "text":
    case "textarea":
    case "number":
      return { id, type, label, required: false, placeholder: "", span };
    case "checkbox":
      return { id, type, label, required: false, defaultChecked: false, span };
    case "radio":
    case "select":
      return {
        id,
        type,
        label,
        required: false,
        options: createOptions(),
        span,
      };
    case "ocr-list":
      return {
        id,
        type,
        label,
        span,
        required: false,
      };
    default: {
      const _: never = type;
      return _;
    }
  }
}

// ── Layout Container ─────────────────────────────────────────

/** 版面容器的單一格子 */
export interface LayoutColumn {
  id: string;
  /** 1~12，同一容器內所有 span 加總等於 12 */
  span: number;
  fields: FormField[];
}

/** 版面容器（一層，不可再嵌套容器） */
export interface LayoutContainer {
  id: string;
  type: "layout";
  columns: LayoutColumn[];
}

/**
 * 畫布項目：表單欄位或版面容器。
 * 若未來新增第三種型別，isFormField 守衛須同步更新。
 */
export type CanvasItem = FormField | LayoutContainer;

// ── Type Guards ───────────────────────────────────────────────

export function isLayoutContainer(
  item: CanvasItem
): item is LayoutContainer {
  return item.type === "layout";
}

/**
 * 此守衛假設所有非 "layout" 的 CanvasItem 都是 FormField。
 * FormFieldType 不含 "layout"，目前定義下安全。
 */
export function isFormField(item: CanvasItem): item is FormField {
  return item.type !== "layout";
}

// ── Layout Factory ────────────────────────────────────────────

export type LayoutType = "2col" | "3col" | "4col";

export function createLayoutContainer(
  layoutType: LayoutType
): LayoutContainer {
  const counts: Record<LayoutType, number> = {
    "2col": 2,
    "3col": 3,
    "4col": 4,
  };
  const count = counts[layoutType];
  const span = 12 / count;
  return {
    id: crypto.randomUUID(),
    type: "layout",
    columns: Array.from({ length: count }, () => ({
      id: crypto.randomUUID(),
      span,
      fields: [],
    })),
  };
}

// ── Helpers for nested lookup ─────────────────────────────────

/**
 * 在 CanvasItem[] 中查找指定 id 的 FormField（含容器內部）。
 * 回傳 { field, containerId, columnId } 或 null。
 */
export function findFieldInItems(
  id: string,
  items: CanvasItem[]
): { field: FormField; containerId: string | null; columnId: string | null } | null {
  for (const item of items) {
    if (isFormField(item) && item.id === id) {
      return { field: item, containerId: null, columnId: null };
    }
    if (isLayoutContainer(item)) {
      for (const col of item.columns) {
        const found = col.fields.find((f) => f.id === id);
        if (found) {
          return { field: found, containerId: item.id, columnId: col.id };
        }
      }
    }
  }
  return null;
}

/**
 * 判斷 source 與 target 是否在同一個 column 內。
 * 兩個參數皆應為欄位（FormField）的 id，不支援直接傳入 column id。
 * 若 target 為 column id 本身，tgtMeta 會是 null，結果永遠為 false。
 */
export function isSameColumn(
  sourceId: string,
  targetId: string,
  items: CanvasItem[]
): boolean {
  const srcMeta = findFieldInItems(sourceId, items);
  const tgtMeta = findFieldInItems(targetId, items);
  return (
    srcMeta?.columnId != null &&
    srcMeta.columnId === tgtMeta?.columnId
  );
}

/**
 * 判斷 id 是否為畫布上任意一個有效 id（頂層 item、容器、column、或 column 內欄位）。
 * 升級版的 isFieldId，用於 drag handler 驗證。
 * 注意：不包含畫布根 droppable（CANVAS_ID），呼叫端需另行判斷。
 */
export function isCanvasItemId(id: unknown, items: CanvasItem[]): boolean {
  if (typeof id !== "string") return false;
  return items.some((item) => {
    if (item.id === id) return true;
    if (isLayoutContainer(item)) {
      return item.columns.some(
        (col) => col.id === id || col.fields.some((f) => f.id === id)
      );
    }
    return false;
  });
}
