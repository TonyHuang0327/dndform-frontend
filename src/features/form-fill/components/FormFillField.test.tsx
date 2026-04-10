import type { FormField } from "@/types/form";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FormFillField } from "./FormFillField";

function renderField(field: FormField, value: unknown = "", error?: string) {
  const onChange = vi.fn();

  render(
    <FormFillField
      field={field}
      value={value}
      error={error}
      onChange={onChange}
    />
  );

  return { onChange };
}

describe("FormFillField", () => {
  it("可渲染 text 與 textarea 欄位", () => {
    renderField({
      id: "name",
      type: "text",
      label: "姓名",
      required: true,
      span: 12,
    });
    expect(screen.getByLabelText(/姓名/)).toBeInTheDocument();

    renderField({
      id: "note",
      type: "textarea",
      label: "備註",
      required: false,
      span: 12,
    });
    expect(screen.getByLabelText(/備註/)).toBeInTheDocument();
  });

  it("可渲染 number/checkbox/radio/select/ocr-list 欄位並觸發 onChange", () => {
    const numberField: FormField = {
      id: "amount",
      type: "number",
      label: "金額",
      required: true,
      span: 12,
    };
    const { onChange: onNumberChange } = renderField(numberField, 0);
    fireEvent.change(screen.getByLabelText(/金額/), { target: { value: "100" } });
    expect(onNumberChange).toHaveBeenCalledWith(100);

    const checkboxField: FormField = {
      id: "agree",
      type: "checkbox",
      label: "同意條款",
      required: true,
      span: 12,
    };
    const { onChange: onCheckboxChange } = renderField(checkboxField, false);
    fireEvent.click(screen.getByLabelText("同意條款"));
    expect(onCheckboxChange).toHaveBeenCalledWith(true);

    const radioField: FormField = {
      id: "gender",
      type: "radio",
      label: "性別",
      required: false,
      span: 12,
      options: [
        { value: "m", label: "男" },
        { value: "f", label: "女" },
      ],
    };
    const { onChange: onRadioChange } = renderField(radioField, "");
    fireEvent.click(screen.getByLabelText("男"));
    expect(onRadioChange).toHaveBeenCalledWith("m");

    const selectField: FormField = {
      id: "dept",
      type: "select",
      label: "部門",
      required: false,
      span: 12,
      options: [
        { value: "it", label: "資訊部" },
        { value: "hr", label: "人資部" },
      ],
    };
    const { onChange: onSelectChange } = renderField(selectField, "");
    fireEvent.change(screen.getByRole("combobox", { name: /部門/ }), {
      target: { value: "it" },
    });
    expect(onSelectChange).toHaveBeenCalledWith("it");

    const ocrField: FormField = {
      id: "ocr",
      type: "ocr-list",
      label: "OCR",
      required: false,
      span: 12,
    };
    const { onChange: onOcrChange } = renderField(ocrField, []);
    fireEvent.change(screen.getByLabelText("OCR"), {
      target: { value: "a,b" },
    });
    expect(onOcrChange).toHaveBeenCalledWith(["a", "b"]);
  });

  it("欄位錯誤只顯示於該欄位下方", () => {
    renderField(
      {
        id: "name",
        type: "text",
        label: "姓名",
        required: true,
        span: 12,
      },
      "",
      "此欄位為必填"
    );

    expect(screen.getByText("此欄位為必填")).toBeInTheDocument();
  });

  it("未知欄位型別會顯示降級提示", () => {
    const unknownField = {
      id: "unknown",
      type: "unknown-type",
      label: "未知",
      required: false,
      span: 12,
    } as unknown as FormField;

    renderField(unknownField);
    expect(screen.getByText("此欄位型別目前不支援填寫")).toBeInTheDocument();
  });
});
