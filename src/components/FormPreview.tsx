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
  Grid,
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        borderTop: "1px solid black",
        borderRight: "1px solid black",
        borderLeft: "1px solid black",
      }}
    >
      {fields.map((field) => {
        if (
          field.type === "text" ||
          field.type === "textarea" ||
          field.type === "number"
        ) {
          return (
            <Grid
              container
              key={field.id}
              sx={{ borderBottom: "1px solid black", width: "100%" }}
            >
              <Grid
                size={2}
                sx={{
                  borderRight: "1px solid black",
                  display: "flex",
                  pl: 1,
                  alignItems: "center",
                }}
              >
                <Typography>{field.label}</Typography>
              </Grid>
              <Grid size={9} sx={{ p: 1 }}>
                <TextField
                  fullWidth
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
                  }}
                />
              </Grid>
            </Grid>
          );
        }

        if (field.type === "checkbox") {
          return (
            <Grid
              container
              key={field.id}
              sx={{ borderBottom: "1px solid black", width: "100%" }}
            >
              <Grid
                size={2}
                sx={{
                  borderRight: "1px solid black",
                  display: "flex",
                  pl: 1,
                  alignItems: "center",
                }}
              >
                <Typography>{field.label}</Typography>
              </Grid>
              <Grid size={9} sx={{ p: 1 }}>
                <Checkbox
                  defaultChecked={field.defaultChecked}
                  required={field.required}
                />
              </Grid>
            </Grid>
          );
        }

        if (field.type === "radio" && "options" in field) {
          return (
            <Grid
              container
              key={field.id}
              sx={{ borderBottom: "1px solid black", width: "100%" }}
            >
              <Grid
                size={2}
                sx={{
                  borderRight: "1px solid black",
                  display: "flex",
                  pl: 1,
                  alignItems: "center",
                }}
              >
                <Typography>{field.label}</Typography>
              </Grid>
              <Grid size={9} sx={{ p: 1 }}>
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
              container
              key={field.id}
              sx={{ borderBottom: "1px solid black", width: "100%" }}
            >
              <Grid
                size={2}
                sx={{
                  borderRight: "1px solid black",
                  display: "flex",
                  pl: 1,
                  alignItems: "center",
                }}
              >
                <Typography>{field.label}</Typography>
              </Grid>
              <Grid size={9} sx={{ p: 1 }}>
                <Select
                  defaultValue={field.options[0]?.value}
                  aria-labelledby={`${field.id}-label`}
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

        return null;
      })}
    </Box>
  );
}
