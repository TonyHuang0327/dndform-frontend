import { createTemplate } from "@/services/template";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "./query-client";
import { queryKeys } from "./keys";

export function useCreateTemplate() {
  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.templateList });
    },
  });
}
