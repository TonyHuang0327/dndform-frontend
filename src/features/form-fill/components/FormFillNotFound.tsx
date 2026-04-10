import { Alert, Button, Stack } from "@mui/material";
import Link from "next/link";

export function FormFillNotFound() {
  return (
    <Stack spacing={2}>
      <Alert severity="warning">查無表單</Alert>
      <Button component={Link} href="/" variant="outlined">
        返回首頁
      </Button>
    </Stack>
  );
}
