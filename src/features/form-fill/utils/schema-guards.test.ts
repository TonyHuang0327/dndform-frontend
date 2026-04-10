import { describe, expect, it } from "vitest";

import { isValidFormSchema } from "./schema-guards";

describe("isValidFormSchema", () => {
  it("合法 schema 回傳 true", () => {
    const schema = {
      schemaVersion: 1,
      meta: {
        exportedAt: "2026-04-09T10:11:09.663Z",
        source: "dndform-frontend",
      },
      formTitle: "測試表單",
      items: [
        { id: "f1", type: "text", label: "姓名", span: 12 },
        { id: "f2", type: "number", label: "金額", span: 12 },
      ],
    };

    expect(isValidFormSchema(schema)).toBe(true);
  });

  it("缺少必要結構時回傳 false", () => {
    const schema = {
      schemaVersion: 1,
      meta: {
        exportedAt: "2026-04-09T10:11:09.663Z",
        source: "dndform-frontend",
      },
      formTitle: "測試表單",
      items: [{ id: "f1", label: "姓名" }],
    };

    expect(isValidFormSchema(schema)).toBe(false);
  });

  it("欄位 id 重複時回傳 false", () => {
    const schema = {
      schemaVersion: 1,
      meta: {
        exportedAt: "2026-04-09T10:11:09.663Z",
        source: "dndform-frontend",
      },
      formTitle: "測試表單",
      items: [
        { id: "dup", type: "text", label: "欄位 A", span: 12 },
        { id: "dup", type: "text", label: "欄位 B", span: 12 },
      ],
    };

    expect(isValidFormSchema(schema)).toBe(false);
  });
});
