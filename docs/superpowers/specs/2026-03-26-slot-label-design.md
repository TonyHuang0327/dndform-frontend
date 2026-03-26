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

### `LayoutColumn` 新增欄位（過渡期）

```ts
export interface LayoutColumn {
  id: string;
  span: number;
  label?: string;   // 新增（過渡期 optional，避免舊資料載入失敗）
  fields: FormField[];
}
```

### `createLayoutContainer()` 預設值

建立容器時，每個 `column` 預設 `label: "標題"`。

### 舊資料 migration（唯一策略）

- 在載入 items（或初始化 setItems）時統一做一次 migration：
  - 若 `col.label` 缺失，補 `"標題"` 後再寫回 state。
- **唯一策略**：只採用「載入時一次補值」；不使用「下一次編輯才補值」。
- 本專案本次實作的觸發點：`FormBuilderContent` 中 `useState` 初始化後，第一個 `useEffect` 針對當前 `items` 做一次 normalize（若已完整則不變更）。

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

- 主要策略：統一使用 `aria-label`（不使用 `aria-labelledby`）以降低結構耦合。
- 需避免重名：
  - 規則：`controlAriaLabel = effectiveSlotLabel + "-" + 欄位類型 + "-" + 序號`
  - 範例：`聯絡資訊-checkbox-1`
- `effectiveSlotLabel` 定義：
  - `col.label.trim() !== ""` 時使用 `col.label`
  - `col.label` 為空字串時 fallback `"未命名欄位"`
- `序號` 定義：
  - 採「**slot 內欄位順序**（1-based）」計算
  - 每次 slot 內排序改變後即重算
  - 作用域為「單一 column」：每個 `column.fields` 各自從 1 開始計算。
- `radio` / `select` 同樣使用 `aria-label`，規則一致。
  - `radio`：掛在 `RadioGroup` 根節點。
  - `select`：掛在 `Select` 根節點。
  - option 本身不額外覆寫 `aria-label`。
- 若是頂層欄位（無 slot label），fallback：`field.type + "-" + topLevelFieldOrder`。
  - `topLevelFieldOrder` 定義：僅計算頂層 `isFormField(item)` 的 1-based 順序，不包含容器。
- `欄位類型` 字串來源統一使用 `field.type`（英文代碼），避免多語系字串造成不一致。

## 設計模式顯示規則

- 此需求只變更「標題來源」與「預覽顯示」。
- 設計模式中，`SortableFieldItem` 文字顯示改用 `DEFAULT_LABELS[field.type]`（型別名），不使用 `field.label`。
- `field.label` 僅作過渡資料欄位保留，不作 UI 顯示依據。
- `onChangeColumnLabel(containerId, columnId, label)`：label 原樣保存，不自動 `trim`、不自動回填預設值。

## Preview 版面結構（固定）

- 每個 slot 由兩段組成：
  1) slot 標題列（固定在上方，邊框沿用現有表格線）
  2) slot 內容區（下方渲染控制項或空狀態）
- 空 slot 仍渲染 1) + 2)，其中內容區顯示空狀態提示。
- print/PDF 與 preview 共用同一個 `FormPreview` 渲染流程，不分支。

---

## 例外與邊界

1. **slot 內多欄位**：共用一個 slot 標題，不為每個欄位建立獨立標題。
2. **空 slot**：仍顯示標題與空狀態提示（如「拖入欄位」）。
3. **頂層欄位**：仍允許存在，但預覽不顯示標題。
4. **歷史資料相容**：舊資料沒有 `LayoutColumn.label` 時，載入時 migration 立即補 `"標題"` 並寫回 state。
5. **空標題值**：`col.label === ""` 時，preview 顯示空白標題區（不自動回填「標題」），以反映使用者輸入。
6. **列印一致性**：preview 與 print/PDF 共用同一渲染入口（`FormPreview`），使用同一套 slot 標題顯示規則。

---

## 驗收條件

1. 使用者可在 `LayoutContainerItem` 直接編輯 slot 標題。
2. slot 標題更新後，預覽頁立即同步顯示。
3. 預覽頁不再顯示欄位元件自帶標題（含容器內與頂層欄位）。
4. `FieldPropertyEditor` 不再有標題欄位。
5. 舊資料（無 `col.label`）載入不報錯，且可正常看到 slot 標題（migration 生效）。
6. 多個控制項在同一 slot 內，a11y 名稱不重複（依命名規則）。
7. `npx tsc --noEmit` 通過，且拖曳行為不回歸。

