"use client";

import * as React from "react";
import { Alert, Box, Snackbar } from "@mui/material";

import { FormFillNotFound } from "./FormFillNotFound";
import { FormFillRenderer } from "./FormFillRenderer";
import { getMockFormSchemaById } from "../mocks/mockFormSchemas";
import { isValidFormSchema } from "../utils/schema-guards";

export function FormFillPageContent({ formId }: { formId: string }) {
  const schema = getMockFormSchemaById(formId);
  const [openSuccess, setOpenSuccess] = React.useState(false);

  if (!schema) {
    return <FormFillNotFound />;
  }

  if (!isValidFormSchema(schema)) {
    return <Alert severity="error">表單資料格式異常，請稍後再試</Alert>;
  }

  return (
    <Box sx={{ mt: 2, width: "100%" }}>
      <FormFillRenderer
        items={schema.items}
        formTitle={schema.formTitle}
        onSubmitSuccess={() => setOpenSuccess(true)}
      />
      <Snackbar
        open={openSuccess}
        autoHideDuration={2400}
        onClose={() => setOpenSuccess(false)}
      >
        <Alert severity="success">送出成功</Alert>
      </Snackbar>
    </Box>
  );
}
