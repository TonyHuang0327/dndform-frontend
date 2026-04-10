import type { FormSchema } from "../types";

export const MOCK_FORM_SCHEMA_ID = "mock-internal-001";

const mockFormSchemas: Record<string, FormSchema> = {
  [MOCK_FORM_SCHEMA_ID]: {
    schemaVersion: 1,
    meta: {
      exportedAt: "2026-04-09T10:11:09.663Z",
      source: "dndform-frontend",
    },
    formTitle: "未命名表單",
    items: [
      {
        id: "40b711da-7f7e-453e-8510-4322d8106314",
        type: "layout",
        variant: "labeled",
        columns: [
          {
            id: "4b3feebc-448d-4450-9f0e-b35d6d0f7bf2",
            span: 12,
            label: "標題",
            fields: [
              {
                id: "28011cd8-0b90-4e9b-a4d6-4fb6e21ee309",
                type: "text",
                label: "單行文字",
                required: false,
                placeholder: "",
                span: 12,
              },
            ],
          },
        ],
      },
      {
        id: "ba1cf231-dce6-48a6-8a4a-60c4ce36234d",
        type: "layout",
        variant: "labeled",
        columns: [
          {
            id: "1c328456-e42c-450b-a84b-ae58a42dde01",
            span: 6,
            label: "標題",
            fields: [
              {
                id: "527f3f42-c4af-4da7-ab7f-cd3b68c46b06",
                type: "select",
                label: "下拉選單",
                required: false,
                options: [{ value: "opt1", label: "選項 1" }],
                span: 12,
              },
            ],
          },
          {
            id: "06010613-5f94-4600-b5f9-0907ae571992",
            span: 6,
            label: "標題",
            fields: [
              {
                id: "f7b22acd-8c95-4a05-8f94-8d2ea2dcb585",
                type: "checkbox",
                label: "勾選框",
                required: false,
                defaultChecked: false,
                span: 12,
              },
            ],
          },
        ],
      },
      {
        id: "c33a35a9-0e1a-4d77-99c5-14362d8e4a2e",
        type: "labeled-input",
        label: "標題方塊",
        span: 12,
        required: false,
      },
      {
        id: "5f34d9ab-88e7-4ab0-b2a1-b7aef55c2581",
        type: "textarea",
        label: "多行文字",
        required: false,
        placeholder: "",
        span: 12,
      },
      {
        id: "6c893831-a294-4b9a-8745-717094c1e9c5",
        type: "layout",
        variant: "plain",
        columns: [
          {
            id: "aae54637-a17a-4181-90e9-b03d25f1d389",
            span: 12,
            label: "",
            fields: [
              {
                id: "46350dd7-5cce-4d78-a01d-39beaababd6e",
                type: "radio",
                label: "單選",
                required: false,
                options: [{ value: "opt1", label: "選項 1" }],
                span: 12,
              },
            ],
          },
        ],
      },
      {
        id: "c4f6509d-a959-4113-8135-bd543b195085",
        type: "layout",
        variant: "plain",
        columns: [
          {
            id: "96c5c18d-88b5-4dd1-a88e-5233330ff68b",
            span: 6,
            label: "",
            fields: [
              {
                id: "2c5c62b5-c487-40bd-ba4f-6ab58a6bba5a",
                type: "checkbox",
                label: "勾選框",
                required: false,
                defaultChecked: false,
                span: 12,
              },
            ],
          },
          {
            id: "da7500e8-f208-4c07-a559-4e1a647f9a54",
            span: 6,
            label: "",
            fields: [
              {
                id: "fd0b36ae-4e6e-4b7e-b3a8-f0e9513089b8",
                type: "number",
                label: "數字",
                required: false,
                placeholder: "",
                span: 12,
              },
            ],
          },
        ],
      },
    ],
  },
};

export function getMockFormSchemaById(formId: string): FormSchema | null {
  return mockFormSchemas[formId] ?? null;
}
