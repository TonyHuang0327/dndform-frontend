"use client";

import { queryClient } from "@/queries/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { useEffect } from "react";

async function enableMocking() {
  // 僅 NEXT_PUBLIC_* 會內嵌到瀏覽器 bundle
  if (process.env.NEXT_PUBLIC_DEV_MODE !== "true") {
    return;
  }
  const { worker } = await import("@/mocks/browser");
  return worker.start();
}

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    void enableMocking();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
