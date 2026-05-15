import type { TemplateListItem } from "@/types/template-list";

/** 單筆模板列表欄位工廠（可覆寫部分欄位） */
export function buildTemplateListItem(
  index: number,
  overrides?: Partial<TemplateListItem>
): TemplateListItem {
  const base: TemplateListItem = {
    id: `tpl-mock-${index + 1}`,
    name: `表單模板 ${index + 1}`,
    description: `這是第 ${index + 1} 筆假資料說明，用於開發與展示。`,
    updatedAt: new Date(Date.now() - index * 86_400_000).toISOString(),
    canEdit: index % 3 !== 0,
  };
  return { ...base, ...overrides };
}

/** 產生多筆列表假資料 */
export function buildTemplateList(count: number): TemplateListItem[] {
  return Array.from({ length: count }, (_, i) => buildTemplateListItem(i));
}
