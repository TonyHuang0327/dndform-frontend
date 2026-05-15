import { instance } from "@/libs/api-client";
import type { TemplateCreateBody } from "@/schemas/template-create";
import type { TemplateListItem } from "@/types/template-list";

/** 取得目前使用者可存取的表單模板列表 */
export async function fetchAccessibleTemplates(): Promise<TemplateListItem[]> {
  const { data } = await instance.get<TemplateListItem[]>("/template");
  return data;
}

/** 建立新表單模板 */
export async function createTemplate(
  body: TemplateCreateBody
): Promise<TemplateListItem> {
  const { data } = await instance.post<TemplateListItem>("/template", body);
  return data;
}
