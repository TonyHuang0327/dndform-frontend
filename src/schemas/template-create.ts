import { z } from "zod";

/** 新增模板 POST body（與後端契約一致） */
export const templateCreateBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "請輸入名稱")
    .max(120, "名稱最多 120 字"),
  description: z.string().trim().max(2000, "說明最多 2000 字"),
  canEdit: z.boolean(),
});

export type TemplateCreateBody = z.infer<typeof templateCreateBodySchema>;
