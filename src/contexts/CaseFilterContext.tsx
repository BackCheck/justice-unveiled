import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CaseFilterContextType {
  selectedCaseId: string | null; // null means "All Cases"
  setSelectedCaseId: (caseId: string | null) => void;
}

const CaseFilterContext = createContext<CaseFilterContextType>({
  selectedCaseId: null,
  setSelectedCaseId: () => {},
});

export const useCaseFilter = () => useContext(CaseFilterContext);

export const CaseFilterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Fetch the featured case to use as default
  const { data: featuredCase } = useQuery({
    queryKey: ["featured-case-default"],
    queryFn: async () => {
      const { data } = await supabase
        .from("cases")
        .select("id")
        .eq("is_featured", true)
        .limit(1)
        .single();
      return data;
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!initialized && featuredCase?.id) {
      setSelectedCaseId(featuredCase.id);
      setInitialized(true);
    }
  }, [featuredCase, initialized]);

  return (
    <CaseFilterContext.Provider value={{ selectedCaseId, setSelectedCaseId }}>
      {children}
    </CaseFilterContext.Provider>
  );
};
