import { type CanvasItem, isFormField } from "@/types/form";
export function buildTopLevelFieldOrderMap(
  items: CanvasItem[]
): Map<string, number> {
  const topLevelOrderById = new Map<string, number>();
  let order = 0;

  for (const candidate of items) {
    if (!isFormField(candidate)) continue;
    order += 1;
    topLevelOrderById.set(candidate.id, order);
  }

  return topLevelOrderById;
}
