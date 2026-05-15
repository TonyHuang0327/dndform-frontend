import { fetchAccessibleTemplates } from "@/services/template";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";

export function useTemplateList() {
  return useQuery({
    queryKey: queryKeys.templateList,
    queryFn: fetchAccessibleTemplates,
  });
}
