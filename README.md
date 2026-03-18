# DndForm Frontend（拖拉式表單設計器）

使用 Next.js（App Router）打造的表單設計器前端，支援 **拖拉新增欄位**、**拖拉排序**、**欄位寬度（span）調整**、**即時預覽**與**列印 / 匯出 PDF**。

## 功能

- **拖拉新增**：從左側元件庫把欄位拖到畫布（可插入到指定位置）。
- **拖拉排序**：畫布內欄位支援拖曳即時重排。
- **版面配置**：欄位支援 `span`（1–12）控制每列寬度。
- **屬性編輯**：點選欄位後，右側抽屜（Drawer）顯示屬性編輯器。
- **預覽 / 列印**：切換到預覽模式可列印或儲存為 PDF（`react-to-print`）。

## 技術棧

- **Next.js** 16（App Router）
- **React** 19
- **MUI**（Material UI）
- **@dnd-kit/react**（新版 dnd-kit：`DragDropProvider` / `useDraggable` / `useDroppable` / `useSortable`）
- **@tanstack/react-query**（資料查詢；例如 OCR 列表）

## 開發環境需求

- Node.js（建議使用較新的 LTS 版本）
- npm

## 安裝與啟動

```bash
npm install
npm run dev
```

開啟 `http://localhost:3000`

## 使用方式（操作流程）

1. 進入「設計」模式後，從左側「元件庫」拖曳欄位到畫布。
2. 欄位可透過拖曳把手進行排序。
3. 點選欄位會在右側開啟「欄位屬性」抽屜，修改標題、必填、選項、OCR 列表等屬性。
4. 切換到「預覽」模式，可點擊「列印 / 儲存為PDF」輸出。

## 目錄結構

- `src/app/page.tsx`：入口頁，使用 dynamic import 載入設計器（避免 SSR 影響拖曳行為）。
- `src/components/FormBuilderContent.tsx`：主畫面（設計 / 預覽切換、拖曳事件處理）。
- `src/components/ComponentPalette.tsx`：左側元件庫（draggable source）。
- `src/components/FormCanvas.tsx`：畫布（droppable target）。
- `src/components/SortableFieldItem.tsx`：可排序欄位（sortable source/target + 拖曳把手）。
- `src/components/FieldPropertyEditor.tsx`：欄位屬性編輯內容（由 `Drawer` 承載顯示）。
- `src/components/FormPreview.tsx`：預覽渲染（含 `span` 分列與表格邊框處理）。
- `src/types/form.ts`：表單 schema 與欄位型別（`FormField` / `FormFieldType` / `createField()`）。

## 表單資料結構（Schema）

欄位型別與結構定義在 `src/types/form.ts`。簡化範例：

```ts
export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "radio"
  | "select"
  | "ocr-list";

export type FormField =
  | {
      id: string;
      type: "text" | "textarea" | "number";
      label: string;
      required?: boolean;
      span?: number;
      placeholder?: string;
    }
  | {
      id: string;
      type: "checkbox";
      label: string;
      required?: boolean;
      span?: number;
      defaultChecked?: boolean;
    }
  | {
      id: string;
      type: "radio" | "select";
      label: string;
      required?: boolean;
      span?: number;
      options: { value: string; label: string }[];
    }
  | {
      id: string;
      type: "ocr-list";
      label: string;
      required?: boolean;
      span?: number;
      selectedOcr?: { id: number; name: string }[];
    };
```

> `createField(type)` 會建立對應型別的預設欄位（含唯一 id）。

## 指令

```bash
npm run dev      # 開發模式
npm run build    # 建置
npm run start    # 以 production 模式啟動
npm run lint     # ESLint
```