import type { FormField } from "@/types/form";
import { describe, expect, it } from "vitest";

import { validateRequiredField } from "./validation";

describe("validateRequiredField", () => {
  it("字串欄位會以 trim 後結果判斷空值", () => {
    const field: FormField = {
      id: "name",
      type: "text",
      label: "姓名",
      required: true,
      span: 12,
    };

    expect(validateRequiredField(field, "   ")).toBe("此欄位為必填");
    expect(validateRequiredField(field, "王小明")).toBeUndefined();
  });

  it("number 欄位 0 視為有效，NaN 視為空值", () => {
    const field: FormField = {
      id: "amount",
      type: "number",
      label: "金額",
      required: true,
      span: 12,
    };

    expect(validateRequiredField(field, 0)).toBeUndefined();
    expect(validateRequiredField(field, Number.NaN)).toBe("此欄位為必填");
  });

  it("checkbox required 時必須為 true", () => {
    const field: FormField = {
      id: "agree",
      type: "checkbox",
      label: "同意條款",
      required: true,
      span: 12,
    };

    expect(validateRequiredField(field, false)).toBe("此欄位為必填");
    expect(validateRequiredField(field, true)).toBeUndefined();
  });

  it("ocr-list 會先過濾空字串再判斷空陣列", () => {
    const field: FormField = {
      id: "ocr",
      type: "ocr-list",
      label: "OCR",
      required: true,
      span: 12,
    };

    expect(validateRequiredField(field, [])).toBe("此欄位為必填");
    expect(validateRequiredField(field, ["", "   "])).toBe("此欄位為必填");
    expect(validateRequiredField(field, ["item-1"])).toBeUndefined();
  });
});
