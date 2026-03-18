import { apiOcrList } from "@/services";
import { useQuery } from "@tanstack/react-query";

export const useOcrList = () => {
  return useQuery({
    queryKey: ["ocrList"],
    queryFn: () => apiOcrList(),
  });
};
