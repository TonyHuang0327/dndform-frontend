# 拖拉表單設計器 MVP — 實作計畫

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在 dndform-frontend 單頁內實作表單設計器：左側元件庫拖拉到畫布、畫布內排序、設計/預覽切換、匯出 JSON。

**Architecture:** 單頁 (src/app/page.tsx) 持有一份 fields state，外層包 DndContext；左側 ComponentPalette（useDraggable），右側 FormCanvas（useDroppable + SortableContext）；onDragEnd 區分「從 palette 新增」與「畫布內排序」。預覽模式用 FormPreview 渲染 MUI 表單並提供匯出按鈕。

**Tech Stack:** Next.js 16 App Router、React 19、TypeScript、MUI、@dnd-kit/core、@dnd-kit/sortable、@dnd-kit/utilities。

---

## Task 1: 安裝 @dnd-kit 依賴

**Files:**
- Modify: `package.json`（依賴由 npm 更新）

**Step 1: 安裝套件**

```bash
cd /Users/user/Desktop/practice/dndform-frontend && npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Step 2: 確認安裝**

```bash
npm ls @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Expected: 三個套件皆列出、無 UNMET DEPENDENCY。

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @dnd-kit for form builder drag-and-drop"
```

---

## Task 2: 定義表單欄位型別與預設值工廠

**Files:**
- Create: `src/types/form.ts`

**Step 1: 新增型別定義與 createField**

在 `src/types/form.ts` 中定義：

- `FormFieldType = 'text' | 'textarea' | 'number' | 'checkbox' | 'radio' | 'select'`
- `FormField` 介面：`id`, `type`, `label`, `required?`, 以及依 type 的 `placeholder?`, `defaultChecked?`, `options?`
- `createField(type: FormFieldType): FormField`：用 `crypto.randomUUID()` 產生 id，依 type 給預設 label 與 options（radio/select 至少一項）

**Step 2: 手動驗證**

在 `src/app/page.tsx` 暫時 import `createField` 並 `console.log(createField('text'))`，執行 `npm run dev`，打開首頁看 console 有輸出一筆含 id、type、label 的物件。

**Step 3: 移除暫時的 console.log**

**Step 4: Commit**

```bash
git add src/types/form.ts src/app/page.tsx
git commit -m "feat: add FormField types and createField factory"
```

---

## Task 3: 左側元件庫 ComponentPalette

**Files:**
- Create: `src/components/ComponentPalette.tsx`

**Step 1: 實作 ComponentPalette**

- 使用 MUI `List`/`ListItem` 或 `Stack` 列出六種類型：單行文字、多行文字、數字、勾選框、單選、下拉選單。
- 每個項目用 `useDraggable`，`data` 設為 `{ type: FormFieldType, source: 'palette' }`，`id` 可用 `palette-${type}`。
- 顯示對應中文標籤（如「單行文字」），樣式可為可拖拉的卡片或按鈕。

**Step 2: 手動驗證**

在 `page.tsx` 用 `DndContext` 包住一個簡單的 `onDragEnd`（只 console.log），渲染 `ComponentPalette`，執行 `npm run dev`，拖動左側項目應在 console 看到 drag end 事件。

**Step 3: Commit**

```bash
git add src/components/ComponentPalette.tsx src/app/page.tsx
git commit -m "feat: add ComponentPalette with useDraggable items"
```

---

## Task 4: 畫布 FormCanvas（Droppable + Sortable）

**Files:**
- Create: `src/components/FormCanvas.tsx`
- Create: `src/components/SortableFieldItem.tsx`

**Step 1: 實作 SortableFieldItem**

- 接收 `field: FormField`、`isSelected`、`onSelect`、`onChange`。
- 使用 `useSortable({ id: field.id })`，用 `attributes`、`listeners`、`setNodeRef`、`style` 包一層 MUI Card/Paper。
- 顯示 `field.label`（或 type 對應的簡稱），點擊時 `onSelect(field.id)`；若 `isSelected` 顯示邊框或高亮。

**Step 2: 實作 FormCanvas**

- 接收 `fields`、`selectedId`、`onSelect`、`onChange`、`onReorder`。
- 使用 `useDroppable({ id: 'canvas' })`，內層用 `SortableContext`、`verticalListSortingStrategy`、`items: fields.map(f => f.id)`。
- 依 `fields` 順序渲染多個 `SortableFieldItem`；畫布為空時顯示「從左側拖入欄位」提示。

**Step 3: 手動驗證**

在 page 中維護 `fields` state 與 `selectedId`，`onDragEnd` 中實作：從 palette 拖入則 `setFields([...fields, createField(type)])`；從畫布內拖則用 `arrayMove` 更新順序。確認可拖入並可排序。

**Step 4: Commit**

```bash
git add src/components/FormCanvas.tsx src/components/SortableFieldItem.tsx src/app/page.tsx
git commit -m "feat: add FormCanvas with sortable field items"
```

---

## Task 5: 欄位屬性編輯（畫布上選取後編輯）

**Files:**
- Modify: `src/components/SortableFieldItem.tsx` 或新建 `src/components/FieldPropertyEditor.tsx`
- Modify: `src/app/page.tsx`

**Step 1: 屬性編輯 UI**

- 當 `selectedId` 有值時，在畫布上方或側邊顯示所選欄位的編輯區：label（TextField）、placeholder（若為 text/textarea/number）、required（Checkbox）、options（radio/select 時為可編輯的 key-value 列表，至少一項）。
- 變更時呼叫 `onChange(fieldId, partial)` 更新對應欄位。

**Step 2: 選項至少一項**

- 若使用者刪除到 0 項，自動補回一筆預設選項（如 `{ value: 'opt1', label: '選項 1' }`）。

**Step 3: 手動驗證**

拖入單選或下拉欄位，選取後修改 label、新增/刪除選項，確認 state 更新且畫布上顯示正確。

**Step 4: Commit**

```bash
git add src/components/FieldPropertyEditor.tsx src/components/SortableFieldItem.tsx src/app/page.tsx
git commit -m "feat: add field property editor for label, placeholder, options"
```

---

## Task 6: 設計 / 預覽模式切換與 FormPreview

**Files:**
- Create: `src/components/FormPreview.tsx`
- Modify: `src/app/page.tsx`

**Step 1: FormPreview 元件**

- 接收 `fields: FormField[]`。
- 若 `fields.length === 0` 顯示「尚無欄位，請在設計模式從左側加入」。
- 否則依 `field.type` 用 MUI 渲染：TextField（text/textarea/number）、FormControlLabel+Checkbox、RadioGroup、Select 等；綁定到本地 state 或 uncontrolled，不實作送出 API。

**Step 2: 模式切換**

- 在頁面頂部或工具列加入 ToggleButtonGroup 或 Tabs：「設計」「預覽」。
- 設計模式：顯示 ComponentPalette + FormCanvas + 屬性編輯。
- 預覽模式：只顯示 FormPreview。

**Step 3: 手動驗證**

切換到預覽模式，確認表單依欄位正確渲染；空畫布時顯示空狀態提示。

**Step 4: Commit**

```bash
git add src/components/FormPreview.tsx src/app/page.tsx
git commit -m "feat: add design/preview mode and FormPreview"
```

---

## Task 7: 匯出 JSON 按鈕

**Files:**
- Modify: `src/components/FormPreview.tsx` 或 `src/app/page.tsx`（若按鈕放在頁面層）

**Step 1: 匯出行為**

- 在預覽模式顯示「匯出 JSON」按鈕。
- 點擊後以 `JSON.stringify(fields, null, 2)` 產出字串，可：複製到剪貼簿（navigator.clipboard.writeText）或觸發下載（Blob + a.download）。

**Step 2: 手動驗證**

設計幾個欄位後切到預覽，點匯出，確認 JSON 結構與設計文件中的 schema 一致（含 id、type、label、options 等）。

**Step 3: Commit**

```bash
git add src/components/FormPreview.tsx src/app/page.tsx
git commit -m "feat: add export JSON in preview mode"
```

---

## Task 8: 畫布上刪除欄位（可選，YAGNI 可略）

**Files:**
- Modify: `src/components/SortableFieldItem.tsx`
- Modify: `src/app/page.tsx`

**Step 1: 刪除按鈕**

- 在每個 SortableFieldItem 上（或選取時）顯示「刪除」按鈕，點擊時從 `fields` 中移除該 id；若該項為 selected，清空 `selectedId`。

**Step 2: Commit**

```bash
git add src/components/SortableFieldItem.tsx src/app/page.tsx
git commit -m "feat: allow removing field from canvas"
```

---

## Execution Handoff

計畫已寫入 `docs/plans/2025-03-06-dnd-form-builder.md`。

**兩種執行方式：**

1. **Subagent-Driven（本 session）** — 依任務派出子 agent，每任務後審查，迭代快。  
   - **必要子技能：** 使用 superpowers:subagent-driven-development

2. **平行 session（另開）** — 在 worktree 開新 session，用 executing-plans 依檢查點批次執行。  
   - 新 session 需使用 superpowers:executing-plans

請選擇要用哪一種。
