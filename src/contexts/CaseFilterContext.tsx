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

  // Fetch the most recent case to use as default
  const { data: mostRecentCase } = useQuery({
    queryKey: ["most-recent-case-default"],
    queryFn: async () => {
      const { data } = await supabase
        .from("cases")
        .select("id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
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
