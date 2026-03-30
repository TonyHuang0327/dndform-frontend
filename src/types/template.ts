import type { CanvasItem } from "@/types/form";

export type TemplateSchemaVersion = 1;

export interface TemplateMetaV1 {
  exportedAt: string;
  source: "dndform-frontend";
}

export type TemplateCanvasItemV1 = CanvasItem;

export interface TemplateV1 {
  schemaVersion: TemplateSchemaVersion;
  meta: TemplateMetaV1;
  formTitle: string;
  items: TemplateCanvasItemV1[];
}
