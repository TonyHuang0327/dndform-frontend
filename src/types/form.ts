/**
 * 表單設計器 — 欄位型別與 Schema
 * 匯出 JSON 與預覽渲染皆依此結構。
 */

import { apiOcrList } from "@/services";

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
  ocrList: { id: number; name: string }[];
  selectedOcr?: { id: number; name: string }[];
}
export type FormField =
  | FormFieldTextLike
  | FormFieldCheckbox
  | FormFieldWithOptions
  | FormFieldOcrList;

const DEFAULT_LABELS: Record<FormFieldType, string> = {
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
        ocrList: apiOcrList(),
      };
    default: {
      const _: never = type;
      return _;
    }
  }
}
