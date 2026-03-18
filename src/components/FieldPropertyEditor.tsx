"use client";

import {
  DEFAULT_OPTION,
  type FormField,
  type FormFieldOption,
} from "@/types/form";
import {
  Autocomplete,
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useOcrList } from "@/queries";

export interface FieldPropertyEditorProps {
  field: FormField;
  onChange: (id: string, patch: Partial<FormField>) => void;
}

export default function FieldPropertyEditor({
  field,
  onChange,
}: FieldPropertyEditorProps) {
  const id = field.id;

  function update(patch: Partial<FormField>) {
    onChange(id, patch);
  }

  const hasPlaceholder =
    field.type === "text" ||
    field.type === "textarea" ||
    field.type === "number";
  const hasOptions = field.type === "radio" || field.type === "select";
  const hasOcrList = field.type === "ocr-list";
  const { data: ocrList } = useOcrList();

  function handleOptionsChange(newOptions: FormFieldOption[]) {
    const options = newOptions.length === 0 ? [DEFAULT_OPTION] : newOptions;
    update({ options } as Partial<FormField>);
  }

  function updateOption(index: number, key: "value" | "label", value: string) {
    if (!hasOptions || !("options" in field)) return;
    const options = [...field.options];
    options[index] = { ...options[index], [key]: value };
    handleOptionsChange(options);
  }

  function removeOption(index: number) {
    if (!hasOptions || !("options" in field)) return;
    const options = field.options.filter((_, i) => i !== index);
    handleOptionsChange(options);
  }

  function addOption() {
    if (!hasOptions || !("options" in field)) return;

    const used = new Set(field.options.map((opt) => opt.value));
    let next = field.options.length + 1;
    while (used.has(`opt${next}`)) {
      next += 1;
    }

    handleOptionsChange([
      ...field.options,
      { value: `opt${next}`, label: `選項 ${next}` },
    ]);
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        屬性編輯
      </Typography>

      <TextField
        label="標題"
        size="small"
        value={field.label}
        onChange={(e) => update({ label: e.target.value })}
        fullWidth
      />
      {!hasOcrList && (
        <FormControlLabel
          control={
            <Checkbox
              checked={field.required ?? false}
              onChange={(e) => update({ required: e.target.checked })}
            />
          }
          label="必填"
        />
      )}

      {hasPlaceholder && (
        <TextField
          label="Placeholder"
          size="small"
          value={"placeholder" in field ? field.placeholder ?? "" : ""}
          onChange={(e) => update({ placeholder: e.target.value })}
          fullWidth
        />
      )}

      {field.type === "checkbox" && (
        <FormControlLabel
          control={
            <Checkbox
              checked={
                "defaultChecked" in field
                  ? field.defaultChecked ?? false
                  : false
              }
              onChange={(e) => update({ defaultChecked: e.target.checked })}
            />
          }
          label="預設勾選"
        />
      )}

      {hasOptions && "options" in field && (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
            選項（至少一項）
          </Typography>
          {field.options.map((opt, i) => (
            <Box
              key={opt.value}
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <TextField
                size="small"
                placeholder="value"
                value={opt.value}
                onChange={(e) => updateOption(i, "value", e.target.value)}
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                placeholder="label"
                value={opt.label}
                onChange={(e) => updateOption(i, "label", e.target.value)}
                sx={{ flex: 1 }}
              />
              <IconButton
                size="small"
                onClick={() => removeOption(i)}
                disabled={field.options.length <= 1}
                aria-label="刪除選項"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <IconButton size="small" onClick={addOption} aria-label="新增選項">
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      {hasOcrList && (
        <Autocomplete
          options={(ocrList ?? []).map((ocr) => ({
            label: ocr.name,
            value: ocr.id,
          }))}
          renderInput={(params) => <TextField {...params} label="OCR列表" />}
          multiple
          value={(field.selectedOcr ?? []).map((ocr) => ({
            label: ocr.name,
            value: ocr.id,
          }))}
          onChange={(_, newValue) =>
            update({
              selectedOcr: newValue.map((opt) => ({
                id: opt.value,
                name: opt.label,
              })),
            })
          }
          isOptionEqualToValue={(option, value) => option.value === value.value}
        />
      )}
    </Box>
  );
}
