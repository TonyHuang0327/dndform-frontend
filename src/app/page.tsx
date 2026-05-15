"use client";

import dynamic from "next/dynamic";

const FormBuilderContent = dynamic(
  () => import("@/components/FormBuilderContent"),
  { ssr: false }
);

export default function Home() {
  return <FormBuilderContent />;
}
