import type { CanvasItem } from "@/types/form";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FormFillRenderer } from "./FormFillRenderer";

describe("FormFillRenderer", () => {
  it("空 schema 會顯示提示且送出按鈕 disabled", () => {
    render(<FormFillRenderer items={[]} formTitle="測試表單" />);

    expect(screen.getByText("此表單目前沒有可填寫欄位")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "送出" })).toBeDisabled();
    expect(screen.getByText("測試表單")).toBeInTheDocument();
  });

  it("有欄位時可渲染並送出成功", () => {
    const onSubmitSuccess = vi.fn();
    const items: CanvasItem[] = [
      {
        id: "name",
        type: "text",
        label: "姓名",
        required: true,
        span: 12,
      },
    ];

    render(
      <FormFillRenderer
        items={items}
        formTitle="表單標題"
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText(/姓名/), {
      target: { value: "王小明" },
    });
    fireEvent.click(screen.getByRole("button", { name: "送出" }));

    expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
  });
});
