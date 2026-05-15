import { http, HttpResponse } from "msw";
import { appendTemplateMock, getTemplateListMock } from "@/mocks/stores/template-list.store";
import { templateCreateBodySchema } from "@/schemas/template-create";
import type { TemplateListItem } from "@/types/template-list";

function isTemplateCollectionUrl(request: Request) {
  const url = new URL(request.url);
  return url.pathname.endsWith("/template");
}

export const handlers = [
  http.get(({ request }) => {
    return request.method === "GET" && isTemplateCollectionUrl(request);
  }, () => {
    return HttpResponse.json(getTemplateListMock());
  }),

  http.post(
    ({ request }) => isTemplateCollectionUrl(request),
    async ({ request }) => {
      let json: unknown;
      try {
        json = await request.json();
      } catch {
        return HttpResponse.json({ message: "無效的 JSON" }, { status: 400 });
      }
      const parsed = templateCreateBodySchema.safeParse(json);
      if (!parsed.success) {
        return HttpResponse.json(
          { message: "驗證失敗", issues: parsed.error.flatten() },
          { status: 400 }
        );
      }
      const body = parsed.data;
      const item: TemplateListItem = {
        id: `tpl-new-${crypto.randomUUID()}`,
        name: body.name,
        description: body.description,
        updatedAt: new Date().toISOString(),
        canEdit: body.canEdit,
      };
      appendTemplateMock(item);
      return HttpResponse.json(item, { status: 201 });
    }
  ),
];
