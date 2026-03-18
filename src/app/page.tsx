"use client";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import dynamic from "next/dynamic";

const FormBuilderContent = dynamic(
  () => import("@/components/FormBuilderContent"),
  { ssr: false }
);

export default function Home() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <FormBuilderContent />
    </QueryClientProvider>
  );
}
