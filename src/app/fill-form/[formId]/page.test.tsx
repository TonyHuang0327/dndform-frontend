import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FormFillPageContent } from "@/features/form-fill/components/FormFillPageContent";

vi.mock("@/features/form-fill/mocks/mockFormSchemas", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/form-fill/mocks/mockFormSchemas")
  >("@/features/form-fill/mocks/mockFormSchemas");

  return {
    ...actual,
    getMockFormSchemaById: vi.fn(actual.getMockFormSchemaById),
  };
});

import { getMockFormSchemaById, MOCK_FORM_SCHEMA_ID } from "@/features/form-fill/mocks/mockFormSchemas";

describe("fill-form/[formId] page", () => {
  it("formId 命中時可渲染填寫頁並成功送出", () => {
    render(<FormFillPageContent formId={MOCK_FORM_SCHEMA_ID} />);

    fireEvent.change(screen.getByLabelText(/單行文字/), {
      target: { value: "王小明" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: /下拉選單/ }), {
      target: { value: "opt1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "送出" }));

    expect(screen.getByText("送出成功")).toBeInTheDocument();
    expect(screen.getByLabelText(/單行文字/)).toHaveValue("王小明");
  });

  it("formId 未命中時顯示查無表單", () => {
    render(<FormFillPageContent formId="not-exists" />);
    expect(screen.getByText("查無表單")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回首頁" })).toBeInTheDocument();
  });

  it("schema 不合法時顯示資料異常提示", () => {
    vi.mocked(getMockFormSchemaById).mockReturnValueOnce({
      schemaVersion: 1,
      meta: {
        exportedAt: "2026-04-09T10:11:09.663Z",
        source: "dndform-frontend",
      },
      formTitle: "壞掉資料",
      items: [
        {
          id: "dup",
          type: "text",
          label: "欄位 A",
          span: 12,
        },
        {
          id: "dup",
          type: "text",
          label: "欄位 B",
          span: 12,
        },
      ],
    });

    render(<FormFillPageContent formId={MOCK_FORM_SCHEMA_ID} />);
    expect(screen.getByText("表單資料格式異常，請稍後再試")).toBeInTheDocument();
  });
});
