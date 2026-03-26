# Slot 標題主導顯示設計

**日期**：2026-03-26  
**狀態**：待實作

---

## 需求摘要

目前欄位標題主要綁定在 `FormField.label`，並由欄位元件/預覽顯示。  
新需求改為：

1. 標題不再屬於欄位元件，改由版面配置的 slot（`LayoutColumn`）管理。
2. 在設計模式中，slot 標題由 `LayoutContainerItem` 的 inline 輸入框編輯。
3. 在預覽模式中，顯示 slot 標題；欄位元件本體只顯示控制項（checkbox/select/text...），不顯示標題。
4. 即使 slot 內沒有欄位，也需要看得到該 slot 標題。
5. 畫布頂層（非容器）欄位不顯示標題。
6. 一個 slot 共用一個標題（slot 內可放多個欄位）。

---

## 範圍與策略（路徑一）

採用低風險策略：

- 新增 `LayoutColumn.label` 作為正式標題來源。
- 保留 `FormField.label`（先不移除），但在 UI 顯示上不再使用。
- 既有欄位資料結構和屬性編輯邏輯盡量少動，避免大規模重構。

---

## 資料模型變更

檔案：`src/types/form.ts`

### `LayoutColumn` 新增欄位

```ts
export interface LayoutColumn {
  id: string;
  span: number;
  label: string;   // 新增
  fields: FormField[];
}
```

### `createLayoutContainer()` 預設值

建立容器時，每個 `column` 預設 `label: "標題"`。

---

## 元件與資料流調整

### 1) `LayoutContainerItem`

檔案：`src/components/LayoutContainerItem.tsx`

- 把目前 `TextField defaultValue="標題"` 改為受控：
  - `value={col.label}`
  - `onChange={(e) => onChangeColumnLabel(container.id, col.id, e.target.value)}`
- 為避免輸入時誤觸拖曳，輸入框加上：
  - `onMouseDown={(e) => e.stopPropagation()}`
  - `onPointerDown={(e) => e.stopPropagation()}`
- slot 內沒有欄位時，仍顯示該 slot 的標題輸入框。

### 2) `FormCanvas` / `FormBuilderContent`

檔案：`src/components/FormCanvas.tsx`、`src/components/FormBuilderContent.tsx`

- 新增 callback：
  - `onChangeColumnLabel(containerId, columnId, label)`
- 在 `FormBuilderContent` 中實作巢狀更新，僅更新目標 `LayoutContainer.columns[i].label`。

### 3) `FieldPropertyEditor`

檔案：`src/components/FieldPropertyEditor.tsx`

- 移除「標題」編輯欄位，避免與 slot inline 編輯重複。
- 保留：`required`、`placeholder`、`options`、`ocr-list` 等屬性編輯。

### 4) `FormPreview`

檔案：`src/components/FormPreview.tsx`

- 容器內欄位渲染：
  - 先渲染 slot 標題區（使用 `col.label`）
  - 再渲染 slot 內欄位控制項 (`FieldBody`)
- 欄位本體不再顯示標題（不使用 `FieldLabel`）。
- 畫布頂層（isFormField）欄位也不顯示標題，只顯示控制項。

---

## 可存取性（A11y）

因不再顯示 `FieldLabel`，`FieldBody` 內元件的可存取屬性需調整：

- 由 `aria-labelledby` 改為 `aria-label={slotLabel}`（容器內）
- 若是頂層欄位（無 slot label），使用合理 fallback（例如 `field.type` 或既有 `field.label`）

---

## 例外與邊界

1. **slot 內多欄位**：共用一個 slot 標題，不為每個欄位建立獨立標題。
2. **空 slot**：仍顯示標題與空狀態提示（如「拖入欄位」）。
3. **頂層欄位**：仍允許存在，但預覽不顯示標題。
4. **歷史資料相容**：舊資料沒有 `LayoutColumn.label` 時，渲染時 fallback `"標題"`，並在下一次編輯時補寫回 state。

---

## 驗收條件

1. 使用者可在 `LayoutContainerItem` 直接編輯 slot 標題。
2. slot 標題更新後，預覽頁立即同步顯示。
3. 預覽頁不再顯示欄位元件自帶標題（含容器內與頂層欄位）。
4. `FieldPropertyEditor` 不再有標題欄位。
5. `npx tsc --noEmit` 通過，且拖曳行為不回歸。

