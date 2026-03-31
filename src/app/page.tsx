"use client";

import { queryClient } from "@/queries/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import dynamic from "next/dynamic";

const FormBuilderContent = dynamic(
  () => import("@/components/FormBuilderContent"),
  { ssr: false }
);
export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <FormBuilderContent />
    </QueryClientProvider>
  );
}
