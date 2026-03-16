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
  | "select";

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

export type FormField =
  | FormFieldTextLike
  | FormFieldCheckbox
  | FormFieldWithOptions;

const DEFAULT_LABELS: Record<FormFieldType, string> = {
  text: "單行文字",
  textarea: "多行文字",
  number: "數字",
  checkbox: "勾選框",
  radio: "單選",
  select: "下拉選單",
};

export const FIELD_TYPE_DEFINITIONS: { type: FormFieldType; label: string }[] =
  (Object.keys(DEFAULT_LABELS) as FormFieldType[]).map((type) => ({
    type,
    label: DEFAULT_LABELS[type],
  }));

const DEFAULT_OPTION: FormFieldOption = { value: "opt1", label: "選項 1" };

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

  switch (type) {
    case "text":
    case "textarea":
    case "number":
      return { id, type, label, required: false, placeholder: "" };
    case "checkbox":
      return { id, type, label, required: false, defaultChecked: false };
    case "radio":
    case "select":
      return { id, type, label, required: false, options: createOptions() };
    default: {
      const _: never = type;
      return _;
    }
  }
}
