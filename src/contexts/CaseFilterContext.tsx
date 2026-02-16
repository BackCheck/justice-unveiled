import { createContext, useContext, useState, ReactNode } from "react";

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

  return (
    <CaseFilterContext.Provider value={{ selectedCaseId, setSelectedCaseId }}>
      {children}
    </CaseFilterContext.Provider>
  );
};
