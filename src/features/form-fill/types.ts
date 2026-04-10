import type { CanvasItem } from "@/types/form";

export interface FormSchema {
  schemaVersion: number;
  meta: {
    exportedAt: string;
    source: string;
  };
  formTitle: string;
  items: CanvasItem[];
}

export type FormFillValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | undefined;

export type FormFillValues = Record<string, FormFillValue>;
export type FormFillErrors = Record<string, string | undefined>;
