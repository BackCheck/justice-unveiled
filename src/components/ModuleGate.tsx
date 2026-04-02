import { Navigate } from "react-router-dom";
import { useIsModuleEnabled } from "@/hooks/useModules";

interface ModuleGateProps {
  route: string;
  children: React.ReactNode;
}

export function ModuleGate({ route, children }: ModuleGateProps) {
  const { isRouteEnabled } = useIsModuleEnabled();
  
  if (!isRouteEnabled(route)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}
