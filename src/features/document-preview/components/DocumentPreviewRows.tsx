import {
  type CanvasItem,
  type FormField,
  isFormField,
  isLayoutContainer,
  isPlainLayout,
} from "@/types/form";
import {
  buildTopLevelFieldOrderMap,
  normalizeSpan,
} from "@/features/document-preview/helpers";
import { Box, Grid, TextField, Typography } from "@mui/material";
import { FieldBody } from "./FieldBody";

interface DocumentPreviewRowsProps {
  items: CanvasItem[];
}

export function DocumentPreviewRows({ items }: DocumentPreviewRowsProps) {
  const rows: React.ReactNode[] = [];
  let currentRowSpan = 0;
  const topLevelOrderById = buildTopLevelFieldOrderMap(items);

  const pushTopLevelFiller = (key: string, span: number) => {
    if (span <= 0) return;
    rows.push(
      <Grid
        key={key}
        size={span}
        sx={{
          borderRight: "1px solid black",
          borderBottom: "1px solid black",
          backgroundColor: "grey",
        }}
      />
    );
  };

  const renderColumnFields = (
    fields: FormField[],
    colIndex: number,
    plain: boolean,
    colLabel?: string
  ) => {
    if (fields.length === 0) {
      return (
        <Grid size={12}>
          <TextField
            disabled
            fullWidth
            aria-label={`${
              plain ? `第${colIndex + 1}欄` : colLabel?.trim() || "未命名欄位"
            }-尚未加入元件`}
            placeholder="尚未加入元件"
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
        </Grid>
      );
    }

    const children: React.ReactNode[] = [];
    let usedSpan = 0;
    for (const [fieldIndex, field] of fields.entries()) {
      const span = normalizeSpan(field.span);
      if (usedSpan + span > 12) {
        children.push(
          <Grid key={`col-fill-wrap-${field.id}`} size={12 - usedSpan} />
        );
        usedSpan = 0;
      }

      const nextField = fields[fieldIndex + 1];
      const nextSpan = nextField ? normalizeSpan(nextField.span) : 0;
      const isLastField = fieldIndex === fields.length - 1;
      const isRowEnd =
        isLastField ||
        usedSpan + span === 12 ||
        usedSpan + span + nextSpan > 12;

      children.push(
        <Grid
          key={field.id}
          size={span}
          sx={{
            borderRight: isRowEnd ? "none" : "1px solid black",
          }}
        >
          <FieldBody
            field={field}
            ariaLabel={`${
              plain ? `第${colIndex + 1}欄` : colLabel?.trim() || "未命名欄位"
            }-${field.type}-${fieldIndex + 1}`}
          />
        </Grid>
      );
      usedSpan += span;
      if (usedSpan === 12) usedSpan = 0;
    }
    if (usedSpan > 0) {
      children.push(
        <Grid key={`col-fill-end-${colIndex}`} size={12 - usedSpan} />
      );
    }
    return children;
  };

  for (const [index, item] of items.entries()) {
    if (isLayoutContainer(item)) {
      if (currentRowSpan > 0 && currentRowSpan < 12) {
        pushTopLevelFiller(
          `filler-before-layout-${item.id}`,
          12 - currentRowSpan
        );
      }
      currentRowSpan = 0;

      const plain = isPlainLayout(item);
      rows.push(
        <Grid
          key={item.id}
          container
          spacing={0}
          size={12}
          alignItems="stretch"
        >
          {item.columns.map((col, colIndex) => (
            <Grid
              container
              key={col.id}
              size={col.span}
              sx={{
                borderRight: "1px solid black",
                borderBottom: "1px solid black",
              }}
            >
              {!plain && (
                <Grid
                  size={4}
                  sx={{
                    p: 1,
                    backgroundColor: "grey.50",
                    borderRight: "1px solid black",
                  }}
                >
                  <Typography variant="body1">
                    {col.label?.trim() ? col.label : "未命名欄位"}
                  </Typography>
                </Grid>
              )}
              <Grid container spacing={0} size={plain ? 12 : 8}>
                {renderColumnFields(col.fields, colIndex, plain, col.label)}
              </Grid>
            </Grid>
          ))}
        </Grid>
      );
      continue;
    }

    if (!isFormField(item)) continue;

    const span = normalizeSpan(item.span);
    if (currentRowSpan + span > 12) {
      pushTopLevelFiller(`filler-wrap-${index}`, 12 - currentRowSpan);
      currentRowSpan = 0;
    }

    const topLevelFieldOrder = topLevelOrderById.get(item.id);
    rows.push(
      <Grid
        key={item.id}
        size={span}
        sx={{
          borderRight: "1px solid black",
          borderBottom: "1px solid black",
          display: "flex",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <FieldBody
            field={item}
            ariaLabel={`${item.type}-${topLevelFieldOrder ?? index + 1}`}
          />
        </Box>
      </Grid>
    );

    currentRowSpan += span;
    if (currentRowSpan === 12) currentRowSpan = 0;
  }

  if (currentRowSpan > 0 && currentRowSpan < 12) {
    pushTopLevelFiller("filler-end", 12 - currentRowSpan);
  }

  return <>{rows}</>;
}
