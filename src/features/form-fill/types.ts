import type { FormField } from "@/types/form";

export interface FormSchema {
  id: string;
  name: string;
  fields: FormField[];
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
