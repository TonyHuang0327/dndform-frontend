"use client";

import type { FormField } from "@/types/form";
import {
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

const FieldLabel = ({ field }: { field: FormField }) => {
  return (
    <Grid
      size={2}
      sx={{
        borderRight: "1px solid black",
        display: "flex",
        p: 1,
        alignItems: "center",
      }}
    >
      <Typography id={`${field.id}-label`}>{field.label}</Typography>
    </Grid>
  );
};

export interface FormPreviewProps {
  fields: FormField[];
  formTitle: string;
}

function getSpan(field: FormField) {
  return Math.min(12, Math.max(1, field.span ?? 12));
}

function groupFieldsIntoRows(fields: FormField[]) {
  const rows: FormField[][] = [];
  let current: FormField[] = [];
  let used = 0;

  for (const field of fields) {
    const span = getSpan(field);
    if (used + span > 12 && current.length > 0) {
      rows.push(current);
      current = [];
      used = 0;
    }
    current.push(field);
    used += span;
    if (used === 12) {
      rows.push(current);
      current = [];
      used = 0;
    }
  }

  if (current.length > 0) rows.push(current);
  return rows;
}

function FieldBody({ field }: { field: FormField }) {
  if (field.type === "text" || field.type === "textarea" || field.type === "number") {
    return (
      <TextField
        fullWidth
        aria-labelledby={`${field.id}-label`}
        type={field.type === "number" ? "number" : "text"}
        multiline={field.type === "textarea"}
        minRows={field.type === "textarea" ? 3 : undefined}
        placeholder={field.placeholder}
        required={field.required}
        size="small"
        variant="outlined"
        sx={{
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          "& .Mui-focused": {
            backgroundColor: "aliceblue",
          },
          "& .MuiOutlinedInput-input": {
            padding: 0,
          },
          "& .MuiOutlinedInput-root": {
            padding: 0,
          },
        }}
      />
    );
  }

  if (field.type === "checkbox") {
    return (
      <Checkbox
        defaultChecked={field.defaultChecked}
        required={field.required}
        aria-labelledby={`${field.id}-label`}
      />
    );
  }

  if (field.type === "radio" && "options" in field) {
    return (
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
    );
  }

  if (field.type === "select" && "options" in field) {
    return (
      <Select
        defaultValue={field.options[0]?.value}
        aria-labelledby={`${field.id}-label`}
        required={field.required}
        size="small"
        sx={{
          "& .MuiOutlinedInput-notchedOutline": { border: "none" },
        }}
      >
        {field.options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    );
  }

  if (field.type === "ocr-list") {
    const selectedOcr = field.selectedOcr ?? [];
    if (selectedOcr.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          尚未選擇 OCR
        </Typography>
      );
    }

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {selectedOcr.map((ocr) => (
          <Typography key={ocr.id} variant="body1">
            {ocr.name}
          </Typography>
        ))}
      </Box>
    );
  }

  return null;
}

export default function FormPreview({ fields, formTitle }: FormPreviewProps) {
  if (fields.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          {formTitle}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid
      container
      spacing={0}
      sx={{
        borderBottom: "1px solid black",
        borderLeft: "1px solid black",
      }}
    >
      <Grid
        size={12}
        sx={{
          p: 1,
          borderTop: "1px solid black",
          borderRight: "1px solid black",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          {formTitle}
        </Typography>
      </Grid>
      {groupFieldsIntoRows(fields).map((row, rowIndex) => {
        const used = row.reduce((sum, f) => sum + getSpan(f), 0);
        const remaining = Math.max(0, 12 - used);

        return (
          <Grid
            key={`row-${rowIndex}`}
            container
            spacing={0}
            size={12}
            alignItems="stretch"
            sx={{
              borderTop: "1px solid black",
            }}
          >
            {row.map((field) => {
              const span = getSpan(field);
              const isOcrList = field.type === "ocr-list";
              const selectedOcr = isOcrList ? field.selectedOcr ?? [] : [];

              if (isOcrList && selectedOcr.length > 0) {
                return (
                  <Grid
                    key={field.id}
                    size={span}
                    sx={{
                      borderRight: "1px solid black",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {selectedOcr.map((ocr) => (
                      <Grid container spacing={0} key={ocr.id} sx={{ flex: 1 }}>
                        <Grid
                          size={2}
                          sx={{
                            borderRight: "1px solid black",
                            display: "flex",
                            p: 1,
                            alignItems: "center",
                          }}
                        >
                          <Typography>{field.label}</Typography>
                        </Grid>
                        <Grid size={10} sx={{ p: 1 }}>
                          <Typography variant="body1">{ocr.name}</Typography>
                        </Grid>
                      </Grid>
                    ))}
                  </Grid>
                );
              }

              return (
                <Grid
                  key={field.id}
                  container
                  spacing={0}
                  size={span}
                  sx={{
                    borderRight: "1px solid black",
                  }}
                >
                  <FieldLabel field={field} />
                  <Grid size={10} sx={{ p: 1 }}>
                    <FieldBody field={field} />
                  </Grid>
                </Grid>
              );
            })}

            {remaining > 0 && (
              <Grid
                size={remaining}
                sx={{
                  borderRight: "1px solid black",
                }}
              />
            )}
          </Grid>
        );
      })}
    </Grid>
  );
}
