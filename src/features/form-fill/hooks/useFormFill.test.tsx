import type { FormField } from "@/types/form";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useFormFill } from "./useFormFill";

const baseFields: FormField[] = [
  {
    id: "name",
    type: "text",
    label: "姓名",
    required: true,
    span: 12,
  },
  {
    id: "agree",
    type: "checkbox",
    label: "同意條款",
    required: true,
    span: 12,
  },
];

describe("useFormFill", () => {
  it("更新欄位值後會反映在 values", () => {
    const { result } = renderHook(() => useFormFill({ fields: baseFields }));

    act(() => {
      result.current.handleChange("name", "王小明");
    });

    expect(result.current.values.name).toBe("王小明");
  });

  it("驗證失敗時會回傳欄位錯誤", () => {
    const { result } = renderHook(() => useFormFill({ fields: baseFields }));

    let isValid = true;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.name).toBe("此欄位為必填");
    expect(result.current.errors.agree).toBe("此欄位為必填");
  });

  it("驗證成功時觸發成功回呼且不清空 values", () => {
    const onSubmitSuccess = vi.fn();
    const { result } = renderHook(() =>
      useFormFill({ fields: baseFields, onSubmitSuccess })
    );

    act(() => {
      result.current.handleChange("name", "王小明");
      result.current.handleChange("agree", true);
    });

    act(() => {
      result.current.handleSubmit();
    });

    expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.values.name).toBe("王小明");
    expect(result.current.values.agree).toBe(true);
  });

  it("會忽略 schema 外的殘留值", () => {
    const { result } = renderHook(() =>
      useFormFill({
        fields: baseFields,
        initialValues: {
          name: "王小明",
          unknownField: "should-ignore",
        },
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.values.unknownField).toBe("should-ignore");
    expect(result.current.errors.unknownField).toBeUndefined();
  });
});
