import type { FormField } from "@/types/form";
import { useMemo, useState } from "react";

import type { FormFillErrors, FormFillValues } from "../types";
import { validateRequiredField } from "../utils/validation";

interface UseFormFillOptions {
  fields: FormField[];
  initialValues?: FormFillValues;
  onSubmitSuccess?: () => void;
}

interface UseFormFillResult {
  values: FormFillValues;
  errors: FormFillErrors;
  handleChange: (fieldId: string, value: FormFillValues[string]) => void;
  validate: () => boolean;
  handleSubmit: () => boolean;
}

export function useFormFill({
  fields,
  initialValues,
  onSubmitSuccess,
}: UseFormFillOptions): UseFormFillResult {
  const [values, setValues] = useState<FormFillValues>(initialValues ?? {});
  const [errors, setErrors] = useState<FormFillErrors>({});

  const fieldMap = useMemo(() => {
    return new Map(fields.map((field) => [field.id, field]));
  }, [fields]);

  const handleChange = (fieldId: string, value: FormFillValues[string]) => {
    setValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [fieldId]: undefined,
    }));
  };

  const validate = () => {
    const nextErrors: FormFillErrors = {};

    fields.forEach((field) => {
      const errorMessage = validateRequiredField(field, values[field.id]);
      if (errorMessage) {
        nextErrors[field.id] = errorMessage;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    const valid = validate();
    if (!valid) {
      return false;
    }

    // 僅處理 schema 內欄位；schema 外殘留值不參與流程。
    Object.keys(values).forEach((fieldId) => {
      if (!fieldMap.has(fieldId)) {
        return;
      }
    });

    onSubmitSuccess?.();
    return true;
  };

  return {
    values,
    errors,
    handleChange,
    validate,
    handleSubmit,
  };
}
