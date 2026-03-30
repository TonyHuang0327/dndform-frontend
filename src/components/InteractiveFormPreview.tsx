"use client";

import {
  type CanvasItem,
  type FormField,
  isFormField,
  isLayoutContainer,
  isPlainLayout,
} from "@/types/form";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { type Dispatch, type SetStateAction, useMemo, useState } from "react";

type PrimitiveValue = string | number | boolean;
type FieldValues = Record<string, unknown>;
type FieldErrorMap = Record<string, string>;

interface FlattenedFieldEntry {
  id: string;
  field: FormField;
}

export interface InteractiveFormPreviewProps {
  items: CanvasItem[];
  formTitle: string;
  formValues: FieldValues;
  setFormValues: Dispatch<SetStateAction<FieldValues>>;
  submitSuccessOpen: boolean;
  setSubmitSuccessOpen: Dispatch<SetStateAction<boolean>>;
}

function isInteractiveField(field: FormField): boolean {
  return (
    field.type === "text" ||
    field.type === "textarea" ||
    field.type === "number" ||
    field.type === "checkbox" ||
    field.type === "radio" ||
    field.type === "select"
  );
}

function flattenFields(items: CanvasItem[]): FlattenedFieldEntry[] {
  const flattened: FlattenedFieldEntry[] = [];
  const seen = new Set<string>();

  const pushField = (field: FormField) => {
    if (seen.has(field.id)) {
      console.warn(`偵測到重複欄位 id：${field.id}，將採用首次出現者`);
      return;
    }
    seen.add(field.id);
    flattened.push({ id: field.id, field });
  };

  for (const item of items) {
    if (isFormField(item)) {
      pushField(item);
      continue;
    }
    if (isLayoutContainer(item)) {
      for (const col of item.columns) {
        for (const field of col.fields) {
          pushField(field);
        }
      }
    }
  }

  return flattened;
}

function parseNumberValue(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string" || value.trim() === "") return Number.NaN;
  return Number(value);
}

function validateFieldValue(field: FormField, value: unknown): string | null {
  if (!field.required || !isInteractiveField(field)) return null;

  if (field.type === "text" || field.type === "textarea") {
    if (typeof value !== "string" || value.trim() === "") return "此欄位為必填";
    return null;
  }

  if (field.type === "number") {
    const parsed = parseNumberValue(value);
    if (Number.isNaN(parsed)) return "請輸入有效數字";
    return null;
  }

  if (field.type === "checkbox") {
    if (value !== true) return "此欄位為必填";
    return null;
  }

  if (field.type === "radio" || field.type === "select") {
    if (typeof value !== "string" || value === "") return "請選擇一個選項";
    const optionValues = new Set((field.options ?? []).map((opt) => opt.value));
    if (!optionValues.has(value)) return "請選擇有效選項";
    return null;
  }

  return null;
}

function buildSubmitPayload(
  flattened: FlattenedFieldEntry[],
  formValues: FieldValues
): Record<string, PrimitiveValue> {
  const payload: Record<string, PrimitiveValue> = {};

  for (const { id, field } of flattened) {
    if (!isInteractiveField(field)) continue;
    const rawValue = formValues[id];
    if (field.type === "number") {
      const parsed = parseNumberValue(rawValue);
      if (!Number.isNaN(parsed)) payload[id] = parsed;
      continue;
    }
    if (field.type === "checkbox") {
      payload[id] = rawValue === true;
      continue;
    }
    payload[id] = typeof rawValue === "string" ? rawValue : "";
  }
  console.log(payload);
  return payload;
}

export default function InteractiveFormPreview({
  items,
  formTitle,
  formValues,
  setFormValues,
  submitSuccessOpen,
  setSubmitSuccessOpen,
}: InteractiveFormPreviewProps) {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});

  const flattened = useMemo(() => flattenFields(items), [items]);
  const interactiveFields = useMemo(
    () => flattened.filter((entry) => isInteractiveField(entry.field)),
    [flattened]
  );

  function renderInteractiveField(field: FormField, id: string) {
    const errorText = fieldErrors[id];
    const hasError = Boolean(errorText);
    const span = field.span ?? 12;

    if (field.type === "text" || field.type === "textarea") {
      return (
        <Grid key={id} size={span}>
          <TextField
            fullWidth
            value={
              typeof formValues[id] === "string"
                ? (formValues[id] as string)
                : ""
            }
            onChange={(event) => updateValue(id, event.target.value)}
            multiline={field.type === "textarea"}
            minRows={field.type === "textarea" ? 3 : undefined}
            required={field.required}
            placeholder={field.placeholder}
            error={hasError}
            helperText={errorText}
          />
        </Grid>
      );
    }

    if (field.type === "number") {
      return (
        <Grid key={id} size={span}>
          <TextField
            fullWidth
            type="number"
            value={
              typeof formValues[id] === "string"
                ? (formValues[id] as string)
                : ""
            }
            onChange={(event) => updateValue(id, event.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            error={hasError}
            helperText={errorText}
          />
        </Grid>
      );
    }

    if (field.type === "checkbox") {
      return (
        <Grid key={id} size={span}>
          <FormControl
            required={field.required}
            error={hasError}
            component="fieldset"
          >
            <Checkbox
              checked={formValues[id] === true}
              onChange={(event) => updateValue(id, event.target.checked)}
            />
            {hasError && <FormHelperText>{errorText}</FormHelperText>}
          </FormControl>
        </Grid>
      );
    }

    if (field.type === "radio") {
      return (
        <Grid key={id} size={span}>
          <FormControl required={field.required} error={hasError}>
            <RadioGroup
              value={
                typeof formValues[id] === "string"
                  ? (formValues[id] as string)
                  : ""
              }
              onChange={(event) => updateValue(id, event.target.value)}
              sx={{
                flexDirection: "row",
              }}
            >
              {field.options.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  value={opt.value}
                  control={<Radio />}
                  label={opt.label}
                />
              ))}
            </RadioGroup>
            {hasError && <FormHelperText>{errorText}</FormHelperText>}
          </FormControl>
        </Grid>
      );
    }

    if (field.type === "select") {
      return (
        <Grid key={id} size={span}>
          <FormControl fullWidth required={field.required} error={hasError}>
            <Select
              value={
                typeof formValues[id] === "string"
                  ? (formValues[id] as string)
                  : ""
              }
              onChange={(event) => updateValue(id, event.target.value)}
            >
              <MenuItem value="">
                <em>請選擇</em>
              </MenuItem>
              {field.options.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            {hasError && <FormHelperText>{errorText}</FormHelperText>}
          </FormControl>
        </Grid>
      );
    }

    return (
      <Grid key={id} size={span}>
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          {field.label}
        </Typography>
      </Grid>
    );
  }

  function updateValue(fieldId: string, value: unknown) {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
    if (!hasSubmitted) return;
    const target = interactiveFields.find((entry) => entry.id === fieldId);
    if (!target) return;
    const nextError = validateFieldValue(target.field, value);
    setFieldErrors((prev) => {
      if (!nextError) {
        const rest = { ...prev };
        delete rest[fieldId];
        return rest;
      }
      return { ...prev, [fieldId]: nextError };
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHasSubmitted(true);
    const errors: FieldErrorMap = {};

    for (const { id, field } of interactiveFields) {
      const message = validateFieldValue(field, formValues[id]);
      if (message) errors[id] = message;
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    buildSubmitPayload(flattened, formValues);
    setSubmitSuccessOpen(true);
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, width: "70%", margin: "0 auto" }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        {formTitle}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={1}>
          {items.map((item) => {
            if (isFormField(item)) {
              return renderInteractiveField(item, item.id);
            }

            if (isLayoutContainer(item)) {
              const plain = isPlainLayout(item);
              return (
                <Grid key={item.id} size={12}>
                  <Grid container spacing={2}>
                    {item.columns.map((col, colIndex) => (
                      <Grid key={col.id} size={col.span}>
                        <Box sx={{ height: "100%" }}>
                          {!plain && (
                            <Typography
                              variant="body1"
                              sx={{ mb: 1, fontWeight: "bold" }}
                            >
                              {col.label?.trim()
                                ? col.label
                                : `欄位 ${colIndex + 1}`}
                            </Typography>
                          )}
                          {col.fields.length === 0 ? (
                            <TextField
                              fullWidth
                              value=""
                              placeholder="此欄暫無可填欄位"
                              variant="outlined"
                            />
                          ) : (
                            <Grid container spacing={2}>
                              {col.fields.map((field) =>
                                renderInteractiveField(field, field.id)
                              )}
                            </Grid>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              );
            }

            return null;
          })}
        </Grid>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button type="submit" variant="contained">
            送出
          </Button>
        </Stack>
      </Box>

      <Snackbar
        open={submitSuccessOpen}
        autoHideDuration={2400}
        onClose={() => setSubmitSuccessOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSubmitSuccessOpen(false)}
          severity="success"
          variant="filled"
        >
          表單送出成功
        </Alert>
      </Snackbar>
    </Paper>
  );
}
