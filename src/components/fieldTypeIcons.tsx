"use client";

import type { ReactNode } from "react";
import type { FormFieldType } from "@/types/form";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import SubjectIcon from "@mui/icons-material/Subject";
import PinIcon from "@mui/icons-material/Pin";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import ArrowDropDownCircleIcon from "@mui/icons-material/ArrowDropDownCircle";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import TitleIcon from "@mui/icons-material/Title";

/** 欄位型別對應圖示（元件庫與畫布卡片共用） */
export const FIELD_TYPE_ICONS: Record<FormFieldType, ReactNode> = {
  text: <TextFieldsIcon fontSize="small" />,
  textarea: <SubjectIcon fontSize="small" />,
  number: <PinIcon fontSize="small" />,
  checkbox: <CheckBoxIcon fontSize="small" />,
  radio: <RadioButtonCheckedIcon fontSize="small" />,
  select: <ArrowDropDownCircleIcon fontSize="small" />,
  "ocr-list": <DocumentScannerIcon fontSize="small" />,
  "labeled-input": <TitleIcon fontSize="small" />,
};
