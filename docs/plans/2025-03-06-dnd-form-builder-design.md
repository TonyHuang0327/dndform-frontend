# 拖拉表單設計器 MVP — 設計文件

**日期：** 2025-03-06  
**專案：** dndform-frontend

---

## 1. 目標與範圍

- **目標：** 實作一個表單設計器 MVP，使用者從左側元件庫拖拉欄位到畫布組裝表單，可產出表單結構 JSON，並在預覽模式中渲染成可填寫的表單。
- **範圍：** 單頁、設計模式 + 預覽模式、匯出 JSON；不接後端、不強制存檔。

---

## 2. 架構與畫面流程

- **技術棧：** Next.js 16 App Router、React 19、TypeScript、MUI、Emotion；新增 `@dnd-kit/core`、`@dnd-kit/sortable`、`@dnd-kit/utilities`。
- **單頁結構：**
  - **左側元件庫：** 六種欄位類型（單行文字、多行文字、單選、數字、勾選框、下拉選單），每個為可拖拉的範本。
  - **右側畫布：** 接受從左側拖入的欄位，並支援畫布內拖拉排序；欄位可選取並編輯標題、placeholder、選項等。
- **模式切換：** 工具列「設計」/「預覽」切換。設計模式顯示元件庫與可編輯畫布；預覽模式僅渲染可填寫表單，並提供「匯出 JSON」按鈕。
- **資料：** 表單結構存於 React state（欄位陣列），預覽與匯出共用同一份；MVP 不接後端。

---

## 3. 資料結構與元件切分

### 3.1 欄位 Schema

- 共用欄位：`id`（唯一）、`type`、`label`、`required?`
- `type`: `'text' | 'textarea' | 'number' | 'checkbox' | 'radio' | 'select'`
- 依類型：text/textarea 可有 `placeholder`；number 可有 `placeholder`；checkbox 可有 `defaultChecked`；radio/select 必有 `options: { value, label }[]`，至少一項。

### 3.2 元件切分

- **狀態：** 上層維護 `fields: Field[]`、`setFields`。
- **ComponentPalette：** 左側元件庫，六個 `useDraggable` 項，`data` 帶 `{ type, source: 'palette' }`。
- **FormCanvas：** 畫布，`useDroppable` + `SortableContext`（verticalListSortingStrategy），每個欄位為 `SortableFieldItem`（`useSortable`），可選取並編輯屬性。
- **DndContext：** 包住整頁，`onDragEnd` 區分：從 palette 拖入則 push 新欄位；畫布內拖則 `arrayMove` 更新順序。
- **FormPreview：** 依 `fields` 用 MUI 元件渲染唯填表單；匯出 JSON 為 `JSON.stringify(fields, null, 2)`。

---

## 4. 錯誤處理與邊界

- 空畫布：預覽時提示「尚無欄位」；匯出可為 `[]`。
- 單選/下拉：選項至少一項；刪到 0 時自動補一筆預設選項。
- ID：新增時用 `crypto.randomUUID()` 或遞增 id 保證唯一。
- 拖拉取消：`over === null` 時不更新 state。
- MVP 不做：必填驗證阻擋送出、刪除欄位二次確認、JSON 匯入還原。

---

## 5. 核准紀錄

- 4.1 架構與畫面流程 — 使用者 OK  
- 4.2 資料結構與元件切分 — 使用者 OK  
- 4.3 錯誤處理與邊界 — 使用者 OK  

下一步：依 writing-plans 產出實作計畫並執行。
