import { buildTemplateList } from "@/mocks/factories/template-list.factory";
import type { TemplateListItem } from "@/types/template-list";

/** MSW 用：模擬後端持有的模板列表（記憶體內） */
let mockTemplates: TemplateListItem[] = [...buildTemplateList(10)];

export function getTemplateListMock(): TemplateListItem[] {
  return mockTemplates;
}

export function appendTemplateMock(item: TemplateListItem): TemplateListItem {
  mockTemplates = [...mockTemplates, item];
  return item;
}
