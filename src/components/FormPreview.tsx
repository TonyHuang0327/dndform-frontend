"use client";

import type { FormField } from "@/types/form";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";

export interface FormPreviewProps {
  fields: FormField[];
}

export default function FormPreview({ fields }: FormPreviewProps) {
  if (fields.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          尚無欄位，請在設計模式從左側加入。
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {fields.map((field) => {
        if (
          field.type === "text" ||
          field.type === "textarea" ||
          field.type === "number"
        ) {
          return (
            <TextField
              key={field.id}
              label={field.label}
              type={field.type === "number" ? "number" : "text"}
              multiline={field.type === "textarea"}
              placeholder={field.placeholder}
              required={field.required}
              size="small"
              fullWidth
            />
          );
        }

        if (field.type === "checkbox") {
          return (
            <FormControlLabel
              key={field.id}
              control={
                <Checkbox
                  defaultChecked={field.defaultChecked}
                  required={field.required}
                />
              }
              label={field.label}
            />
          );
        }

        if (field.type === "radio" && "options" in field) {
          return (
            <FormControl key={field.id}>
              <FormLabel id={`${field.id}-label`}>{field.label}</FormLabel>
              <RadioGroup
                defaultValue={field.options[0]?.value}
                aria-labelledby={`${field.id}-label`}
              >
                {field.options.map((opt) => (
                  <FormControlLabel
                    key={opt.value}
                    value={opt.value}
                    control={<Radio required={field.required} />}
                    label={opt.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          );
        }

        if (field.type === "select" && "options" in field) {
          return (
            <FormControl key={field.id} size="small" fullWidth>
              <InputLabel id={`${field.id}-label`}>{field.label}</InputLabel>
              <Select
                labelId={`${field.id}-label`}
                defaultValue={field.options[0]?.value ?? ""}
                displayEmpty
                required={field.required}
              >
                {field.options.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        }

        return null;
      })}
    </Box>
  );
}
