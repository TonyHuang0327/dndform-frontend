import { http, HttpResponse } from "msw";
import { buildTemplateList } from "./factories/template-list.factory";

export const handlers = [
  http.get(({ request }) => {
    const url = new URL(request.url);
    return request.method === "GET" && url.pathname.endsWith("/template");
  }, () => {
    return HttpResponse.json(buildTemplateList(10));
  }),
];
