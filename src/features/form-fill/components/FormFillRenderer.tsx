import { flattenFields } from "@/features/form-preview/helpers";
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
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo } from "react";

import { useFormFill } from "../hooks/useFormFill";
import { FormFillField } from "./FormFillField";

const DEFAULT_TITLE_BACKGROUND_COLOR = "#f5f5f5";
const DEFAULT_TITLE_FONT_COLOR = "#111111";

interface FormFillRendererProps {
  items: CanvasItem[];
  formTitle: string;
  titleBackgroundColor?: string;
  titleFontColor?: string;
  onSubmitSuccess?: () => void;
}

export function FormFillRenderer({
  items,
  formTitle,
  titleBackgroundColor = DEFAULT_TITLE_BACKGROUND_COLOR,
  titleFontColor = DEFAULT_TITLE_FONT_COLOR,
  onSubmitSuccess,
}: FormFillRendererProps) {
  const fields = useMemo(() => flattenFields(items), [items]);
  const { values, errors, handleChange, handleSubmit } = useFormFill({
    fields,
    onSubmitSuccess,
  });

  function renderFillField(field: FormField, id: string) {
    const span = field.span ?? 12;

    if (field.type === "ocr-list") {
      const selectedOcr = field.selectedOcr ?? [];
      return (
        <Grid key={id} size={span}>
          {selectedOcr.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                p: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                尚未選擇 OCR
              </Typography>
            </Box>
          ) : (
            <Box>
              {selectedOcr.map((ocr, index) => (
                <Box
                  key={ocr.id}
                  sx={{
                    p: 1,
                    borderBottom:
                      index === selectedOcr.length - 1
                        ? "none"
                        : "1px solid black",
                  }}
                >
                  <Typography variant="body1">{ocr.name}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Grid>
      );
    }

    if (field.type === "labeled-input") {
      return (
        <Grid key={id} size={span}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: "bold",
              color: titleFontColor,
              p: 1,
              backgroundColor: titleBackgroundColor,
              borderRadius: 1,
              width: "fit-content",
            }}
          >
            {field.label}
          </Typography>
        </Grid>
      );
    }

    return (
      <Grid key={id} size={span}>
        <FormFillField
          field={field}
          value={values[id]}
          error={errors[id]}
          onChange={(value) => handleChange(id, value)}
        />
      </Grid>
    );
  }

  if (fields.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 2, width: "70%", margin: "0 auto" }}>
        <Box
          sx={{
            mb: 2,
            p: 1,
            backgroundColor: titleBackgroundColor,
            borderRadius: 1,
            width: "100%",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: titleFontColor,
              textAlign: "center",
            }}
          >
            {formTitle}
          </Typography>
        </Box>
        <Stack spacing={2}>
          <Alert severity="info">此表單目前沒有可填寫欄位</Alert>
          <Button type="button" variant="contained" disabled>
            送出
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, width: "70%", margin: "0 auto" }}>
      <Box
        sx={{
          mb: 2,
          p: 1,
          backgroundColor: titleBackgroundColor,
          borderRadius: 1,
          width: "100%",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: titleFontColor,
            textAlign: "center",
          }}
        >
          {formTitle}
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
        noValidate
      >
        <Grid container spacing={1}>
          {items.map((item) => {
            if (isFormField(item)) {
              return renderFillField(item, item.id);
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
                              sx={{
                                mb: 1,
                                fontWeight: "bold",
                                color: titleFontColor,
                                p: 1,
                                backgroundColor: titleBackgroundColor,
                                borderRadius: 1,
                                width: "fit-content",
                              }}
                            >
                              {col.label?.trim()
                                ? col.label
                                : `欄位 ${colIndex + 1}`}
                            </Typography>
                          )}
                          {col.fields.length === 0 ? (
                            <TextField
                              disabled
                              fullWidth
                              value=""
                              placeholder="尚未加入元件"
                              variant="outlined"
                            />
                          ) : (
                            <Grid container spacing={2}>
                              {col.fields.map((field) =>
                                renderFillField(field, field.id)
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
    </Paper>
  );
}
