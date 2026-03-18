"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import dynamic from "next/dynamic";

const FormBuilderContent = dynamic(
  () => import("@/components/FormBuilderContent"),
  { ssr: false }
);
const queryClient = new QueryClient();
export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <FormBuilderContent />
    </QueryClientProvider>
  );
}
