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
import { Fragment } from "react";

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
      {fields.map((field) => {
        if (
          field.type === "text" ||
          field.type === "textarea" ||
          field.type === "number"
        ) {
          return (
            <Grid
              container
              spacing={0}
              key={field.id}
              size={field.span ?? 12}
              sx={{
                borderTop: "1px solid black",
                borderRight: "1px solid black",
              }}
            >
              <FieldLabel field={field} />
              <Grid
                size={10}
                sx={{
                  p: 1,
                }}
              >
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
                  }}
                />
              </Grid>
            </Grid>
          );
        }

        if (field.type === "checkbox") {
          return (
            <Grid
              key={field.id}
              sx={{
                borderTop: "1px solid black",
                borderRight: "1px solid black",
              }}
              size={field.span ?? 12}
              spacing={0}
              container
            >
              <FieldLabel field={field} />
              <Grid
                size={10}
                sx={{
                  p: 1,
                }}
              >
                <Checkbox
                  defaultChecked={field.defaultChecked}
                  required={field.required}
                  aria-labelledby={`${field.id}-label`}
                />
              </Grid>
            </Grid>
          );
        }

        if (field.type === "radio" && "options" in field) {
          return (
            <Grid
              key={field.id}
              sx={{
                borderTop: "1px solid black",
                borderRight: "1px solid black",
              }}
              size={field.span ?? 12}
              spacing={0}
              container
            >
              <FieldLabel field={field} />
              <Grid
                size={10}
                sx={{
                  p: 1,
                }}
              >
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
              </Grid>
            </Grid>
          );
        }

        if (field.type === "select" && "options" in field) {
          return (
            <Grid
              key={field.id}
              sx={{
                borderTop: "1px solid black",
                borderRight: "1px solid black",
              }}
              size={field.span ?? 12}
              spacing={0}
              container
            >
              <FieldLabel field={field} />
              <Grid
                size={10}
                sx={{
                  p: 1,
                }}
              >
                <Select
                  defaultValue={field.options[0]?.value}
                  aria-labelledby={`${field.id}-label`}
                  required={field.required}
                >
                  {field.options.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>
          );
        }
        if (field.type === "ocr-list") {
          const selectedOcr = field.selectedOcr ?? [];
          if (selectedOcr.length === 0) {
            return (
              <Grid
                container
                spacing={0}
                key={field.id}
                size={field.span ?? 12}
                sx={{
                  borderTop: "1px solid black",
                  borderRight: "1px solid black",
                }}
              >
                <FieldLabel field={field} />
                <Grid size={10} sx={{ p: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    尚未選擇 OCR
                  </Typography>
                </Grid>
              </Grid>
            );
          }
          return (
            <Fragment key={field.id}>
              {selectedOcr.map((ocr) => (
                <Grid
                  container
                  spacing={0}
                  key={ocr.id}
                  size={field.span ?? 12}
                  sx={{
                    borderTop: "1px solid black",
                    borderRight: "1px solid black",
                  }}
                >
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
            </Fragment>
          );
        }

        return null;
      })}
    </Grid>
  );
}
