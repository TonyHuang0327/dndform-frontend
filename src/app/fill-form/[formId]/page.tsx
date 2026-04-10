import { FormFillPageContent } from "@/features/form-fill/components/FormFillPageContent";

interface FillFormPageProps {
  params: Promise<{ formId: string }>;
}

export default async function FillFormPage({ params }: FillFormPageProps) {
  const resolvedParams = await params;
  return <FormFillPageContent formId={resolvedParams.formId} />;
}
