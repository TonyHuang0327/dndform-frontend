import type { FormSchema } from "../types";

export const MOCK_FORM_SCHEMA_ID = "mock-internal-001";

const mockFormSchemas: FormSchema[] = [
  {
    id: MOCK_FORM_SCHEMA_ID,
    name: "內部填寫假表單",
    fields: [
      {
        id: "f-applicant-name",
        type: "text",
        label: "申請人姓名",
        required: true,
        span: 6,
        placeholder: "請輸入姓名",
      },
      {
        id: "f-phone",
        type: "text",
        label: "聯絡電話",
        required: true,
        span: 6,
        placeholder: "請輸入聯絡電話",
      },
      {
        id: "f-amount",
        type: "number",
        label: "申請金額",
        required: true,
        span: 6,
        placeholder: "請輸入數字",
      },
      {
        id: "f-department",
        type: "select",
        label: "部門",
        required: true,
        span: 6,
        options: [
          { value: "it", label: "資訊部" },
          { value: "hr", label: "人資部" },
          { value: "ops", label: "營運部" },
        ],
      },
      {
        id: "f-note",
        type: "textarea",
        label: "備註",
        required: false,
        span: 12,
        placeholder: "請填寫補充說明",
      },
    ],
  },
];

export function getMockFormSchemaById(formId: string): FormSchema | null {
  return mockFormSchemas.find((schema) => schema.id === formId) ?? null;
}
