import { apiOcrList } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";

export const useOcrList = () => {
  return useQuery({
    queryKey: queryKeys.ocrList,
    queryFn: () => apiOcrList(),
  });
};
