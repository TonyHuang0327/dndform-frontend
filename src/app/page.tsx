"use client";

import { queryClient } from "@/queries/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const FormBuilderContent = dynamic(
  () => import("@/components/FormBuilderContent"),
  { ssr: false }
);
export default function Home() {
  async function enableMocking() {
    // 僅 NEXT_PUBLIC_* 會內嵌到瀏覽器 bundle；
    if (process.env.NEXT_PUBLIC_DEV_MODE !== "true") {
      return;
    }

    const { worker } = await import("@/mocks/browser");

    return worker.start()
  }
  useEffect(() => {
    enableMocking()
  }, [])
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <FormBuilderContent />
    </QueryClientProvider>
  );
}
