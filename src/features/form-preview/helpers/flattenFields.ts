import { type CanvasItem, type FormField, isFormField, isLayoutContainer } from "@/types/form";

export function flattenFields(items: CanvasItem[]): FormField[] {
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
