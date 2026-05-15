"use client";

import { useCreateTemplate } from "@/queries/use-create-template";
import { templateCreateBodySchema } from "@/schemas/template-create";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { isAxiosError } from "axios";
import { type FormEvent, useState } from "react";

type FieldErrors = Partial<
  Record<"name" | "description" | "canEdit", string[]>
>;

function firstMessage(errors: string[] | undefined) {
  return errors?.[0];
}

export type CreateTemplateDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function CreateTemplateDialog({
  open,
  onClose,
}: CreateTemplateDialogProps) {
  const { mutateAsync, isPending, isError, error } = useCreateTemplate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function handleClose() {
    if (isPending) return;
    onClose();
  }

  async function handleSubmit() {
    setFieldErrors({});
    const parsed = templateCreateBodySchema.safeParse({
      name,
      description,
      canEdit,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    try {
      await mutateAsync(parsed.data);
      onClose();
    } catch {
      // 錯誤由 isError / error 顯示
    }
  }

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void handleSubmit();
  }

  const serverMessage = (() => {
    if (!isError || !error) return null;
    if (isAxiosError(error)) {
      const msg = error.response?.data as { message?: string } | undefined;
      return msg?.message ?? error.message;
    }
    return error instanceof Error ? error.message : "建立失敗";
  })();

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>新增表單模板</DialogTitle>
      <form onSubmit={handleFormSubmit} noValidate>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {isError && serverMessage && (
              <Alert severity="error">{serverMessage}</Alert>
            )}
            <TextField
              required
              label="名稱"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={Boolean(fieldErrors.name)}
              helperText={firstMessage(fieldErrors.name)}
              disabled={isPending}
              fullWidth
              autoFocus
            />
            <TextField
              label="說明"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={Boolean(fieldErrors.description)}
              helperText={firstMessage(fieldErrors.description)}
              disabled={isPending}
              fullWidth
              multiline
              minRows={3}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={canEdit}
                  onChange={(e) => setCanEdit(e.target.checked)}
                  disabled={isPending}
                />
              }
              label="可編輯"
            />
            {fieldErrors.canEdit && (
              <Alert severity="warning">
                {firstMessage(fieldErrors.canEdit)}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={handleClose} disabled={isPending}>
            取消
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            建立
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
