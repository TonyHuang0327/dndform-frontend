import type { FormField } from "@/types/form";
import {
  Alert,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
} from "@mui/material";

import type { FormFillValue } from "../types";

interface FormFillFieldProps {
  field: FormField;
  value: FormFillValue;
  error?: string;
  onChange: (value: FormFillValue) => void;
}

export function FormFillField({
  field,
  value,
  error,
  onChange,
}: FormFillFieldProps) {
  const accessibleName = field.label?.trim()
    ? field.label
    : `未命名欄位-${field.id}`;
  const commonTextFieldProps = {
    fullWidth: true,
    required: Boolean(field.required),
    error: Boolean(error),
    helperText: error,
    placeholder: "請輸入",
    inputProps: { "aria-label": accessibleName },
  };

  switch (field.type) {
    case "text":
      return (
        <TextField
          {...commonTextFieldProps}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case "textarea":
      return (
        <TextField
          {...commonTextFieldProps}
          multiline
          minRows={3}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case "number":
      return (
        <TextField
          {...commonTextFieldProps}
          type="number"
          value={typeof value === "number" ? String(value) : ""}
          onChange={(event) => {
            const rawValue = event.target.value;
            onChange(rawValue === "" ? Number.NaN : Number(rawValue));
          }}
        />
      );
    case "checkbox":
      return (
        <FormControl error={Boolean(error)}>
          <Checkbox
            inputProps={{ "aria-label": accessibleName }}
            checked={value === true}
            onChange={(event) => onChange(event.target.checked)}
          />
          {error ? <FormHelperText>{error}</FormHelperText> : null}
        </FormControl>
      );
    case "radio":
      return (
        <FormControl error={Boolean(error)}>
          <RadioGroup
            aria-label={accessibleName}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
          >
            {field.options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
          {error ? <FormHelperText>{error}</FormHelperText> : null}
        </FormControl>
      );
    case "select":
      return (
        <FormControl error={Boolean(error)} fullWidth required={field.required}>
          <Select
            inputProps={{ "aria-label": accessibleName }}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
          >
            <MenuItem value="">
              <em>請選擇</em>
            </MenuItem>
            {field.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error ? <FormHelperText>{error}</FormHelperText> : null}
        </FormControl>
      );
    case "ocr-list": {
      const displayValue = Array.isArray(value) ? value.join(",") : "";
      return (
        <TextField
          fullWidth
          placeholder="請輸入 OCR（以逗號分隔）"
          inputProps={{ "aria-label": accessibleName }}
          value={displayValue}
          error={Boolean(error)}
          helperText={error}
          onChange={(event) => {
            const items = event.target.value
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item.length > 0);
            onChange(items);
          }}
        />
      );
    }
    default:
      return (
        <Stack spacing={1}>
          <Alert severity="warning">此欄位型別目前不支援填寫</Alert>
        </Stack>
      );
  }
}
