import { AutoReportEngine } from "@/components/financial/reports/AutoReportEngine";
import type { FinancialFinding, FinancialActor, FinancialInvestigation } from "@/hooks/useFinancialAbuse";
import type { ReportType } from "@/components/financial/reports/ReportTypeSelector";

interface Props {
  investigations?: FinancialInvestigation[];
  findings?: FinancialFinding[];
  actors?: FinancialActor[];
  evidence?: any[];
  stats?: any;
  initialReportType?: ReportType;
}

export const ReportsView = ({
  investigations = [],
  findings = [],
  actors = [],
  evidence = [],
  stats = {},
  initialReportType,
}: Props) => {
  return (
    <AutoReportEngine
      investigations={investigations}
      findings={findings}
      actors={actors}
      evidence={evidence}
      stats={stats}
      initialReportType={initialReportType}
    />
  );
};
