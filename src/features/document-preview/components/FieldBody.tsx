import { type FormField } from "@/types/form";
import {
  TextField,
  Checkbox,
  RadioGroup,
  Select,
  MenuItem,
  Typography,
  Box,
  FormControlLabel,
  Radio,
} from "@mui/material";

export interface FieldBodyProps {
  field: FormField;
  ariaLabel: string;
  titleBackgroundColor: string;
  titleFontColor: string;
}

export function FieldBody({
  field,
  ariaLabel,
  titleBackgroundColor,
  titleFontColor,
}: FieldBodyProps) {
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
          p: 1,
        }}
      />
    );
  }

  if (field.type === "radio") {
    return (
      <RadioGroup
        defaultValue={field.options[0]?.value ?? ""}
        aria-label={ariaLabel}
        sx={{ pl: 1 }}
      >
        {field.options.map((opt) => (
          <FormControlLabel
            key={opt.value}
            value={opt.value}
            control={<Radio />}
            label={opt.label}
            required={field.required}
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
          "& .MuiOutlinedInput-input": { padding: 1 },
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
      );
    }

    return (
      <Box>
        {selectedOcr.map((ocr, index) => (
          <Box
            key={ocr.id}
            sx={{
              p: 1,
              borderBottom:
                index === selectedOcr.length - 1 ? "none" : "1px solid black",
            }}
          >
            <Typography variant="body1">{ocr.name}</Typography>
          </Box>
        ))}
      </Box>
    );
  }

  if (field.type === "labeled-input") {
    return (
      <Typography
        variant="body1"
        sx={{
          p: 1,
          backgroundColor: titleBackgroundColor,
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          color: titleFontColor,
        }}
      >
        {field.label?.trim() ? field.label : "未命名欄位"}
      </Typography>
    );
  }

  return null;
}
