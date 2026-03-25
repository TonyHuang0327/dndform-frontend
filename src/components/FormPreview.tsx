"use client";

import {
  type CanvasItem,
  type FormField,
  isLayoutContainer,
  isFormField,
} from "@/types/form";
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
  items: CanvasItem[];
  formTitle: string;
}


function FieldBody({ field }: { field: FormField }) {
  if (
    field.type === "text" ||
    field.type === "textarea" ||
    field.type === "number"
  ) {
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

export default function FormPreview({ items, formTitle }: FormPreviewProps) {
  if (items.length === 0) {
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
        borderRight: "1px solid black",
        boxSizing: "border-box",
        width: "457px",
        margin: "0 auto",
        alignContent: "flex-start",
      }}
    >
      {/* 表單標題列 */}
      <Grid
        size={12}
        sx={{
          p: 1,
          borderTop: "1px solid black",
          borderBottom: "1px solid black",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          {formTitle}
        </Typography>
      </Grid>

      {/* 逐項渲染 */}
      {items.map((item) => {
        if (isLayoutContainer(item)) {
          return (
            <Grid
              key={item.id}
              container
              spacing={0}
              size={12}
              alignItems="stretch"
              sx={{ borderBottom: "1px solid black" }}
            >
              {item.columns.map((col, colIndex) => {
                const isLastCol = colIndex === item.columns.length - 1;
                return (
                  <Grid
                    key={col.id}
                    size={col.span}
                    sx={{
                      borderRight: isLastCol ? "none" : "1px solid black",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {col.fields.length === 0 ? (
                      <Box sx={{ minHeight: 40 }} />
                    ) : (
                      col.fields.map((field, fieldIndex) => (
                        <Box
                          key={field.id}
                          sx={{
                            display: "flex",
                            borderTop:
                              fieldIndex > 0 ? "1px solid black" : "none",
                          }}
                        >
                          <FieldLabel field={field} />
                          <Box sx={{ flex: 1, p: 1 }}>
                            <FieldBody field={field} />
                          </Box>
                        </Box>
                      ))
                    )}
                  </Grid>
                );
              })}
            </Grid>
          );
        }

        if (isFormField(item)) {
          return (
            <Grid
              key={item.id}
              container
              spacing={0}
              size={12}
              alignItems="stretch"
              sx={{ borderBottom: "1px solid black" }}
            >
              <FieldLabel field={item} />
              <Grid size={10} sx={{ p: 1 }}>
                <FieldBody field={item} />
              </Grid>
            </Grid>
          );
        }

        return null;
      })}
    </Grid>
  );
}
