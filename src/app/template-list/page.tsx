"use client";

import CreateTemplateDialog from "@/components/template-list/CreateTemplateDialog";
import { useTemplateList } from "@/queries/use-template-list";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useState } from "react";

function formatUpdatedAt(iso: string) {
  try {
    return new Date(iso).toLocaleString("zh-TW", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function TemplateListPage() {
  const { data, isPending, isError, error, isSuccess } = useTemplateList();
  const [createOpen, setCreateOpen] = useState(false);
  /** 每次開啟對話框遞增，強制重掛以重設表單與 mutation 狀態 */
  const [createDialogKey, setCreateDialogKey] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" component="h1">
          表單模板列表
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setCreateDialogKey((k) => k + 1);
            setCreateOpen(true);
          }}
          disabled={isPending}
        >
          新增模板
        </Button>
      </Stack>

      <CreateTemplateDialog
        key={createDialogKey}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {isPending && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress aria-label="載入中" />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : "載入模板列表失敗"}
        </Alert>
      )}

      {isSuccess && (!data || data.length === 0) && (
        <Alert severity="info">尚無可顯示的模板。</Alert>
      )}

      {isSuccess && data && data.length > 0 && (
        <TableContainer component={Paper} elevation={1}>
          <Table size="medium" aria-label="表單模板列表">
            <TableHead>
              <TableRow>
                <TableCell>名稱</TableCell>
                <TableCell>說明</TableCell>
                <TableCell width={200}>更新時間</TableCell>
                <TableCell width={120} align="center">
                  可編輯
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>{formatUpdatedAt(row.updatedAt)}</TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={row.canEdit ? "是" : "否"}
                      color={row.canEdit ? "success" : "default"}
                      variant={row.canEdit ? "filled" : "outlined"}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
