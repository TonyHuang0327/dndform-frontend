import { describe, expect, it } from "vitest";

import {
  getMockFormSchemaById,
  MOCK_FORM_SCHEMA_ID,
} from "./mockFormSchemas";

describe("mockFormSchemas", () => {
  it("可依 formId 取得單筆假表單 schema", () => {
    const schema = getMockFormSchemaById(MOCK_FORM_SCHEMA_ID);

    expect(schema).not.toBeNull();
    expect(schema?.id).toBe(MOCK_FORM_SCHEMA_ID);
    expect(schema?.fields.length).toBeGreaterThan(0);
  });

  it("查無 formId 時回傳 null", () => {
    const schema = getMockFormSchemaById("unknown-form-id");
    expect(schema).toBeNull();
  });
});
