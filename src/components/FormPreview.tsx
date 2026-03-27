"use client";

import {
  type CanvasItem,
  type FormField,
  isPlainLayout,
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

const LABEL_WIDTH = 150;

export interface FormPreviewProps {
  items: CanvasItem[];
  formTitle: string;
}

function FieldBody({
  field,
  ariaLabel,
}: {
  field: FormField;
  ariaLabel: string;
}) {
  if (
    field.type === "text" ||
    field.type === "textarea" ||
    field.type === "number"
  ) {
    return (
      <TextField
        fullWidth
        aria-label={ariaLabel}
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
            padding: 1,
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
        aria-label={ariaLabel}
        sx={{
          p: 0,
        }}
      />
    );
  }

  if (field.type === "radio" && "options" in field) {
    return (
      <RadioGroup
        defaultValue={field.options[0]?.value}
        aria-label={ariaLabel}
        sx={{
          "& .MuiRadio-root": {
            padding: 0,
            paddingLeft: 1,
          },
        }}
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
        aria-label={ariaLabel}
        required={field.required}
        size="small"
        sx={{
          "& .MuiOutlinedInput-notchedOutline": { border: "none" },
          "& .MuiOutlinedInput-input": { padding: 0 },
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

  if (field.type === "labeled-input") {
    return (
      <Box
        sx={{
          width: LABEL_WIDTH,
          backgroundColor: "grey.50",
          borderRight: "1px solid black",
          p: 1,
        }}
      >
        <Typography variant="body1">
          {field.label?.trim() ? field.label : "未命名欄位"}
        </Typography>
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
  const topLevelOrderById = new Map<string, number>();
  let order = 0;
  for (const candidate of items) {
    if (isFormField(candidate)) {
      order += 1;
      topLevelOrderById.set(candidate.id, order);
    }
  }

  return (
    <Grid
      container
      spacing={0}
      sx={{
        borderBottom: "1px solid black",
        borderLeft: "1px solid black",
        borderRight: "1px solid black",
        aspectRatio: "457/647",
        width: "70%",
        boxSizing: "border-box",
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
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {formTitle}
        </Typography>
      </Grid>

      {/* 逐項渲染 */}
      {items.map((item) => {
        if (isLayoutContainer(item)) {
          const plain = isPlainLayout(item);
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
                      flexDirection: "row",
                    }}
                  >
                    {!plain && (
                      <Box
                        sx={{
                          p: 1,
                          width: LABEL_WIDTH,
                          backgroundColor: "grey.50",
                          borderRight: "1px solid black",
                        }}
                      >
                        <Typography variant="body1">
                          {col.label?.trim() ? col.label : "未命名欄位"}
                        </Typography>
                      </Box>
                    )}
                    {col.fields.length === 0 ? (
                      <Box sx={{ flex: 1 }}>
                        <TextField
                          fullWidth
                          aria-label={`${
                            plain
                              ? `第${colIndex + 1}欄`
                              : col.label?.trim() || "未命名欄位"
                          }-尚未加入元件`}
                          placeholder="尚未加入元件-預設為文字輸入框"
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
                              padding: 1,
                            },
                          }}
                        />
                      </Box>
                    ) : (
                      col.fields.map((field, fieldIndex) => (
                        <Box
                          key={field.id}
                          sx={{
                            display: "flex",
                            flex: 1,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <FieldBody
                              field={field}
                              ariaLabel={`${
                                plain
                                  ? `第${colIndex + 1}欄`
                                  : col.label?.trim() || "未命名欄位"
                              }-${field.type}-${fieldIndex + 1}`}
                            />
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
          const topLevelFieldOrder = topLevelOrderById.get(item.id);

          return (
            <Grid
              key={item.id}
              container
              spacing={0}
              size={12}
              alignItems="stretch"
              sx={{ borderBottom: "1px solid black" }}
            >
              <Box sx={{ flex: 1 }}>
                <FieldBody
                  field={item}
                  ariaLabel={`${item.type}-${topLevelFieldOrder}`}
                />
              </Box>
            </Grid>
          );
        }

        return null;
      })}
    </Grid>
  );
}
